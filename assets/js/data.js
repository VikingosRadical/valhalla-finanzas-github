(function () {
  const INITIAL_STATE = {
    profile: {
      name: 'Sebastián',
      initial_cash: 0,
      minimum_reserve: 50000,
      savings_goal: 0
    },
    settings: {
      magic_budget: 30000,
      ant_budget: 30000,
      savings_rate: 0.5
    },
    movements: [],
    recurring: [
      { id: 'salary', type: 'income', name: 'Ingreso semanal', amount: 250000, frequency: 'weekly', weekday: 6, active: true },
      { id: 'rent', type: 'expense', name: 'Arriendo mensual', amount: 550000, frequency: 'monthly', day: 1, active: true },
      { id: 'light', type: 'expense', name: 'Luz mensual', amount: 89000, frequency: 'monthly', day: 10, active: true },
      { id: 'internet', type: 'expense', name: 'Internet mensual', amount: 20000, frequency: 'monthly', day: 10, active: true },
      { id: 'fuel', type: 'expense', name: 'Bencina estimada', amount: 120000, frequency: 'monthly', day: 5, active: true },
      { id: 'market', type: 'expense', name: 'Supermercado estimado', amount: 80000, frequency: 'weekly', weekday: 6, active: true },
      { id: 'fee', type: 'expense', name: 'Cuota mensual', amount: 100000, frequency: 'monthly', day: 5, active: true },
      { id: 'debt', type: 'expense', name: 'Deuda 12 cuotas', amount: 100000, frequency: 'monthly', day: 5, active: true, installments_pending: 7 }
    ],
    clients: [
      { id: 'nacho', name: 'Nacho', service: 'Semi', amount: 70000, renewal_day: 2, status: 'pending', continues: true },
      { id: 'claudia', name: 'Claudia', service: 'Semi', amount: 70000, renewal_day: 3, status: 'paid', continues: true },
      { id: 'romi', name: 'Romi Meridaz', service: 'Semi', amount: 70000, renewal_day: 8, status: 'pending', continues: true },
      { id: 'helen', name: 'Helen', service: 'Semi', amount: 70000, renewal_day: 11, status: 'pending', continues: true },
      { id: 'jeanette', name: 'Jeanette', service: 'Semi', amount: 70000, renewal_day: 11, status: 'pending', continues: true },
      { id: 'cristina', name: 'Cristina', service: 'Semi', amount: 70000, renewal_day: 15, status: 'pending', continues: true },
      { id: 'rodrigo', name: 'Rodrigo', service: 'Personalizado', amount: 90000, renewal_day: 3, status: 'pending', continues: true },
      { id: 'renato', name: 'Renato', service: 'Personalizado', amount: 60000, renewal_day: 7, status: 'uncertain', continues: false },
      { id: 'gerardo', name: 'Gerardo', service: 'Personalizado', amount: 120000, renewal_day: 7, status: 'uncertain', continues: false }
    ],
    trainings: {
      students: [
        { id: 'alumno-1', name: 'Martín', routines: [] },
        { id: 'alumno-2', name: 'Camila', routines: [] }
      ],
      routines: []
    }
  };

  const STORAGE_KEY = 'valhalla_v05';

  function createInitialState() {
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return createInitialState();
      }
      const parsed = JSON.parse(raw);
      return mergeWithDefaults(parsed);
    } catch (error) {
      console.warn('No se pudo cargar el estado inicial', error);
      return createInitialState();
    }
  }

  function mergeWithDefaults(parsed) {
    const base = createInitialState();
    const merged = {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile || {}) },
      settings: { ...base.settings, ...(parsed.settings || {}) },
      recurring: Array.isArray(parsed.recurring) ? parsed.recurring : base.recurring,
      clients: Array.isArray(parsed.clients) ? parsed.clients : base.clients,
      movements: Array.isArray(parsed.movements) ? parsed.movements : base.movements,
      trainings: {
        students: Array.isArray(parsed.trainings?.students) ? parsed.trainings.students : base.trainings.students,
        routines: Array.isArray(parsed.trainings?.routines) ? parsed.trainings.routines : base.trainings.routines
      }
    };
    return merged;
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function exportState(state) {
    return JSON.stringify(state, null, 2);
  }

  function importState(raw) {
    const parsed = JSON.parse(raw);
    return mergeWithDefaults(parsed);
  }

  window.VALHALLA = window.VALHALLA || {};
  window.VALHALLA.data = {
    STORAGE_KEY,
    createInitialState,
    loadState,
    saveState,
    exportState,
    importState
  };
})();
