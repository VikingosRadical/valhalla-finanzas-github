(function () {
  const dataApi = window.VALHALLA.data;
  const financeApi = window.VALHALLA.finance;
  const supabaseApi = window.VALHALLA.supabase;

  const state = dataApi.loadState();
  const nutritionUi = {
    selectedClientId: state.clients[0]?.id || '',
    editingPlanId: null,
    dailyDate: new Date().toISOString().slice(0, 10)
  };

  const els = {
    cloudModeBadge: document.getElementById('cloudModeBadge'),
    authPanel: document.getElementById('authPanel'),
    sections: {
      home: document.getElementById('home'),
      register: document.getElementById('register'),
      clients: document.getElementById('clients'),
      trainings: document.getElementById('trainings'),
      nutrition: document.getElementById('nutrition'),
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
    dashboardCards: document.getElementById('dashboardCards'),
    movementsTable: document.getElementById('movementsTable'),
    form: document.getElementById('movementForm'),
    formMessage: document.getElementById('formMessage'),
    segmentFilter: document.getElementById('segmentFilter'),
    categorySelect: document.getElementById('category'),
    accountSelect: document.getElementById('accountId'),
    quickCategories: document.getElementById('quickCategories'),
    accountSettings: document.getElementById('accountSettings'),
    accountSettingsMessage: document.getElementById('accountSettingsMessage'),
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
    cashForm: document.getElementById('cashForm'),
    nutritionMessage: document.getElementById('nutritionMessage'),
    nutritionSummary: document.getElementById('nutritionSummary'),
    nutritionPlans: document.getElementById('nutritionPlans'),
    nutritionAssignment: document.getElementById('nutritionAssignment'),
    nutritionDaily: document.getElementById('nutritionDaily'),
    nutritionProgress: document.getElementById('nutritionProgress')
  };

  function persist() {
    if (supabaseApi && typeof supabaseApi.saveData === 'function') {
      supabaseApi.saveData(state);
    } else {
      dataApi.saveState(state);
    }
    render();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderAuthPanel() {
    if (!els.authPanel) {
      return;
    }

    if (supabaseApi && typeof supabaseApi.isCloudEnabled === 'function' && supabaseApi.isCloudEnabled()) {
      els.authPanel.innerHTML = `
        <div class="card">
          <h3>Acceso Cloud</h3>
          <form id="cloudLoginForm" class="form-grid">
            <div>
              <label for="cloudEmail">Correo</label>
              <input id="cloudEmail" name="email" type="email" placeholder="correo@ejemplo.com" required>
            </div>
            <div>
              <label for="cloudPassword">Contraseña</label>
              <input id="cloudPassword" name="password" type="password" placeholder="••••••••" required>
            </div>
            <button class="primary" type="submit">Entrar</button>
          </form>
          <div id="cloudAuthMessage" class="notice">Modo Cloud activo. La autenticación se preparará con Supabase cuando la sesión esté disponible.</div>
        </div>`;

      const loginForm = document.getElementById('cloudLoginForm');
      const authMessage = document.getElementById('cloudAuthMessage');
      if (loginForm && authMessage && window.VALHALLA.auth && typeof window.VALHALLA.auth.signIn === 'function') {
        loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const email = document.getElementById('cloudEmail').value;
          const password = document.getElementById('cloudPassword').value;
          authMessage.textContent = 'Procesando autenticación...';
          const response = await window.VALHALLA.auth.signIn(email, password);
          if (response.ok) {
            authMessage.textContent = 'Sesión lista para Supabase.';
          } else {
            authMessage.textContent = response.error || 'No se pudo iniciar sesión.';
          }
        });
      }
      return;
    }

    els.authPanel.innerHTML = '<div class="notice">Modo Local activo. Los datos siguen guardándose en localStorage.</div>';
  }

  function show(section) {
    if (els.cloudModeBadge) {
      els.cloudModeBadge.textContent = supabaseApi && typeof supabaseApi.getModeLabel === 'function' ? supabaseApi.getModeLabel() : 'Modo Local';
    }
    renderAuthPanel();
    Object.entries(els.sections).forEach(([name, element]) => {
      element.classList.toggle('hidden', name !== section);
    });
    document.querySelectorAll('[data-nav]').forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-nav') === section);
    });
  }

  function renderDashboardCards() {
    if (!els.dashboardCards) {
      return;
    }

    const selectedSegment = els.segmentFilter?.value || 'global';
    const highlights = financeApi.getDashboardHighlights(state, new Date(), selectedSegment);

    els.dashboardCards.innerHTML = highlights.map((item) => `
      <div class="card dashboard-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">${escapeHtml(item.title)}</p>
            <h3>${escapeHtml(item.summary)}</h3>
          </div>
          <span class="pill">${escapeHtml(item.badge)}</span>
        </div>
        <p class="muted">${escapeHtml(item.detail)}</p>
        <div class="dashboard-actions">
          <button class="primary small" type="button" data-nav="${escapeHtml(item.nav)}">${escapeHtml(item.buttonLabel)}</button>
        </div>
      </div>`).join('');
  }

  function renderDashboard() {
    const selectedSegment = els.segmentFilter?.value || 'global';
    const dashboard = financeApi.calculateDashboard(state, new Date(), selectedSegment);
    els.metrics.initialCash.textContent = financeApi.formatCurrency(Number(state.profile.initial_cash || 0));
    els.metrics.incomes.textContent = financeApi.formatCurrency(dashboard.incomesReceived);
    els.metrics.expenses.textContent = financeApi.formatCurrency(dashboard.expensesMade);
    els.metrics.available.textContent = financeApi.formatCurrency(dashboard.realAvailable);
    els.metrics.projection.textContent = financeApi.formatCurrency(dashboard.projection);
    els.metrics.savings.textContent = financeApi.formatCurrency(dashboard.suggestedSavings);
    els.metrics.pending.textContent = financeApi.formatCurrency(dashboard.pendingCommitments);
    els.initialCashInput.value = Number(state.profile.initial_cash || 0);

    renderDashboardCards();

    const totalAccountsBalance = financeApi.formatCurrency(dashboard.totalAccountsBalance || 0);
    const operatingBalance = financeApi.formatCurrency(dashboard.operatingBalance || 0);
    const debtPending = financeApi.formatCurrency(dashboard.debtPending || 0);
    document.getElementById('dashboardSummary').innerHTML = `
      <div class="card">
        <h2>Resumen financiero</h2>
        <div class="row">
          <div><strong>Saldo total de cuentas</strong><div class="meta">${totalAccountsBalance}</div></div>
          <div><strong>Saldo operativo</strong><div class="meta">${operatingBalance}</div></div>
        </div>
        <div class="row">
          <div><strong>Compromisos pendientes</strong><div class="meta">${financeApi.formatCurrency(dashboard.pendingCommitments || 0)}</div></div>
          <div><strong>Deuda pendiente</strong><div class="meta">${debtPending}</div></div>
        </div>
      </div>`;

    const categoryOptions = (state.categories || []).map((category) => `<option value="${escapeHtml(category.name)}" ${category.name === 'Monster / bebidas' ? 'selected' : ''}>${escapeHtml(category.name)}</option>`).join('');
    if (els.categorySelect) {
      els.categorySelect.innerHTML = categoryOptions;
    }
    if (els.accountSelect) {
      els.accountSelect.innerHTML = (state.accounts || []).filter((account) => account.isActive !== false).map((account) => `<option value="${account.id}" ${account.isMain ? 'selected' : ''}>${escapeHtml(account.name)}</option>`).join('');
    }
    if (els.quickCategories) {
      els.quickCategories.innerHTML = (state.categories || []).map((category) => `<button class="chip" type="button" data-quick-category="${escapeHtml(category.name)}">${escapeHtml(category.name)}</button>`).join('');
    }

    const selectedDate = document.getElementById('date');
    if (selectedDate && !selectedDate.value) {
      selectedDate.value = new Date().toISOString().slice(0, 10);
    }

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
            <strong>${escapeHtml(item.name)}</strong>
            <div class="meta">${item.date.toLocaleDateString('es-CL')}</div>
          </div>
          <div class="${item.type === 'income' ? 'ok' : 'bad'}">${item.type === 'income' ? '+' : '-'}${financeApi.formatCurrency(item.amount)}</div>
        </div>`).join('');
    } else {
      els.upcoming.innerHTML = '<div class="muted">Sin movimientos próximos.</div>';
    }

    const monthMovements = financeApi.getMonthMovements(state, new Date()).slice().reverse().filter((movement) => {
      if (!els.segmentFilter || !els.segmentFilter.value || els.segmentFilter.value === 'global') {
        return true;
      }
      return (movement.segment || 'personal') === els.segmentFilter.value;
    });
    els.movementsTable.innerHTML = monthMovements.length ? monthMovements.map((movement) => `
      <div class="list-item">
        <div>
          <strong>${escapeHtml(movement.description)}</strong>
          <div class="meta">${escapeHtml(movement.category)} · ${escapeHtml(movement.date)} · ${escapeHtml(movement.segment || 'personal')} · ${escapeHtml(movement.accountId ? (state.accounts.find((account) => account.id === movement.accountId)?.name || 'Cuenta') : 'Sin cuenta')}</div>
        </div>
        <div class="${movement.type === 'income' ? 'ok' : 'bad'}">
          <div>${movement.type === 'income' ? '+' : '-'}${financeApi.formatCurrency(movement.amount)}</div>
          <div class="inline-actions">
            <button class="ghost small" data-edit="${movement.id}" type="button">Editar</button>
            <button class="danger small" data-remove="${movement.id}" type="button">Eliminar</button>
          </div>
        </div>
      </div>`).join('') : '<div class="muted">Sin movimientos en este mes.</div>';
  }

  function getClientName(clientId) {
    return state.clients.find((client) => client.id === clientId)?.name || 'Alumno';
  }

  function getActiveNutritionProfile(clientId) {
    return state.nutritionProfiles.find((profile) => profile.clientId === clientId && profile.active);
  }

  function getSelectedPlan(profile) {
    if (!profile) {
      return state.nutritionPlans.find((plan) => plan.active) || null;
    }
    return state.nutritionPlans.find((plan) => plan.id === profile.currentPlanId) || state.nutritionPlans.find((plan) => plan.active) || null;
  }

  function getCycleDay(profile, referenceDate = new Date()) {
    if (!profile || !profile.cycleStartDate) {
      return 1;
    }
    const start = new Date(profile.cycleStartDate);
    const current = new Date(referenceDate);
    const diffDays = Math.floor((current.getTime() - start.getTime()) / 86400000);
    return Math.max(1, diffDays + 1);
  }

  function getNutritionCompliance(clientId, days = 7) {
    const relevantLogs = state.nutritionLogs.filter((log) => log.clientId === clientId).slice(-days);
    if (!relevantLogs.length) {
      return 0;
    }
    const ratio = relevantLogs.reduce((sum, log) => sum + (log.totalMeals ? Number(log.completedMeals || 0) / Number(log.totalMeals || 1) : 0), 0) / relevantLogs.length;
    return Math.round(ratio * 100);
  }

  function getNutritionAlerts(clientId) {
    const profile = getActiveNutritionProfile(clientId);
    const plan = getSelectedPlan(profile);
    const logs = state.nutritionLogs.filter((log) => log.clientId === clientId).slice(-7);
    const alerts = [];
    if (!profile) {
      return alerts;
    }
    const daysWithout = logs.length ? Math.max(0, 7 - logs.length) : 7;
    if (daysWithout > 3) {
      alerts.push(`Más de 3 días sin registro: ${daysWithout} días sin seguimiento.`);
    }
    const compliance = getNutritionCompliance(clientId, 7);
    if (compliance < 70) {
      alerts.push(`Cumplimiento inferior al 70% en los últimos 7 días: ${compliance}%.`);
    }
    if (plan) {
      const avgWater = logs.length ? logs.reduce((sum, log) => sum + Number(log.waterLiters || 0), 0) / logs.length : 0;
      if (avgWater < Number(plan.waterMinLiters || 0)) {
        alerts.push(`Agua promedio menor al mínimo configurado: ${avgWater.toFixed(1)} L.`);
      }
      const avgEnergy = logs.length ? logs.reduce((sum, log) => sum + Number(log.energy || 0), 0) / logs.length : 0;
      if (avgEnergy <= 2) {
        alerts.push(`Energía promedio baja o igual a 2.`);
      }
      const avgHunger = logs.length ? logs.reduce((sum, log) => sum + Number(log.hunger || 0), 0) / logs.length : 0;
      if (avgHunger >= 4) {
        alerts.push(`Hambre promedio alta o igual a 4.`);
      }
    }
    const weightSeries = logs.filter((log) => log.weight !== '' && log.weight !== undefined && log.weight !== null);
    if (weightSeries.length >= 2) {
      const first = Number(weightSeries[0].weight);
      const last = Number(weightSeries[weightSeries.length - 1].weight);
      if (first !== last) {
        alerts.push(`Cambio de peso registrado: ${first} kg → ${last} kg.`);
      }
    }
    return alerts;
  }

  function renderClients() {
    els.clientList.innerHTML = state.clients.map((client) => {
      const profile = getActiveNutritionProfile(client.id);
      const plan = getSelectedPlan(profile);
      const compliance = getNutritionCompliance(client.id, 7);
      const cycleDay = profile ? getCycleDay(profile, new Date()) : '—';
      const alertCount = getNutritionAlerts(client.id).length;
      const nutritionBadge = profile ? '<span class="tag ok">Pauta activa</span>' : '<span class="tag muted">Sin pauta</span>';
      return `
        <div class="list-item nutrition-client-card">
          <div>
            <strong>${escapeHtml(client.name)}</strong>
            <div class="meta">${escapeHtml(client.service)} · ${financeApi.formatCurrency(client.amount)} · día ${client.renewal_day} · ${escapeHtml(client.status)}</div>
            <div class="meta">${nutritionBadge} · Día de ciclo ${cycleDay} · Cumplimiento 7 días: ${compliance}%</div>
            ${plan ? `<div class="meta">Plan: ${escapeHtml(plan.name)}</div>` : ''}
          </div>
          <div class="inline-actions">
            <button class="ghost small" data-open-nutrition="${client.id}" type="button">Ver nutrición</button>
            ${client.status !== 'paid' && client.continues ? `<button class="primary small" data-pay="${client.id}" type="button">Marcar pagado</button>` : '<span class="muted">Pagado</span>'}
          </div>
        </div>`;
    }).join('');
  }

  function renderTrainings() {
    els.trainingsStudents.innerHTML = state.trainings.students.map((student) => `
      <div class="student-card">
        <strong>${escapeHtml(student.name)}</strong>
        <div class="routine-list">
          ${student.routines.length ? student.routines.map((routineId) => {
            const routine = state.trainings.routines.find((item) => item.id === routineId);
            return routine ? `<div class="routine-pill"><strong>${escapeHtml(routine.name)}</strong><div class="meta">${escapeHtml(routine.exercise)} · ${routine.sets}x${routine.reps} · ${routine.weight} kg · descanso ${escapeHtml(routine.rest)}</div></div>` : '';
          }).join('') : '<div class="muted">Sin rutinas asignadas.</div>'}
        </div>
      </div>`).join('');
  }

  function renderSettings() {
    els.reserve.value = state.profile.minimum_reserve || 0;
    els.magicBudget.value = state.settings.magic_budget || 0;
    els.antBudget.value = state.settings.ant_budget || 0;
    els.savingsGoal.value = state.profile.savings_goal || 0;
    if (els.accountSettings) {
      els.accountSettings.innerHTML = (state.accounts || []).map((account) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(account.name)}</strong>
            <div class="meta">Saldo inicial ${financeApi.formatCurrency(account.initialBalance || 0)}</div>
          </div>
          <div class="inline-actions">
            <label class="muted"><input type="checkbox" data-account-toggle="${account.id}" ${account.isActive !== false ? 'checked' : ''}> Activa</label>
            <label class="muted"><input type="radio" name="mainAccount" data-account-main="${account.id}" ${account.isMain ? 'checked' : ''}> Principal</label>
            <button class="ghost small" type="button" data-account-balance="${account.id}">Editar saldo</button>
          </div>
        </div>`).join('');
    }
  }

  function createEmptyMeal() {
    return {
      id: dataApi.createId('meal'),
      mealName: '',
      time: '',
      blocks: [{ type: '', quantity: '', unit: '', options: '' }]
    };
  }

  function createEmptyDay(dayNumber) {
    return {
      dayNumber,
      name: `Día ${dayNumber}`,
      description: '',
      carbohydrateLevel: '',
      meals: [createEmptyMeal()],
      supplements: '',
      instructions: ''
    };
  }

  function createDraftPlan() {
    return {
      id: dataApi.createId('plan'),
      name: '',
      description: '',
      cycleLength: 10,
      freeDay: true,
      waterMinLiters: 3,
      waterMaxLiters: 5,
      active: true,
      days: [createEmptyDay(1)]
    };
  }

  function getNutritionPlanDraft() {
    if (!nutritionUi.editingPlanId) {
      return createDraftPlan();
    }
    const existing = state.nutritionPlans.find((plan) => plan.id === nutritionUi.editingPlanId);
    return existing ? JSON.parse(JSON.stringify(existing)) : createDraftPlan();
  }

  function setNutritionPlanDraft(plan) {
    nutritionUi.planDraft = plan;
  }

  function renderNutritionPlanEditor() {
    const plan = nutritionUi.planDraft || getNutritionPlanDraft();
    const daysMarkup = (plan.days || []).map((day, dayIndex) => `
      <div class="nutrition-day-card">
        <div class="section-title">
          <h4>${escapeHtml(day.name || `Día ${dayIndex + 1}`)}</h4>
          <button class="ghost small" type="button" data-plan-action="remove-day" data-day-index="${dayIndex}">Eliminar día</button>
        </div>
        <div class="row">
          <div>
            <label>Nombre del día</label>
            <input data-kind="day" data-field="name" data-day-index="${dayIndex}" value="${escapeHtml(day.name || '')}">
          </div>
          <div>
            <label>Carbohidratos</label>
            <input data-kind="day" data-field="carbohydrateLevel" data-day-index="${dayIndex}" value="${escapeHtml(day.carbohydrateLevel || '')}" placeholder="bajo, medio, libre">
          </div>
        </div>
        <div>
          <label>Descripción</label>
          <textarea data-kind="day" data-field="description" data-day-index="${dayIndex}">${escapeHtml(day.description || '')}</textarea>
        </div>
        <div class="row">
          <div>
            <label>Suplementos</label>
            <input data-kind="day" data-field="supplements" data-day-index="${dayIndex}" value="${escapeHtml(day.supplements || '')}">
          </div>
          <div>
            <label>Instrucciones</label>
            <input data-kind="day" data-field="instructions" data-day-index="${dayIndex}" value="${escapeHtml(day.instructions || '')}">
          </div>
        </div>
        <div class="nutrition-meals">
          ${(day.meals || []).map((meal, mealIndex) => `
            <div class="nutrition-meal-card">
              <div class="section-title">
                <h5>Comida ${mealIndex + 1}</h5>
                <button class="ghost small" type="button" data-plan-action="remove-meal" data-day-index="${dayIndex}" data-meal-index="${mealIndex}">Eliminar comida</button>
              </div>
              <div class="row">
                <div>
                  <label>Nombre</label>
                  <input data-kind="meal" data-field="mealName" data-day-index="${dayIndex}" data-meal-index="${mealIndex}" value="${escapeHtml(meal.mealName || '')}">
                </div>
                <div>
                  <label>Hora</label>
                  <input data-kind="meal" data-field="time" data-day-index="${dayIndex}" data-meal-index="${mealIndex}" value="${escapeHtml(meal.time || '')}">
                </div>
              </div>
              <div class="nutrition-blocks">
                ${(meal.blocks || []).map((block, blockIndex) => `
                  <div class="nutrition-block-card">
                    <div class="section-title">
                      <h6>Bloque ${blockIndex + 1}</h6>
                      <button class="ghost small" type="button" data-plan-action="remove-block" data-day-index="${dayIndex}" data-meal-index="${mealIndex}" data-block-index="${blockIndex}">Eliminar</button>
                    </div>
                    <div class="row">
                      <div>
                        <label>Tipo</label>
                        <input data-kind="block" data-field="type" data-day-index="${dayIndex}" data-meal-index="${mealIndex}" data-block-index="${blockIndex}" value="${escapeHtml(block.type || '')}" placeholder="Proteína">
                      </div>
                      <div>
                        <label>Cantidad</label>
                        <input data-kind="block" data-field="quantity" data-day-index="${dayIndex}" data-meal-index="${mealIndex}" data-block-index="${blockIndex}" value="${escapeHtml(block.quantity || '')}">
                      </div>
                    </div>
                    <div class="row">
                      <div>
                        <label>Unidad</label>
                        <input data-kind="block" data-field="unit" data-day-index="${dayIndex}" data-meal-index="${mealIndex}" data-block-index="${blockIndex}" value="${escapeHtml(block.unit || '')}">
                      </div>
                      <div>
                        <label>Alternativas</label>
                        <input data-kind="block" data-field="options" data-day-index="${dayIndex}" data-meal-index="${mealIndex}" data-block-index="${blockIndex}" value="${escapeHtml(block.options || '')}">
                      </div>
                    </div>
                  </div>`).join('')}
              </div>
              <button class="secondary small" type="button" data-plan-action="add-block" data-day-index="${dayIndex}" data-meal-index="${mealIndex}">Agregar bloque</button>
            </div>`).join('')}
        </div>
        <button class="secondary small" type="button" data-plan-action="add-meal" data-day-index="${dayIndex}">Agregar comida</button>
      </div>`).join('');

    return `
      <div class="nutrition-day-list">
        ${daysMarkup}
        <button class="secondary small" type="button" data-plan-action="add-day">Agregar día</button>
      </div>`;
  }

  function renderNutritionPlans() {
    const plansMarkup = state.nutritionPlans.map((plan) => `
      <div class="nutrition-plan-card">
        <div>
          <strong>${escapeHtml(plan.name)}</strong>
          <div class="meta">${escapeHtml(plan.description || 'Sin descripción')}</div>
          <div class="meta">Duración ${plan.cycleLength || 0} días · ${plan.days.length || 0} comidas · ${plan.freeDay ? 'Día libre' : 'Sin día libre'}</div>
        </div>
        <div class="inline-actions">
          <button class="ghost small" type="button" data-plan-action="edit" data-plan-id="${plan.id}">Editar</button>
          <button class="ghost small" type="button" data-plan-action="duplicate" data-plan-id="${plan.id}">Duplicar</button>
          <button class="${plan.active ? 'secondary' : 'primary'} small" type="button" data-plan-action="toggle-active" data-plan-id="${plan.id}">${plan.active ? 'Desactivar' : 'Activar'}</button>
        </div>
      </div>`).join('');

    els.nutritionPlans.innerHTML = `
      <div class="card nutrition-panel">
        <div class="section-title">
          <h3>Planes</h3>
          <button class="primary small" type="button" data-plan-action="create">Crear plan</button>
        </div>
        <div class="nutrition-list">${plansMarkup || '<div class="muted">Sin planes guardados.</div>'}</div>
        <form id="nutritionPlanForm" class="form-grid">
          <div class="row">
            <div>
              <label>Nombre del plan</label>
              <input id="planName" name="planName" value="${escapeHtml((nutritionUi.planDraft || getNutritionPlanDraft()).name || '')}">
            </div>
            <div>
              <label>Descripción</label>
              <input id="planDescription" name="planDescription" value="${escapeHtml((nutritionUi.planDraft || getNutritionPlanDraft()).description || '')}">
            </div>
          </div>
          <div class="row">
            <div>
              <label>Días</label>
              <input id="planCycleLength" name="planCycleLength" type="number" min="1" value="${Number((nutritionUi.planDraft || getNutritionPlanDraft()).cycleLength || 10)}">
            </div>
            <div>
              <label>Día libre</label>
              <select id="planFreeDay" name="planFreeDay">
                <option value="true" ${(nutritionUi.planDraft || getNutritionPlanDraft()).freeDay ? 'selected' : ''}>Sí</option>
                <option value="false" ${(nutritionUi.planDraft || getNutritionPlanDraft()).freeDay ? '' : 'selected'}>No</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div>
              <label>Agua mínima (L)</label>
              <input id="planWaterMin" name="planWaterMin" type="number" step="0.1" value="${Number((nutritionUi.planDraft || getNutritionPlanDraft()).waterMinLiters || 3)}">
            </div>
            <div>
              <label>Agua máxima (L)</label>
              <input id="planWaterMax" name="planWaterMax" type="number" step="0.1" value="${Number((nutritionUi.planDraft || getNutritionPlanDraft()).waterMaxLiters || 5)}">
            </div>
          </div>
          <div>
            <label>Estado</label>
            <select id="planActive" name="planActive">
              <option value="true" ${((nutritionUi.planDraft || getNutritionPlanDraft()).active ?? true) ? 'selected' : ''}>Activo</option>
              <option value="false" ${((nutritionUi.planDraft || getNutritionPlanDraft()).active ?? true) ? '' : 'selected'}>Inactivo</option>
            </select>
          </div>
          <div id="nutritionPlanEditor">${renderNutritionPlanEditor()}</div>
          <button class="primary" type="submit">Guardar cambios</button>
        </form>
      </div>`;

    const planForm = document.getElementById('nutritionPlanForm');
    if (planForm) {
      planForm.addEventListener('submit', handleNutritionPlanSubmit);
    }
  }

  function renderNutritionAssignment() {
    const activeProfile = nutritionUi.selectedClientId ? getActiveNutritionProfile(nutritionUi.selectedClientId) : null;
    const clientOptions = state.clients.map((client) => `<option value="${client.id}" ${nutritionUi.selectedClientId === client.id ? 'selected' : ''}>${escapeHtml(client.name)}</option>`).join('');
    const selectedPlanId = activeProfile?.currentPlanId || '';
    els.nutritionAssignment.innerHTML = `
      <div class="card nutrition-panel">
        <div class="section-title">
          <h3>Asignación</h3>
        </div>
        <form id="nutritionProfileForm" class="form-grid">
          <div>
            <label>Alumno</label>
            <select id="nutritionClientSelect" name="clientId">${clientOptions}</select>
          </div>
          <div>
            <label>Objetivo</label>
            <input id="nutritionObjective" name="objective" value="${escapeHtml(activeProfile?.objective || '')}">
          </div>
          <div>
            <label>Tipo de alimentación</label>
            <select id="nutritionDietType" name="dietType">
              <option value="Tradicional" ${activeProfile?.dietType === 'Tradicional' ? 'selected' : ''}>Tradicional</option>
              <option value="Vegetariana" ${activeProfile?.dietType === 'Vegetariana' ? 'selected' : ''}>Vegetariana</option>
              <option value="Ovo-lacto vegetariana" ${activeProfile?.dietType === 'Ovo-lacto vegetariana' ? 'selected' : ''}>Ovo-lacto vegetariana</option>
              <option value="Pescetariana" ${activeProfile?.dietType === 'Pescetariana' ? 'selected' : ''}>Pescetariana</option>
              <option value="Personalizada" ${activeProfile?.dietType === 'Personalizada' ? 'selected' : ''}>Personalizada</option>
            </select>
          </div>
          <div>
            <label>Restricciones</label>
            <textarea id="nutritionRestrictions" name="restrictions">${escapeHtml(activeProfile?.restrictions || '')}</textarea>
          </div>
          <div class="row">
            <div>
              <label>Fecha de inicio</label>
              <input id="nutritionStartDate" name="cycleStartDate" type="date" value="${escapeHtml(activeProfile?.cycleStartDate || '')}">
            </div>
            <div>
              <label>Plan asignado</label>
              <select id="nutritionPlanSelect" name="currentPlanId">
                <option value="">Sin plan</option>
                ${state.nutritionPlans.map((plan) => `<option value="${plan.id}" ${selectedPlanId === plan.id ? 'selected' : ''}>${escapeHtml(plan.name)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div>
            <label>Notas</label>
            <textarea id="nutritionNotes" name="notes">${escapeHtml(activeProfile?.notes || '')}</textarea>
          </div>
          <button class="primary" type="submit">Guardar perfil nutricional</button>
        </form>
      </div>`;
    document.getElementById('nutritionProfileForm')?.addEventListener('submit', handleNutritionProfileSubmit);
  }

  function renderNutritionDaily() {
    const clientId = nutritionUi.selectedClientId || state.clients[0]?.id || '';
    const profile = getActiveNutritionProfile(clientId);
    const plan = getSelectedPlan(profile);
    const cycleDay = profile ? getCycleDay(profile, nutritionUi.dailyDate) : 1;
    const currentDay = plan?.days.find((day) => Number(day.dayNumber) === cycleDay) || plan?.days[0] || null;
    const mealOptions = currentDay?.meals?.map((meal, index) => `
      <label class="nutrition-check-item">
        <input type="checkbox" name="completedMeals" value="${meal.id}">
        <span>${escapeHtml(meal.mealName || `Comida ${index + 1}`)} · ${escapeHtml(meal.time || 'Sin hora')}</span>
      </label>`).join('') || '<div class="muted">Sin comidas asignadas para este día.</div>';

    els.nutritionDaily.innerHTML = `
      <div class="card nutrition-panel">
        <div class="section-title">
          <h3>Vista diaria</h3>
        </div>
        <form id="nutritionDailyForm" class="form-grid">
          <div class="row">
            <div>
              <label>Alumno</label>
              <select id="dailyClientSelect" name="clientId">${state.clients.map((client) => `<option value="${client.id}" ${client.id === clientId ? 'selected' : ''}>${escapeHtml(client.name)}</option>`).join('')}</select>
            </div>
            <div>
              <label>Fecha</label>
              <input id="dailyDateInput" name="date" type="date" value="${escapeHtml(nutritionUi.dailyDate)}">
            </div>
          </div>
          <div class="row">
            <div>
              <label>Día del ciclo</label>
              <input id="dailyCycleDay" value="${cycleDay}" readonly>
            </div>
            <div>
              <label>Plan</label>
              <input value="${escapeHtml(plan?.name || 'Sin plan')}" readonly>
            </div>
          </div>
          <div>
            <label>Comidas del día</label>
            <div class="nutrition-check-list">${mealOptions}</div>
          </div>
          <div class="row">
            <div>
              <label>Agua consumida (L)</label>
              <input id="dailyWater" name="waterLiters" type="number" step="0.1" value="0">
            </div>
            <div>
              <label>Suplementos completados</label>
              <select id="dailySupplements" name="supplementsCompleted">
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div>
              <label>Energía 1-5</label>
              <input id="dailyEnergy" name="energy" type="number" min="1" max="5" value="3">
            </div>
            <div>
              <label>Hambre 1-5</label>
              <input id="dailyHunger" name="hunger" type="number" min="1" max="5" value="3">
            </div>
          </div>
          <div class="row">
            <div>
              <label>Digestión</label>
              <select id="dailyDigestion" name="digestion">
                <option value="Buena">Buena</option>
                <option value="Regular">Regular</option>
                <option value="Mala">Mala</option>
              </select>
            </div>
            <div>
              <label>Peso (kg, opcional)</label>
              <input id="dailyWeight" name="weight" type="number" step="0.1">
            </div>
          </div>
          <div>
            <label>Observaciones</label>
            <textarea id="dailyNotes" name="notes"></textarea>
          </div>
          <button class="primary" type="submit">Guardar registro</button>
        </form>
      </div>`;
    document.getElementById('nutritionDailyForm')?.addEventListener('submit', handleNutritionDailySubmit);
  }

  function renderNutritionProgress() {
    const clientId = nutritionUi.selectedClientId || state.clients[0]?.id || '';
    const profile = getActiveNutritionProfile(clientId);
    const logs = state.nutritionLogs.filter((log) => log.clientId === clientId).slice(-7);
    const averageWater = logs.length ? logs.reduce((sum, log) => sum + Number(log.waterLiters || 0), 0) / logs.length : 0;
    const averageEnergy = logs.length ? logs.reduce((sum, log) => sum + Number(log.energy || 0), 0) / logs.length : 0;
    const averageHunger = logs.length ? logs.reduce((sum, log) => sum + Number(log.hunger || 0), 0) / logs.length : 0;
    const compliance = getNutritionCompliance(clientId, 7);
    const latestWeight = logs.filter((log) => log.weight !== '' && log.weight !== undefined && log.weight !== null).slice(-5);
    const daysWithout = profile ? Math.max(0, 7 - logs.length) : 0;

    els.nutritionProgress.innerHTML = `
      <div class="card nutrition-panel">
        <div class="section-title">
          <h3>Progreso</h3>
        </div>
        <div class="nutrition-metrics-grid">
          <div class="card metric-card">
            <small>Cumplimiento semanal</small>
            <strong>${compliance}%</strong>
            <div class="progress-bar"><span style="width:${Math.min(100, compliance)}%"></span></div>
          </div>
          <div class="card metric-card">
            <small>Agua promedio</small>
            <strong>${averageWater.toFixed(1)} L</strong>
          </div>
          <div class="card metric-card">
            <small>Energía promedio</small>
            <strong>${averageEnergy.toFixed(1)}/5</strong>
          </div>
          <div class="card metric-card">
            <small>Hambre promedio</small>
            <strong>${averageHunger.toFixed(1)}/5</strong>
          </div>
        </div>
        <div class="row">
          <div>
            <h4>Historial de peso</h4>
            <div class="nutrition-list">${latestWeight.length ? latestWeight.map((log) => `<div class="list-item"><div><strong>${escapeHtml(log.date)}</strong><div class="meta">Peso registrado</div></div><div>${log.weight} kg</div></div>`).join('') : '<div class="muted">Sin pesos registrados.</div>'}</div>
          </div>
          <div>
            <h4>Alertas</h4>
            <div class="nutrition-list">${getNutritionAlerts(clientId).length ? getNutritionAlerts(clientId).map((item) => `<div class="notice">${escapeHtml(item)}</div>`).join('') : '<div class="muted">Sin alertas para revisión.</div>'}</div>
          </div>
        </div>
        <div class="row">
          <div>
            <h4>Días sin registro</h4>
            <div class="notice">${daysWithout} días desde el último registro.</div>
          </div>
          <div>
            <h4>Registros recientes</h4>
            <div class="nutrition-list">${logs.length ? logs.map((log) => `<div class="list-item"><div><strong>${escapeHtml(log.date)}</strong><div class="meta">${log.completedMeals}/${log.totalMeals} comidas · ${log.waterLiters} L</div></div><button class="danger small" data-log-delete="${log.id}" type="button">Eliminar</button></div>`).join('') : '<div class="muted">Sin registros todavía.</div>'}</div>
          </div>
        </div>
      </div>`;
  }

  function renderNutritionSummary() {
    const activeProfiles = state.nutritionProfiles.filter((profile) => profile.active);
    const compliance = activeProfiles.length ? Math.round(activeProfiles.reduce((sum, profile) => sum + getNutritionCompliance(profile.clientId, 7), 0) / activeProfiles.length) : 0;
    const withoutRecent = activeProfiles.filter((profile) => {
      const logs = state.nutritionLogs.filter((log) => log.clientId === profile.clientId).slice(-3);
      return !logs.length;
    });
    const nextControls = activeProfiles.slice(0, 3).map((profile) => {
      const clientName = getClientName(profile.clientId);
      return `<div class="list-item"><div><strong>${escapeHtml(clientName)}</strong><div class="meta">Control sugerido en 3 días o al finalizar el ciclo.</div></div><div>${escapeHtml(profile.objective || 'Objetivo sin definir')}</div></div>`;
    }).join('');

    els.nutritionSummary.innerHTML = `
      <div class="card nutrition-panel">
        <div class="section-title">
          <h3>Resumen</h3>
        </div>
        <div class="nutrition-metrics-grid">
          <div class="card metric-card">
            <small>Alumnos con pauta activa</small>
            <strong>${activeProfiles.length}</strong>
          </div>
          <div class="card metric-card">
            <small>Cumplimiento promedio 7 días</small>
            <strong>${compliance}%</strong>
          </div>
          <div class="card metric-card">
            <small>Próximos controles</small>
            <strong>${activeProfiles.length}</strong>
          </div>
          <div class="card metric-card">
            <small>Sin registro reciente</small>
            <strong>${withoutRecent.length}</strong>
          </div>
        </div>
        <div class="row">
          <div>
            <h4>Alertas de revisión</h4>
            <div class="nutrition-list">${activeProfiles.length ? activeProfiles.map((profile) => {
              const alerts = getNutritionAlerts(profile.clientId);
              return alerts.length ? `<div class="notice"><strong>${escapeHtml(getClientName(profile.clientId))}</strong><div>${alerts.map((item) => `<div>${escapeHtml(item)}</div>`).join('')}</div></div>` : '';
            }).join('') : '<div class="muted">No hay alertas por revisar.</div>'}</div>
          </div>
          <div>
            <h4>Próximos controles</h4>
            <div class="nutrition-list">${nextControls || '<div class="muted">Sin próximos controles definidos.</div>'}</div>
          </div>
        </div>
      </div>`;
  }

  function renderNutrition() {
    renderNutritionSummary();
    renderNutritionPlans();
    renderNutritionAssignment();
    renderNutritionDaily();
    renderNutritionProgress();
  }

  function render() {
    renderDashboard();
    renderClients();
    renderTrainings();
    renderSettings();
    renderNutrition();
  }

  function handleMovementSubmit(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(els.form));
    const result = financeApi.addMovement(state, {
      type: payload.type,
      amount: Number(payload.amount || 0),
      category: payload.category || 'Otro',
      date: payload.date || new Date().toISOString().slice(0, 10),
      description: payload.description || payload.category || 'Movimiento',
      segment: payload.segment || 'personal',
      accountId: payload.accountId || (state.accounts.find((account) => account.isMain)?.id || '')
    });

    if (!result.success) {
      els.formMessage.innerHTML = `<span class="bad">${result.errors.join(', ')}</span>`;
      return;
    }

    els.form.reset();
    els.formMessage.innerHTML = '<span class="ok">Movimiento guardado correctamente. Revisa el resumen y el historial.</span>';
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

  function handleNutritionPlanSubmit(event) {
    event.preventDefault();
    const draft = nutritionUi.planDraft || getNutritionPlanDraft();
    const formData = new FormData(document.getElementById('nutritionPlanForm'));
    const payload = Object.fromEntries(formData.entries());
    const nextPlan = {
      ...draft,
      id: nutritionUi.editingPlanId || draft.id,
      name: payload.planName || 'Plan sin nombre',
      description: payload.planDescription || '',
      cycleLength: Number(payload.planCycleLength || 10),
      freeDay: payload.planFreeDay === 'true',
      waterMinLiters: Number(payload.planWaterMin || 3),
      waterMaxLiters: Number(payload.planWaterMax || 5),
      active: payload.planActive === 'true',
      days: (draft.days || []).map((day, index) => ({ ...day }))
    };
    if (nutritionUi.editingPlanId) {
      const index = state.nutritionPlans.findIndex((plan) => plan.id === nutritionUi.editingPlanId);
      if (index >= 0) {
        state.nutritionPlans[index] = nextPlan;
      }
    } else {
      state.nutritionPlans.push(nextPlan);
    }
    nutritionUi.editingPlanId = null;
    nutritionUi.planDraft = null;
    els.nutritionMessage.textContent = 'Plan guardado correctamente.';
    persist();
  }

  function handleNutritionProfileSubmit(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(document.getElementById('nutritionProfileForm')));
    const existing = state.nutritionProfiles.find((item) => item.clientId === payload.clientId && item.active);
    const nextProfile = {
      id: existing?.id || dataApi.createId('profile'),
      clientId: payload.clientId,
      objective: payload.objective || '',
      dietType: payload.dietType || 'Tradicional',
      restrictions: payload.restrictions || '',
      notes: payload.notes || '',
      cycleStartDate: payload.cycleStartDate || '',
      currentPlanId: payload.currentPlanId || '',
      active: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (existing) {
      Object.assign(existing, nextProfile);
    } else {
      state.nutritionProfiles.push(nextProfile);
    }
    nutritionUi.selectedClientId = payload.clientId;
    els.nutritionMessage.textContent = 'Perfil nutricional guardado.';
    persist();
  }

  function handleNutritionDailySubmit(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(document.getElementById('nutritionDailyForm')));
    const profile = getActiveNutritionProfile(payload.clientId);
    const plan = getSelectedPlan(profile);
    const selectedMeals = Array.isArray(payload.completedMeals) ? payload.completedMeals : [payload.completedMeals].filter(Boolean);
    const log = {
      id: dataApi.createId('log'),
      clientId: payload.clientId,
      planId: profile?.currentPlanId || '',
      date: payload.date || new Date().toISOString().slice(0, 10),
      cycleDay: Number(payload.cycleDay || 1),
      completedMeals: selectedMeals.length,
      totalMeals: plan?.days?.find((day) => Number(day.dayNumber) === Number(payload.cycleDay || 1))?.meals?.length || 0,
      waterLiters: Number(payload.waterLiters || 0),
      supplementsCompleted: payload.supplementsCompleted === 'true',
      energy: Number(payload.energy || 3),
      hunger: Number(payload.hunger || 3),
      digestion: payload.digestion || 'Regular',
      weight: payload.weight ? Number(payload.weight) : '',
      notes: payload.notes || '',
      createdAt: new Date().toISOString()
    };
    state.nutritionLogs.push(log);
    nutritionUi.selectedClientId = payload.clientId;
    nutritionUi.dailyDate = payload.date || nutritionUi.dailyDate;
    els.nutritionMessage.textContent = 'Registro diario guardado.';
    persist();
  }

  function updatePlanDraftFromInputs(event) {
    if (!event.target.dataset.kind) {
      return;
    }
    const plan = nutritionUi.planDraft || getNutritionPlanDraft();
    const dayIndex = Number(event.target.dataset.dayIndex || 0);
    const mealIndex = Number(event.target.dataset.mealIndex || 0);
    const blockIndex = Number(event.target.dataset.blockIndex || 0);
    const baseDay = plan.days[dayIndex] || createEmptyDay(dayIndex + 1);
    if (event.target.dataset.kind === 'day') {
      const field = event.target.dataset.field;
      baseDay[field] = event.target.value;
    } else if (event.target.dataset.kind === 'meal') {
      const field = event.target.dataset.field;
      const meal = baseDay.meals[mealIndex] || createEmptyMeal();
      meal[field] = event.target.value;
      baseDay.meals[mealIndex] = meal;
    } else if (event.target.dataset.kind === 'block') {
      const field = event.target.dataset.field;
      const meal = baseDay.meals[mealIndex] || createEmptyMeal();
      const block = meal.blocks[blockIndex] || { type: '', quantity: '', unit: '', options: '' };
      block[field] = event.target.value;
      meal.blocks[blockIndex] = block;
      baseDay.meals[mealIndex] = meal;
    }
    plan.days[dayIndex] = baseDay;
    nutritionUi.planDraft = plan;
  }

  function handlePlanEditorActions(event) {
    const button = event.target.closest('[data-plan-action]');
    if (!button) {
      return;
    }
    const action = button.getAttribute('data-plan-action');
    const plan = nutritionUi.planDraft || getNutritionPlanDraft();
    if (action === 'create') {
      nutritionUi.editingPlanId = null;
      nutritionUi.planDraft = createDraftPlan();
      renderNutritionPlans();
      return;
    }
    if (action === 'edit') {
      nutritionUi.editingPlanId = button.getAttribute('data-plan-id');
      nutritionUi.planDraft = getNutritionPlanDraft();
      renderNutritionPlans();
      return;
    }
    if (action === 'duplicate') {
      const selectedPlan = state.nutritionPlans.find((item) => item.id === button.getAttribute('data-plan-id'));
      if (selectedPlan) {
        const duplicate = JSON.parse(JSON.stringify(selectedPlan));
        duplicate.id = dataApi.createId('plan');
        duplicate.name = `${duplicate.name} copia`;
        duplicate.active = false;
        state.nutritionPlans.push(duplicate);
        nutritionUi.editingPlanId = null;
        nutritionUi.planDraft = duplicate;
        els.nutritionMessage.textContent = 'Plan duplicado.';
        persist();
      }
      return;
    }
    if (action === 'toggle-active') {
      const selectedPlan = state.nutritionPlans.find((item) => item.id === button.getAttribute('data-plan-id'));
      if (selectedPlan) {
        selectedPlan.active = !selectedPlan.active;
        els.nutritionMessage.textContent = selectedPlan.active ? 'Plan activado.' : 'Plan desactivado.';
        persist();
      }
      return;
    }
    if (action === 'add-day') {
      plan.days.push(createEmptyDay(plan.days.length + 1));
      nutritionUi.planDraft = plan;
      renderNutritionPlans();
      return;
    }
    if (action === 'remove-day') {
      const dayIndex = Number(button.getAttribute('data-day-index') || 0);
      plan.days.splice(dayIndex, 1);
      nutritionUi.planDraft = plan;
      renderNutritionPlans();
      return;
    }
    if (action === 'add-meal') {
      const dayIndex = Number(button.getAttribute('data-day-index') || 0);
      const day = plan.days[dayIndex] || createEmptyDay(dayIndex + 1);
      day.meals.push(createEmptyMeal());
      plan.days[dayIndex] = day;
      nutritionUi.planDraft = plan;
      renderNutritionPlans();
      return;
    }
    if (action === 'remove-meal') {
      const dayIndex = Number(button.getAttribute('data-day-index') || 0);
      const mealIndex = Number(button.getAttribute('data-meal-index') || 0);
      const day = plan.days[dayIndex] || createEmptyDay(dayIndex + 1);
      day.meals.splice(mealIndex, 1);
      plan.days[dayIndex] = day;
      nutritionUi.planDraft = plan;
      renderNutritionPlans();
      return;
    }
    if (action === 'add-block') {
      const dayIndex = Number(button.getAttribute('data-day-index') || 0);
      const mealIndex = Number(button.getAttribute('data-meal-index') || 0);
      const day = plan.days[dayIndex] || createEmptyDay(dayIndex + 1);
      const meal = day.meals[mealIndex] || createEmptyMeal();
      meal.blocks.push({ type: '', quantity: '', unit: '', options: '' });
      day.meals[mealIndex] = meal;
      plan.days[dayIndex] = day;
      nutritionUi.planDraft = plan;
      renderNutritionPlans();
      return;
    }
    if (action === 'remove-block') {
      const dayIndex = Number(button.getAttribute('data-day-index') || 0);
      const mealIndex = Number(button.getAttribute('data-meal-index') || 0);
      const blockIndex = Number(button.getAttribute('data-block-index') || 0);
      const day = plan.days[dayIndex] || createEmptyDay(dayIndex + 1);
      const meal = day.meals[mealIndex] || createEmptyMeal();
      meal.blocks.splice(blockIndex, 1);
      day.meals[mealIndex] = meal;
      plan.days[dayIndex] = day;
      nutritionUi.planDraft = plan;
      renderNutritionPlans();
      return;
    }
  }

  function handleClick(event) {
    const target = event.target;
    const navButton = target.closest('[data-nav]');
    if (navButton) {
      show(navButton.getAttribute('data-nav'));
      return;
    }

    const editId = target.getAttribute('data-edit');
    if (editId) {
      const movement = state.movements.find((item) => item.id === editId);
      if (movement) {
        const nextDescription = window.prompt('Descripción', movement.description || '');
        const nextAmount = window.prompt('Monto', movement.amount || 0);
        if (nextDescription !== null && nextAmount !== null) {
          movement.description = nextDescription || movement.description;
          movement.amount = Number(nextAmount || 0);
          persist();
        }
      }
      return;
    }
    const removeId = target.getAttribute('data-remove');
    if (removeId) {
      if (window.confirm('¿Quieres eliminar este movimiento?')) {
        financeApi.removeMovement(state, removeId);
        persist();
      }
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
      return;
    }
    const accountToggleId = target.getAttribute('data-account-toggle');
    if (accountToggleId) {
      const account = state.accounts.find((item) => item.id === accountToggleId);
      if (account) {
        account.isActive = target.checked;
        persist();
      }
      return;
    }
    const accountMainId = target.getAttribute('data-account-main');
    if (accountMainId) {
      state.accounts.forEach((account) => {
        account.isMain = account.id === accountMainId;
      });
      persist();
      return;
    }
    const accountBalanceId = target.getAttribute('data-account-balance');
    if (accountBalanceId) {
      const account = state.accounts.find((item) => item.id === accountBalanceId);
      const nextBalance = window.prompt(`Saldo inicial de ${account?.name || 'cuenta'}`, account?.initialBalance || 0);
      if (nextBalance !== null) {
        account.initialBalance = Number(nextBalance || 0);
        persist();
      }
      return;
    }
    const openNutritionId = target.getAttribute('data-open-nutrition');
    if (openNutritionId) {
      nutritionUi.selectedClientId = openNutritionId;
      show('nutrition');
      render();
      return;
    }
    const logDeleteId = target.getAttribute('data-log-delete');
    if (logDeleteId) {
      if (window.confirm('¿Deseas eliminar este registro diario?')) {
        state.nutritionLogs = state.nutritionLogs.filter((item) => item.id !== logDeleteId);
        persist();
      }
      return;
    }
    if (target.closest('[data-plan-action]')) {
      handlePlanEditorActions(event);
      return;
    }
  }

  document.addEventListener('click', handleClick);
  els.form.addEventListener('submit', handleMovementSubmit);
  els.cashForm.addEventListener('submit', handleInitialCashSubmit);
  els.routineForm.addEventListener('submit', handleRoutineSubmit);
  document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);
  document.getElementById('exportBtn').addEventListener('click', exportData);
  els.fileInput.addEventListener('change', handleImport);
  document.addEventListener('input', (event) => {
    if (event.target.closest('#nutritionPlanForm')) {
      updatePlanDraftFromInputs(event);
    }
  });
  document.addEventListener('change', (event) => {
    if (event.target.closest('#nutritionPlanForm')) {
      updatePlanDraftFromInputs(event);
    }
  });

  show('home');
  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
})();
