(function () {
  const { createInitialState } = window.VALHALLA.data;

  function formatCurrency(value) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Math.round(value || 0));
  }

  function getMonthRange(referenceDate = new Date()) {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }

  function getRecurringDates(recurringItem, referenceDate = new Date()) {
    const { end } = getMonthRange(referenceDate);
    const dates = [];
    if (recurringItem.frequency === 'monthly') {
      const day = Math.min(recurringItem.day || 1, end.getDate());
      const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), day);
      if (date >= referenceDate && date <= end) {
        dates.push(date);
      }
      return dates;
    }

    let cursor = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    while (cursor.getDay() !== Number(recurringItem.weekday)) {
      cursor.setDate(cursor.getDate() + 1);
    }
    while (cursor <= end) {
      if (cursor >= referenceDate) {
        dates.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 7);
    }
    return dates;
  }

  function getMonthMovements(state, referenceDate = new Date()) {
    const monthKey = referenceDate.toISOString().slice(0, 7);
    return state.movements.filter((movement) => movement.date && movement.date.slice(0, 7) === monthKey);
  }

  function calculateDashboard(state, referenceDate = new Date()) {
    const monthMovements = getMonthMovements(state, referenceDate);
    const incomesReceived = monthMovements.filter((m) => m.type === 'income').reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const expensesMade = monthMovements.filter((m) => m.type === 'expense').reduce((sum, m) => sum + Number(m.amount || 0), 0);

    const recurringItems = state.recurring.filter((item) => item.active);
    const pendingCommitments = recurringItems.reduce((sum, item) => {
      if (item.type === 'expense') {
        const installmentFactor = item.id === 'debt' ? Number(item.installments_pending || 0) : 1;
        return sum + getRecurringDates(item, referenceDate).reduce((innerSum) => innerSum + Number(item.amount || 0) * installmentFactor, 0);
      }
      return sum;
    }, 0);

    const upcomingItems = [];
    recurringItems.forEach((item) => {
      getRecurringDates(item, referenceDate).forEach((date) => {
        upcomingItems.push({ name: item.name, amount: Number(item.amount || 0), type: item.type, date });
      });
    });

    state.clients.filter((client) => client.continues && client.status !== 'paid').forEach((client) => {
      if (client.status === 'uncertain') {
        return;
      }
      const renewalDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), client.renewal_day);
      const { end } = getMonthRange(referenceDate);
      const currentMonth = renewalDate.getMonth() === referenceDate.getMonth() && renewalDate.getFullYear() === referenceDate.getFullYear();
      if (currentMonth && renewalDate >= referenceDate && renewalDate <= end) {
        upcomingItems.push({ name: `Cobro ${client.name}`, amount: Number(client.amount || 0), type: 'income', date: renewalDate });
      }
    });

    const initialCash = Number(state.profile.initial_cash || 0);
    const projection = initialCash + incomesReceived - expensesMade - pendingCommitments;
    const realAvailable = projection - Number(state.profile.minimum_reserve || 0);
    const suggestedSavings = Math.max(0, Math.round(Math.max(0, projection - Number(state.profile.minimum_reserve || 0)) * (state.settings.savings_rate || 0.5)));

    return {
      incomesReceived,
      expensesMade,
      pendingCommitments,
      projection,
      realAvailable,
      suggestedSavings,
      upcomingItems: upcomingItems.sort((a, b) => a.date - b.date)
    };
  }

  function validateMovement(state, movement) {
    const errors = [];
    if (!movement.date) errors.push('La fecha es obligatoria');
    if (Number(movement.amount) <= 0) errors.push('El monto debe ser mayor a cero');
    const duplicate = state.movements.some((item) => item.date === movement.date && item.description === movement.description && Number(item.amount) === Number(movement.amount));
    if (duplicate) errors.push('El movimiento ya existe');
    return { valid: errors.length === 0, errors };
  }

  function addMovement(state, movement) {
    const normalized = {
      id: movement.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      type: movement.type,
      amount: Number(movement.amount || 0),
      category: movement.category,
      date: movement.date,
      description: movement.description,
      segment: movement.segment,
      created_at: new Date().toISOString()
    };

    const result = validateMovement(state, normalized);
    if (!result.valid) {
      return { success: false, errors: result.errors };
    }

    state.movements.push(normalized);
    return { success: true, movement: normalized };
  }

  function removeMovement(state, movementId) {
    const initialLength = state.movements.length;
    state.movements = state.movements.filter((item) => item.id !== movementId);
    return { success: state.movements.length < initialLength, removed: state.movements.length < initialLength };
  }

  function toggleClientStatus(state, clientId) {
    const client = state.clients.find((item) => item.id === clientId);
    if (!client) {
      return { success: false, error: 'Cliente no encontrado' };
    }
    const previous = client.status;
    client.status = client.status === 'paid' ? 'pending' : 'paid';
    if (client.status === 'paid' && previous !== 'paid') {
      addMovement(state, {
        type: 'income',
        amount: client.amount,
        category: 'alumno',
        date: new Date().toISOString().slice(0, 10),
        description: `Pago ${client.name}`,
        segment: 'business'
      });
    } else if (client.status === 'pending' && previous === 'paid') {
      state.movements = state.movements.filter((item) => item.description !== `Pago ${client.name}`);
    }
    return { success: true, client };
  }

  function createRoutine(state, payload) {
    const routine = {
      id: payload.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      studentId: payload.studentId,
      name: payload.name,
      date: payload.date,
      exercise: payload.exercise,
      sets: payload.sets,
      reps: payload.reps,
      weight: payload.weight,
      rest: payload.rest,
      created_at: new Date().toISOString()
    };

    state.trainings.routines.push(routine);
    const student = state.trainings.students.find((item) => item.id === payload.studentId);
    if (student) {
      student.routines.push(routine.id);
    }
    return routine;
  }

  window.VALHALLA = window.VALHALLA || {};
  window.VALHALLA.finance = {
    formatCurrency,
    calculateDashboard,
    validateMovement,
    addMovement,
    removeMovement,
    toggleClientStatus,
    createRoutine,
    getMonthMovements,
    getRecurringDates
  };
})();
