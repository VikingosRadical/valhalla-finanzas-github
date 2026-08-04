(function () {
  const dataApi = window.VALHALLA.data;
  const financeApi = window.VALHALLA.finance;

  const state = dataApi.loadState();

  const els = {
    sections: {
      home: document.getElementById('home'),
      register: document.getElementById('register'),
      clients: document.getElementById('clients'),
      trainings: document.getElementById('trainings'),
      settings: document.getElementById('settings')
    },
    metrics: {
      initialCash: document.getElementById('initialCash'),
      incomes: document.getElementById('incomes'),
      expenses: document.getElementById('expenses'),
      available: document.getElementById('available'),
      projection: document.getElementById('projection'),
      savings: document.getElementById('saving'),
      pending: document.getElementById('pending')
    },
    advice: document.getElementById('advice'),
    upcoming: document.getElementById('upcoming'),
    movementsTable: document.getElementById('movementsTable'),
    form: document.getElementById('movementForm'),
    formMessage: document.getElementById('formMessage'),
    clientList: document.getElementById('clientList'),
    trainingsStudents: document.getElementById('trainingsStudents'),
    routineForm: document.getElementById('routineForm'),
    routineMessage: document.getElementById('routineMessage'),
    reserve: document.getElementById('reserve'),
    magicBudget: document.getElementById('magicBudget'),
    antBudget: document.getElementById('antBudget'),
    savingsGoal: document.getElementById('savingsGoal'),
    fileInput: document.getElementById('fileInput'),
    importMessage: document.getElementById('importMessage'),
    initialCashInput: document.getElementById('initialCashInput'),
    cashForm: document.getElementById('cashForm')
  };

  function persist() {
    dataApi.saveState(state);
    render();
  }

  function show(section) {
    Object.entries(els.sections).forEach(([name, element]) => {
      element.classList.toggle('hidden', name !== section);
    });
    document.querySelectorAll('[data-nav]').forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-nav') === section);
    });
  }

  function renderDashboard() {
    const dashboard = financeApi.calculateDashboard(state, new Date());
    els.metrics.initialCash.textContent = financeApi.formatCurrency(Number(state.profile.initial_cash || 0));
    els.metrics.incomes.textContent = financeApi.formatCurrency(dashboard.incomesReceived);
    els.metrics.expenses.textContent = financeApi.formatCurrency(dashboard.expensesMade);
    els.metrics.available.textContent = financeApi.formatCurrency(dashboard.realAvailable);
    els.metrics.projection.textContent = financeApi.formatCurrency(dashboard.projection);
    els.metrics.savings.textContent = financeApi.formatCurrency(dashboard.suggestedSavings);
    els.metrics.pending.textContent = financeApi.formatCurrency(dashboard.pendingCommitments);
    els.initialCashInput.value = Number(state.profile.initial_cash || 0);

    let adviceText = '';
    if (dashboard.realAvailable < Number(state.profile.minimum_reserve || 0)) {
      adviceText = '⚠️ El dinero real disponible está por debajo de la reserva mínima. Considera postergar gastos no esenciales.';
    } else if (dashboard.suggestedSavings > 0) {
      adviceText = `✅ Podrías separar ${financeApi.formatCurrency(dashboard.suggestedSavings)} para ahorro este mes.`;
    } else {
      adviceText = '✅ Tu situación está estable. Mantén el control de los gastos hormiga.';
    }
    els.advice.textContent = adviceText;

    if (dashboard.upcomingItems.length) {
      els.upcoming.innerHTML = dashboard.upcomingItems.slice(0, 8).map((item) => `
        <div class="list-item">
          <div>
            <strong>${item.name}</strong>
            <div class="meta">${item.date.toLocaleDateString('es-CL')}</div>
          </div>
          <div class="${item.type === 'income' ? 'ok' : 'bad'}">${item.type === 'income' ? '+' : '-'}${financeApi.formatCurrency(item.amount)}</div>
        </div>`).join('');
    } else {
      els.upcoming.innerHTML = '<div class="muted">Sin movimientos próximos.</div>';
    }

    const monthMovements = financeApi.getMonthMovements(state, new Date()).slice().reverse();
    els.movementsTable.innerHTML = monthMovements.length ? monthMovements.map((movement) => `
      <div class="list-item">
        <div>
          <strong>${movement.description}</strong>
          <div class="meta">${movement.category} · ${movement.date} · ${movement.segment || 'personal'}</div>
        </div>
        <div class="${movement.type === 'income' ? 'ok' : 'bad'}">
          <div>${movement.type === 'income' ? '+' : '-'}${financeApi.formatCurrency(movement.amount)}</div>
          <button class="danger small" data-remove="${movement.id}" type="button">Eliminar</button>
        </div>
      </div>`).join('') : '<div class="muted">Sin movimientos en este mes.</div>';
  }

  function renderClients() {
    els.clientList.innerHTML = state.clients.map((client) => `
      <div class="list-item">
        <div>
          <strong>${client.name}</strong>
          <div class="meta">${client.service} · ${financeApi.formatCurrency(client.amount)} · día ${client.renewal_day} · ${client.status}</div>
        </div>
        <div>
          ${client.status !== 'paid' && client.continues ? `<button class="primary small" data-pay="${client.id}" type="button">Marcar pagado</button>` : '<span class="muted">Pagado</span>'}
        </div>
      </div>`).join('');
  }

  function renderTrainings() {
    els.trainingsStudents.innerHTML = state.trainings.students.map((student) => `
      <div class="student-card">
        <strong>${student.name}</strong>
        <div class="routine-list">
          ${student.routines.length ? student.routines.map((routineId) => {
            const routine = state.trainings.routines.find((item) => item.id === routineId);
            return routine ? `<div class="routine-pill"><strong>${routine.name}</strong><div class="meta">${routine.exercise} · ${routine.sets}x${routine.reps} · ${routine.weight} kg · descanso ${routine.rest}</div></div>` : '';
          }).join('') : '<div class="muted">Sin rutinas asignadas.</div>'}
        </div>
      </div>`).join('');
  }

  function renderSettings() {
    els.reserve.value = state.profile.minimum_reserve || 0;
    els.magicBudget.value = state.settings.magic_budget || 0;
    els.antBudget.value = state.settings.ant_budget || 0;
    els.savingsGoal.value = state.profile.savings_goal || 0;
  }

  function render() {
    renderDashboard();
    renderClients();
    renderTrainings();
    renderSettings();
  }

  function handleMovementSubmit(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(els.form));
    const result = financeApi.addMovement(state, {
      type: payload.type,
      amount: Number(payload.amount || 0),
      category: payload.category,
      date: payload.date,
      description: payload.description,
      segment: payload.segment
    });

    if (!result.success) {
      els.formMessage.innerHTML = `<span class="bad">${result.errors.join(', ')}</span>`;
      return;
    }

    els.form.reset();
    els.formMessage.innerHTML = '<span class="ok">Movimiento agregado correctamente.</span>';
    persist();
  }

  function handleInitialCashSubmit(event) {
    event.preventDefault();
    state.profile.initial_cash = Number(els.initialCashInput.value || 0);
    persist();
  }

  function handleSettingsSubmit(event) {
    event.preventDefault();
    state.profile.minimum_reserve = Number(els.reserve.value || 0);
    state.profile.savings_goal = Number(els.savingsGoal.value || 0);
    state.settings.magic_budget = Number(els.magicBudget.value || 0);
    state.settings.ant_budget = Number(els.antBudget.value || 0);
    persist();
  }

  function handleRoutineSubmit(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(els.routineForm));
    financeApi.createRoutine(state, {
      studentId: payload.studentId,
      name: payload.name,
      date: payload.date,
      exercise: payload.exercise,
      sets: payload.sets,
      reps: payload.reps,
      weight: payload.weight,
      rest: payload.rest
    });
    els.routineForm.reset();
    els.routineMessage.textContent = 'Rutina creada.';
    persist();
  }

  function handleImport(event) {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = dataApi.importState(reader.result);
        Object.assign(state, imported);
        persist();
        els.importMessage.textContent = 'Datos importados correctamente.';
      } catch (error) {
        els.importMessage.textContent = 'No se pudo importar el archivo.';
      }
    };
    reader.readAsText(file);
  }

  function exportData() {
    const blob = new Blob([dataApi.exportState(state)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'valhalla.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function handleClick(event) {
    const target = event.target;
    const removeId = target.getAttribute('data-remove');
    if (removeId) {
      financeApi.removeMovement(state, removeId);
      persist();
      return;
    }
    const payId = target.getAttribute('data-pay');
    if (payId) {
      financeApi.toggleClientStatus(state, payId);
      persist();
      return;
    }
    const quickCategory = target.getAttribute('data-quick-category');
    if (quickCategory) {
      document.getElementById('category').value = quickCategory;
      document.getElementById('description').value = quickCategory;
    }
  }

  document.addEventListener('click', handleClick);
  els.form.addEventListener('submit', handleMovementSubmit);
  els.cashForm.addEventListener('submit', handleInitialCashSubmit);
  els.routineForm.addEventListener('submit', handleRoutineSubmit);
  document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);
  document.getElementById('exportBtn').addEventListener('click', exportData);
  els.fileInput.addEventListener('change', handleImport);

  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => show(button.getAttribute('data-nav')));
  });

  show('home');
  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
})();
