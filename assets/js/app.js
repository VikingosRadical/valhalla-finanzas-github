(function () {
  const dataApi = window.VALHALLA.data;
  const financeApi = window.VALHALLA.finance;
  const supabaseApi = window.VALHALLA.supabase;
  const cloudDataApi = window.VALHALLA.cloudData;

  const state = dataApi.loadState();
  const nutritionUi = {
    selectedClientId: state.clients[0]?.id || '',
    editingPlanId: null,
    dailyDate: new Date().toISOString().slice(0, 10)
  };
  const trainingUi = {
    selectedClientId: '',
    selectedExercise: '',
    activeSessionId: '',
    activeExerciseId: '',
    editingSetNumber: null,
    editingExerciseId: ''
  };
  const studentUi = {
    enabled: false,
    clientId: '',
    sessionId: '',
    exerciseIndex: 0,
    editingSetNumber: null,
    restRemaining: 0,
    restRunning: false,
    restTimerId: null,
    startedAt: null
  };
  const clientUi = {
    search: '',
    filter: 'all',
    editingId: null,
    detailId: state.clients[0]?.id || '',
    formOpen: false,
    saving: false,
    notice: '',
    noticeTone: 'neutral',
    records: (state.clients || []).map((client) => normalizeClientRecord(client)),
    loading: false
  };
  const cloudUi = {
    sessionActive: false,
    ownerId: '',
    authUserId: ''
  };

  const els = {
    cloudModeBadge: document.getElementById('cloudModeBadge'),
    authPanel: document.getElementById('authPanel'),
    nav: document.querySelector('.nav'),
    sections: {
      home: document.getElementById('home'),
      register: document.getElementById('register'),
      clients: document.getElementById('clients'),
      trainings: document.getElementById('trainings'),
      studentTraining: document.getElementById('studentTraining'),
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
    clientDetail: document.getElementById('clientDetail'),
    clientFormPanel: document.getElementById('clientFormPanel'),
    clientForm: document.getElementById('clientForm'),
    clientFormTitle: document.getElementById('clientFormTitle'),
    clientFormMessage: document.getElementById('clientFormMessage'),
    clientMessage: document.getElementById('clientMessage'),
    clientSearch: document.getElementById('clientSearch'),
    clientNewBtn: document.getElementById('newClientBtn'),
    clientCancelBtn: document.getElementById('clientCancelBtn'),
    clientSubmitBtn: document.getElementById('clientSubmitBtn'),
    clientCount: document.getElementById('clientCount'),
    trainingsStudents: document.getElementById('trainingsStudents'),
    routineForm: document.getElementById('routineForm'),
    routineMessage: document.getElementById('routineMessage'),
    trainingClientNotice: document.getElementById('trainingClientNotice'),
    studentId: document.getElementById('studentId'),
    trainingSessionId: document.getElementById('trainingSessionId'),
    createSessionBtn: document.getElementById('createSessionBtn'),
    coachExerciseList: document.getElementById('coachExerciseList'),
    restPreset: document.getElementById('restPreset'),
    restInput: document.getElementById('rest'),
    routineDate: document.getElementById('routineDate'),
    routineName: document.getElementById('routineName'),
    sessionStatus: document.getElementById('sessionStatus'),
    sessionNotes: document.getElementById('sessionNotes'),
    exerciseInput: document.getElementById('exercise'),
    exerciseIdInput: document.getElementById('exerciseId'),
    plannedSetsInput: document.getElementById('sets'),
    plannedRepMinInput: document.getElementById('plannedRepMin'),
    plannedRepMaxInput: document.getElementById('plannedRepMax'),
    targetWeightInput: document.getElementById('weight'),
    techniqueNotesInput: document.getElementById('techniqueNotes'),
    historyClientId: document.getElementById('historyClientId'),
    historyExercise: document.getElementById('historyExercise'),
    trainingProgressSummary: document.getElementById('trainingProgressSummary'),
    currentExerciseTitle: document.getElementById('currentExerciseTitle'),
    trainingLastRecord: document.getElementById('trainingLastRecord'),
    setProgressLabel: document.getElementById('setProgressLabel'),
    setWeightInput: document.getElementById('setWeightInput'),
    setRepsInput: document.getElementById('setRepsInput'),
    setCompletedInput: document.getElementById('setCompletedInput'),
    saveSetBtn: document.getElementById('saveSetBtn'),
    setEntryList: document.getElementById('setEntryList'),
    setRecordNotice: document.getElementById('setRecordNotice'),
    editingSetNumber: document.getElementById('editingSetNumber'),
    studentBackBtn: document.getElementById('studentBackBtn'),
    studentName: document.getElementById('studentName'),
    studentSessionTitle: document.getElementById('studentSessionTitle'),
    studentSessionDate: document.getElementById('studentSessionDate'),
    studentExerciseProgress: document.getElementById('studentExerciseProgress'),
    studentSessionProgressBar: document.getElementById('studentSessionProgressBar'),
    studentSessionProgressText: document.getElementById('studentSessionProgressText'),
    studentExerciseName: document.getElementById('studentExerciseName'),
    studentExercisePlan: document.getElementById('studentExercisePlan'),
    studentExerciseTarget: document.getElementById('studentExerciseTarget'),
    studentExerciseRest: document.getElementById('studentExerciseRest'),
    studentExerciseLast: document.getElementById('studentExerciseLast'),
    studentLastWeight: document.getElementById('studentLastWeight'),
    studentLastReps: document.getElementById('studentLastReps'),
    studentBestWeight: document.getElementById('studentBestWeight'),
    studentTechniqueNote: document.getElementById('studentTechniqueNote'),
    studentWeightInput: document.getElementById('studentWeightInput'),
    studentRepsInput: document.getElementById('studentRepsInput'),
    studentSetCompleted: document.getElementById('studentSetCompleted'),
    studentEditingSetNumber: document.getElementById('studentEditingSetNumber'),
    studentSaveSetBtn: document.getElementById('studentSaveSetBtn'),
    studentSetNotice: document.getElementById('studentSetNotice'),
    studentSetList: document.getElementById('studentSetList'),
    studentExerciseCompletedNotice: document.getElementById('studentExerciseCompletedNotice'),
    studentNextExerciseBtn: document.getElementById('studentNextExerciseBtn'),
    studentValidateRecordBtn: document.getElementById('studentValidateRecordBtn'),
    studentRestValue: document.getElementById('studentRestValue'),
    studentRestStartBtn: document.getElementById('studentRestStartBtn'),
    studentRestPlusBtn: document.getElementById('studentRestPlusBtn'),
    studentRestSkipBtn: document.getElementById('studentRestSkipBtn'),
    studentSessionFinishPanel: document.getElementById('studentSessionFinishPanel'),
    studentSessionSummary: document.getElementById('studentSessionSummary'),
    studentFinalizeBtn: document.getElementById('studentFinalizeBtn'),
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
    if (cloudUi.sessionActive) {
      const localState = dataApi.loadState() || {};
      const snapshot = {
        ...state,
        clients: Array.isArray(localState.clients) ? localState.clients : [],
        trainingModelVersion: localState.trainingModelVersion || '0.8.0',
        trainingsV08: localState.trainingsV08 || { plans: [], sessions: [] }
      };
      dataApi.saveState(snapshot);
      render();
      return;
    }

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

  function isCloudMode() {
    return Boolean(supabaseApi && typeof supabaseApi.isCloudEnabled === 'function' && supabaseApi.isCloudEnabled());
  }

  function isCloudSessionActive() {
    return Boolean(isCloudMode() && cloudUi.sessionActive && cloudUi.ownerId);
  }

  async function refreshCloudSessionState() {
    if (!isCloudMode() || !cloudDataApi || typeof cloudDataApi.getOwnerContext !== 'function') {
      cloudUi.sessionActive = false;
      cloudUi.ownerId = '';
      cloudUi.authUserId = '';
      return false;
    }

    const ownerContext = await cloudDataApi.getOwnerContext();
    if (ownerContext && !ownerContext.error && ownerContext.ownerId) {
      cloudUi.sessionActive = true;
      cloudUi.ownerId = ownerContext.ownerId;
      cloudUi.authUserId = ownerContext.authUserId || '';
      if (els.cloudModeBadge) {
        els.cloudModeBadge.textContent = 'Modo Cloud';
      }
      return true;
    }

    cloudUi.sessionActive = false;
    cloudUi.ownerId = '';
    cloudUi.authUserId = '';
    if (els.cloudModeBadge) {
      els.cloudModeBadge.textContent = 'Modo Local';
    }
    return false;
  }

  function normalizeClientRecord(client) {
    if (dataApi && typeof dataApi.normalizeClient === 'function') {
      return dataApi.normalizeClient(client);
    }
    return client;
  }

  function normalizePhoneDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function normalizeChileanPhoneForWhatsApp(value) {
    const digits = normalizePhoneDigits(value);
    if (!digits) {
      return '';
    }
    if (digits.startsWith('56') && digits.length >= 11) {
      return digits;
    }
    if (digits.length >= 8 && digits.length <= 9) {
      return `56${digits}`;
    }
    if (digits.startsWith('0')) {
      const withoutZero = digits.replace(/^0+/, '');
      return withoutZero ? `56${withoutZero}` : '';
    }
    return digits;
  }

  function isValidDateInput(value) {
    if (!value) {
      return true;
    }
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime());
  }

  function formatClientDate(value) {
    if (!value) {
      return 'Sin fecha';
    }
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return 'Sin fecha';
    }
    return date.toLocaleDateString('es-CL');
  }

  function getTodayLocalDate() {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
  }

  function ensureDateValue(input) {
    if (!input || input.value) {
      return;
    }
    input.value = getTodayLocalDate();
  }

  function getActiveTrainingClients() {
    return (state.clients || []).filter((client) => client.client_status === 'active' && client.active !== false);
  }

  function ensureTrainingsV08State() {
    if (!state.trainingsV08 || typeof state.trainingsV08 !== 'object') {
      state.trainingsV08 = { plans: [], sessions: [] };
    }
    if (!Array.isArray(state.trainingsV08.sessions)) {
      state.trainingsV08.sessions = [];
    }
    if (!Array.isArray(state.trainingsV08.plans)) {
      state.trainingsV08.plans = [];
    }
    if (!state.trainingModelVersion) {
      state.trainingModelVersion = '0.8.0';
    }
  }

  function getTrainingSessionsByClient(clientId) {
    ensureTrainingsV08State();
    return (state.trainingsV08.sessions || []).filter((session) => session.clientId === clientId);
  }

  function getSessionStatusLabel(status) {
    const labels = {
      planned: 'Planificada',
      in_progress: 'En progreso',
      completed: 'Completada'
    };
    return labels[status] || 'Planificada';
  }

  function getSessionStatusTone(status) {
    if (status === 'completed') {
      return 'ok';
    }
    if (status === 'in_progress') {
      return 'warn';
    }
    return 'muted';
  }

  function getDefaultSessionTitle(clientId) {
    const client = getClientById(clientId);
    const today = getTodayLocalDate();
    const name = client ? getClientDisplayName(client).split(' ')[0] : 'Alumno';
    return `Entrenamiento ${name} ${today}`;
  }

  function normalizeSessionExerciseOrder(session) {
    const exercises = getSessionExercises(session);
    exercises.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    exercises.forEach((exercise, index) => {
      exercise.order = index + 1;
    });
  }

  function getSessionBuckets(clientId) {
    const today = getTodayLocalDate();
    const sessions = sortSessionsByDateAsc(getTrainingSessionsByClient(clientId));
    const buckets = {
      today: [],
      upcoming: [],
      completed: []
    };

    sessions.forEach((session) => {
      const date = session.date || '';
      if (session.status === 'completed') {
        buckets.completed.push(session);
        return;
      }
      if (date === today) {
        buckets.today.push(session);
        return;
      }
      if (date && date > today) {
        buckets.upcoming.push(session);
        return;
      }
      buckets.today.push(session);
    });

    buckets.completed.reverse();
    return buckets;
  }

  function setActiveSessionForClient(clientId, preferredSessionId = '') {
    const sessions = sortSessionsByDateAsc(getTrainingSessionsByClient(clientId));
    const today = getTodayLocalDate();
    const preferred = preferredSessionId ? sessions.find((session) => session.id === preferredSessionId) : null;
    const fromToday = sessions.find((session) => session.date === today && session.status !== 'completed') || null;
    const fromProgress = sessions.find((session) => session.status === 'in_progress') || null;
    const fallback = sessions[sessions.length - 1] || null;
    const active = preferred || fromToday || fromProgress || fallback;

    trainingUi.activeSessionId = active?.id || '';
    if (active) {
      normalizeSessionExerciseOrder(active);
    }
    const exercises = getSessionExercises(active);
    trainingUi.activeExerciseId = exercises[0]?.id || '';
    trainingUi.editingSetNumber = null;
    trainingUi.editingExerciseId = '';
    if (els.editingSetNumber) {
      els.editingSetNumber.value = '';
    }
    if (els.exerciseIdInput) {
      els.exerciseIdInput.value = '';
    }
  }

  async function createSessionForClient(clientId) {
    const title = String(els.routineName?.value || '').trim() || getDefaultSessionTitle(clientId);
    const date = els.routineDate?.value || getTodayLocalDate();
    const status = els.sessionStatus?.value || 'planned';
    const notes = String(els.sessionNotes?.value || '').trim();

    const session = {
      id: dataApi.createId('tx-session'),
      clientId,
      planId: null,
      groupSessionId: null,
      date,
      title,
      status,
      notes,
      exercises: []
    };

    state.trainingsV08.sessions.push(session);
    setActiveSessionForClient(clientId, session.id);

    if (isCloudSessionActive()) {
      const syncResult = await syncSessionToCloud(session);
      if (!syncResult.ok) {
        return { ok: false, error: syncResult.error || 'No se pudo crear la sesión en Cloud.' };
      }
      return { ok: true, session };
    }

    persist();
    return { ok: true, session };
  }

  function sortSessionsByDateAsc(sessions) {
    return sessions.slice().sort((a, b) => {
      const timeA = new Date(`${a.date || '1970-01-01'}T00:00:00`).getTime();
      const timeB = new Date(`${b.date || '1970-01-01'}T00:00:00`).getTime();
      return timeA - timeB;
    });
  }

  function getSessionExercises(session) {
    return Array.isArray(session?.exercises) ? session.exercises : [];
  }

  function getTrainingExercisesByClientExercise(clientId, exerciseName, options = {}) {
    const normalizedExercise = String(exerciseName || '').trim().toLowerCase();
    if (!normalizedExercise) {
      return [];
    }

    const ignoreSessionId = options.ignoreSessionId || '';
    const sessions = sortSessionsByDateAsc(getTrainingSessionsByClient(clientId));
    const matches = [];
    sessions.forEach((session) => {
      if (ignoreSessionId && session.id === ignoreSessionId) {
        return;
      }
      getSessionExercises(session).forEach((exercise) => {
        const currentName = String(exercise.exerciseName || '').trim().toLowerCase();
        if (currentName === normalizedExercise) {
          matches.push({ session, exercise });
        }
      });
    });
    return matches;
  }

  function getExerciseOptionsForClient(clientId) {
    const sessions = getTrainingSessionsByClient(clientId);
    const unique = new Map();
    sessions.forEach((session) => {
      getSessionExercises(session).forEach((exercise) => {
        const key = String(exercise.exerciseName || '').trim().toLowerCase();
        if (!key) {
          return;
        }
        if (!unique.has(key)) {
          unique.set(key, exercise.exerciseName);
        }
      });
    });
    return Array.from(unique.values());
  }

  function getExerciseSets(exercise) {
    return Array.isArray(exercise?.sets) ? exercise.sets : [];
  }

  function getBestWeightForExercise(clientId, exerciseName, options = {}) {
    const matches = getTrainingExercisesByClientExercise(clientId, exerciseName, options);
    const weights = [];
    matches.forEach(({ exercise }) => {
      getExerciseSets(exercise).forEach((setEntry) => {
        const weight = Number(setEntry.weight || 0);
        if (Number.isFinite(weight) && weight > 0) {
          weights.push(weight);
        }
      });
    });
    return weights.length ? Math.max(...weights) : 0;
  }

  function buildLastSessionSummary(clientId, exerciseName, options = {}) {
    if (!clientId || !exerciseName) {
      return 'Sin registro anterior';
    }

    const matches = getTrainingExercisesByClientExercise(clientId, exerciseName, options);
    if (!matches.length) {
      return 'Sin registro anterior';
    }

    const last = matches[matches.length - 1];
    const sets = getExerciseSets(last.exercise);
    if (!sets.length) {
      return `Última sesión: ${last.session.date ? formatClientDate(last.session.date) : 'sin fecha'} · sin series registradas`;
    }

    const compactSets = sets
      .map((setEntry) => `${Number(setEntry.weight || 0)} kg × ${Number(setEntry.reps || 0)}`)
      .filter((item) => item !== '0 kg × 0');

    if (!compactSets.length) {
      return `Última sesión: ${last.session.date ? formatClientDate(last.session.date) : 'sin fecha'} · sin series registradas`;
    }

    const bestWeight = getBestWeightForExercise(clientId, exerciseName, options);
    return `Última sesión: ${compactSets.join(' | ')}${bestWeight > 0 ? ` · Mejor histórico ${bestWeight} kg` : ''}`;
  }

  function buildProgressSummary(clientId, exerciseName) {
    if (!clientId || !exerciseName) {
      return '<div class="muted">Sin registro anterior</div>';
    }
    const matches = getTrainingExercisesByClientExercise(clientId, exerciseName);
    if (!matches.length) {
      return '<div class="muted">Sin registro anterior</div>';
    }

    const last = matches[matches.length - 1];
    const first = matches[0];
    const lastSet = getExerciseSets(last.exercise)[getExerciseSets(last.exercise).length - 1] || null;
    const firstSet = getExerciseSets(first.exercise)[0] || null;
    const bestWeight = getBestWeightForExercise(clientId, exerciseName);
    const completedSets = getExerciseSets(last.exercise).filter((setEntry) => setEntry.completed !== false).length;
    const plannedSets = Number(last.exercise.plannedSets || 0);

    return `
      <div class="training-progress-grid">
        <div><strong>Último registro</strong><div class="meta">${lastSet ? `${Number(lastSet.weight || 0)} kg × ${Number(lastSet.reps || 0)}` : 'Sin registro'}</div></div>
        <div><strong>Mejor peso histórico</strong><div class="meta">${bestWeight > 0 ? `${bestWeight} kg` : 'Sin registro'}</div></div>
        <div><strong>Primer registro</strong><div class="meta">${firstSet ? `${Number(firstSet.weight || 0)} kg × ${Number(firstSet.reps || 0)}` : 'Sin registro'}</div></div>
        <div><strong>Fecha última sesión</strong><div class="meta">${last.session.date ? escapeHtml(formatClientDate(last.session.date)) : 'Sin fecha'}</div></div>
        <div><strong>Series completadas</strong><div class="meta">${completedSets}${plannedSets ? ` de ${plannedSets}` : ''}</div></div>
      </div>`;
  }

  function findSessionById(sessionId) {
    ensureTrainingsV08State();
    return (state.trainingsV08.sessions || []).find((session) => session.id === sessionId) || null;
  }

  function findExerciseInSession(session, exerciseId) {
    return getSessionExercises(session).find((exercise) => exercise.id === exerciseId) || null;
  }

  function getCurrentTrainingSession() {
    return findSessionById(trainingUi.activeSessionId);
  }

  function getCurrentTrainingExercise() {
    const session = getCurrentTrainingSession();
    if (!session) {
      return null;
    }
    return findExerciseInSession(session, trainingUi.activeExerciseId);
  }

  function stopStudentRestTimer() {
    if (studentUi.restTimerId) {
      clearInterval(studentUi.restTimerId);
      studentUi.restTimerId = null;
    }
    studentUi.restRunning = false;
  }

  function getClientById(clientId) {
    return (state.clients || []).find((client) => client.id === clientId) || null;
  }

  function getStudentSessionForClient(clientId) {
    const sessions = sortSessionsByDateAsc(getTrainingSessionsByClient(clientId));
    if (!sessions.length) {
      return null;
    }
    const today = getTodayLocalDate();
    const todaySession = sessions.find((session) => session.date === today && session.status !== 'completed') || null;
    if (todaySession) {
      return todaySession;
    }
    const nextUpcoming = sessions.find((session) => session.date && session.date > today && session.status !== 'completed') || null;
    if (nextUpcoming) {
      return nextUpcoming;
    }
    const inProgress = sessions.find((session) => session.status === 'in_progress') || null;
    if (inProgress) {
      return inProgress;
    }
    return sessions[sessions.length - 1] || null;
  }

  function enterStudentMode(clientId) {
    const client = getClientById(clientId);
    if (!client || client.client_status !== 'active' || client.active === false) {
      setClientNotice('La vista alumno solo está disponible para clientes activos.', 'warn');
      return;
    }

    const session = getStudentSessionForClient(clientId);
    if (!session) {
      setClientNotice('Este cliente no tiene sesiones planificadas para entrenar.', 'warn');
      return;
    }
    studentUi.enabled = true;
    studentUi.clientId = clientId;
    studentUi.sessionId = session.id;
    studentUi.exerciseIndex = 0;
    studentUi.editingSetNumber = null;
    studentUi.restRemaining = 0;
    studentUi.startedAt = new Date().toISOString();
    stopStudentRestTimer();
    show('studentTraining');
  }

  function exitStudentMode() {
    stopStudentRestTimer();
    studentUi.enabled = false;
    studentUi.clientId = '';
    studentUi.sessionId = '';
    studentUi.exerciseIndex = 0;
    studentUi.editingSetNumber = null;
    studentUi.restRemaining = 0;
    studentUi.startedAt = null;
    show('trainings');
  }

  function getStudentSession() {
    if (!studentUi.sessionId) {
      return null;
    }
    return findSessionById(studentUi.sessionId);
  }

  function getStudentExercises() {
    const session = getStudentSession();
    return session ? getSessionExercises(session) : [];
  }

  function getStudentExercise() {
    const exercises = getStudentExercises();
    if (!exercises.length) {
      return null;
    }
    const safeIndex = Math.max(0, Math.min(studentUi.exerciseIndex, exercises.length - 1));
    studentUi.exerciseIndex = safeIndex;
    return exercises[safeIndex];
  }

  function isExerciseCompleted(exercise) {
    const plannedSets = Number(exercise?.plannedSets || 0);
    const doneSets = getExerciseSets(exercise).filter((setEntry) => setEntry.completed !== false).length;
    return plannedSets > 0 && doneSets >= plannedSets;
  }

  function getPreviousExerciseMetrics(clientId, exerciseName, currentSessionId) {
    const matches = getTrainingExercisesByClientExercise(clientId, exerciseName, { ignoreSessionId: currentSessionId });
    if (!matches.length) {
      return {
        hasHistory: false,
        label: 'Primera vez con este ejercicio',
        lastWeight: 'Sin registro',
        lastReps: 'Sin registro',
        bestWeight: 'Sin registro'
      };
    }

    const last = matches[matches.length - 1];
    const sets = getExerciseSets(last.exercise);
    const lastSet = sets[sets.length - 1] || null;
    const bestWeight = getBestWeightForExercise(clientId, exerciseName, { ignoreSessionId: currentSessionId });
    return {
      hasHistory: true,
      label: buildLastSessionSummary(clientId, exerciseName, { ignoreSessionId: currentSessionId }),
      lastWeight: lastSet ? `${Number(lastSet.weight || 0)} kg` : 'Sin registro',
      lastReps: lastSet ? `${Number(lastSet.reps || 0)}` : 'Sin registro',
      bestWeight: bestWeight > 0 ? `${bestWeight} kg` : 'Sin registro'
    };
  }

  function getStudentSessionStats(session) {
    const exercises = getSessionExercises(session);
    const completedExercises = exercises.filter((exercise) => isExerciseCompleted(exercise)).length;
    const totalSets = exercises.reduce((sum, exercise) => sum + getExerciseSets(exercise).length, 0);
    const potentialRecords = exercises.reduce((sum, exercise) => sum + getExerciseSets(exercise).filter((setEntry) => setEntry.personalRecord).length, 0);
    const estimatedDurationMinutes = Math.max(1, Math.round(exercises.reduce((sum, exercise) => {
      const planned = Number(exercise.plannedSets || 0);
      const rest = Number(exercise.restSeconds || 0);
      return sum + (planned * (rest + 45));
    }, 0) / 60));
    return {
      completedExercises,
      totalExercises: exercises.length,
      totalSets,
      potentialRecords,
      estimatedDurationMinutes
    };
  }

  function notifyRestFinished() {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([150, 80, 150]);
    }
    try {
      if (typeof window !== 'undefined' && typeof window.AudioContext === 'function') {
        const context = new window.AudioContext();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gain.gain.value = 0.04;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.2);
      }
    } catch (_) {
      // Silent fallback when audio is not available.
    }
  }

  function startStudentRest() {
    const exercise = getStudentExercise();
    const restSeconds = Number(exercise?.restSeconds || 0);
    if (!restSeconds) {
      return;
    }
    stopStudentRestTimer();
    studentUi.restRemaining = restSeconds;
    studentUi.restRunning = true;
    studentUi.restTimerId = setInterval(() => {
      studentUi.restRemaining = Math.max(0, studentUi.restRemaining - 1);
      if (studentUi.restRemaining <= 0) {
        stopStudentRestTimer();
        notifyRestFinished();
      }
      renderStudentTraining();
    }, 1000);
    renderStudentTraining();
  }

  async function saveStudentSetEntry() {
    const session = getStudentSession();
    const exercise = getStudentExercise();
    if (!session || !exercise) {
      if (els.studentSetNotice) {
        els.studentSetNotice.textContent = 'No hay ejercicio activo para registrar.';
      }
      return;
    }

    if (session.status === 'planned') {
      session.status = 'in_progress';
    }

    const weight = Number(els.studentWeightInput?.value || 0);
    const reps = Number(els.studentRepsInput?.value || 0);
    const completed = els.studentSetCompleted ? els.studentSetCompleted.checked : true;
    if (!Number.isFinite(weight) || weight < 0 || !Number.isFinite(reps) || reps < 0) {
      if (els.studentSetNotice) {
        els.studentSetNotice.textContent = 'Ingresa valores válidos.';
      }
      return;
    }

    const sets = getExerciseSets(exercise);
    const requestedSetNumber = Number(els.studentEditingSetNumber?.value || studentUi.editingSetNumber || 0);
    const plannedSets = Math.max(1, Number(exercise.plannedSets || 1));
    if (!requestedSetNumber && sets.length >= plannedSets) {
      if (els.studentSetNotice) {
        els.studentSetNotice.textContent = 'Ejercicio completado. Usa Siguiente ejercicio o corrige una serie.';
      }
      return;
    }
    const nextSetNumber = requestedSetNumber || (sets.length + 1);
    const previousBestWeight = getBestWeightForExercise(session.clientId, exercise.exerciseName, { ignoreSessionId: session.id });
    const isPotentialRecord = weight > previousBestWeight && weight > 0;

    const existingSet = sets.find((setEntry) => Number(setEntry.setNumber || 0) === Number(nextSetNumber));
    if (existingSet) {
      existingSet.weight = weight;
      existingSet.reps = reps;
      existingSet.completed = completed;
      existingSet.personalRecord = isPotentialRecord;
      existingSet.techniqueStatus = existingSet.techniqueStatus || 'pending';
      existingSet.coachValidated = Boolean(existingSet.coachValidated);
    } else {
      sets.push({
        setNumber: nextSetNumber,
        weight,
        reps,
        completed,
        createdAt: new Date().toISOString(),
        techniqueStatus: 'pending',
        coachValidated: false,
        personalRecord: isPotentialRecord
      });
    }
    sets.sort((a, b) => Number(a.setNumber || 0) - Number(b.setNumber || 0));

    studentUi.editingSetNumber = null;
    if (els.studentEditingSetNumber) {
      els.studentEditingSetNumber.value = '';
    }
    if (els.studentRepsInput) {
      els.studentRepsInput.value = '';
    }
    if (els.studentSetNotice) {
      els.studentSetNotice.textContent = isPotentialRecord ? '🏆 Posible nuevo récord' : 'Serie guardada. Inicia descanso.';
    }

    const doneSets = sets.filter((setEntry) => setEntry.completed !== false).length;
    if (doneSets < plannedSets && !els.studentWeightInput?.value) {
      els.studentWeightInput.value = String(Number(exercise.targetWeight || 0));
    }

    if (isCloudSessionActive()) {
      const syncResult = await syncSessionToCloud(session);
      if (!syncResult.ok) {
        if (els.studentSetNotice) {
          els.studentSetNotice.textContent = syncResult.error || 'No se pudo sincronizar la serie en Cloud.';
        }
        return;
      }
      renderStudentTraining();
      return;
    }

    persist();
  }

  async function goToNextStudentExercise() {
    const exercises = getStudentExercises();
    if (!exercises.length) {
      return;
    }
    if (studentUi.exerciseIndex < exercises.length - 1) {
      studentUi.exerciseIndex += 1;
      studentUi.editingSetNumber = null;
      if (els.studentEditingSetNumber) {
        els.studentEditingSetNumber.value = '';
      }
      if (els.studentSetNotice) {
        els.studentSetNotice.textContent = '';
      }
      renderStudentTraining();
      return;
    }

    const session = getStudentSession();
    if (session) {
      session.status = 'completed';
    }

    if (isCloudSessionActive() && session) {
      const syncResult = await syncSessionToCloud(session);
      if (!syncResult.ok) {
        if (els.studentSetNotice) {
          els.studentSetNotice.textContent = syncResult.error || 'No se pudo completar la sesión en Cloud.';
        }
        return;
      }
      renderStudentTraining();
      return;
    }

    persist();
  }

  async function finalizeStudentSession() {
    const session = getStudentSession();
    if (session) {
      session.status = 'completed';
    }
    stopStudentRestTimer();

    if (isCloudSessionActive() && session) {
      const syncResult = await syncSessionToCloud(session);
      if (!syncResult.ok) {
        if (els.studentSetNotice) {
          els.studentSetNotice.textContent = syncResult.error || 'No se pudo finalizar en Cloud.';
        }
        return;
      }
      renderStudentTraining();
    } else {
      persist();
    }

    exitStudentMode();
  }

  function renderStudentTraining() {
    if (!els.sections.studentTraining) {
      return;
    }

    const client = getClientById(studentUi.clientId);
    const session = getStudentSession();
    const exercises = getStudentExercises();
    const exercise = getStudentExercise();

    if (!studentUi.enabled || !client || !session || !exercise) {
      if (els.studentName) {
        els.studentName.textContent = 'Sin sesión activa';
      }
      return;
    }

    const metrics = getPreviousExerciseMetrics(client.id, exercise.exerciseName, session.id);
    const sets = getExerciseSets(exercise);
    const doneSets = sets.filter((setEntry) => setEntry.completed !== false).length;
    const plannedSets = Number(exercise.plannedSets || 0);
    const progressText = `Ejercicio ${studentUi.exerciseIndex + 1} de ${Math.max(1, exercises.length)}`;
    const sessionStats = getStudentSessionStats(session);
    const progressPercent = sessionStats.totalExercises > 0
      ? Math.round((sessionStats.completedExercises / sessionStats.totalExercises) * 100)
      : 0;

    if (els.studentName) {
      els.studentName.textContent = getClientDisplayName(client);
    }
    if (els.studentSessionTitle) {
      els.studentSessionTitle.textContent = session.title || 'Sesión de hoy';
    }
    if (els.studentSessionDate) {
      els.studentSessionDate.textContent = formatClientDate(session.date || getTodayLocalDate());
    }
    if (els.studentExerciseProgress) {
      els.studentExerciseProgress.textContent = progressText;
    }
    if (els.studentSessionProgressBar) {
      els.studentSessionProgressBar.style.width = `${progressPercent}%`;
    }
    if (els.studentSessionProgressText) {
      els.studentSessionProgressText.textContent = `${progressPercent}% completado`;
    }

    if (els.studentExerciseName) {
      els.studentExerciseName.textContent = exercise.exerciseName;
    }
    if (els.studentExercisePlan) {
      els.studentExercisePlan.textContent = `${plannedSets} series · ${Number(exercise.plannedRepMin || 0)}-${Number(exercise.plannedRepMax || 0)} repeticiones`;
    }
    if (els.studentExerciseTarget) {
      els.studentExerciseTarget.textContent = Number(exercise.targetWeight || 0) > 0
        ? `Peso objetivo ${Number(exercise.targetWeight || 0)} kg`
        : 'Sin peso objetivo definido';
    }
    if (els.studentExerciseRest) {
      els.studentExerciseRest.textContent = `Descanso ${Number(exercise.restSeconds || 0)} s`;
    }
    if (els.studentExerciseLast) {
      els.studentExerciseLast.textContent = metrics.label;
    }
    if (els.studentLastWeight) {
      els.studentLastWeight.textContent = metrics.lastWeight;
    }
    if (els.studentLastReps) {
      els.studentLastReps.textContent = metrics.lastReps;
    }
    if (els.studentBestWeight) {
      els.studentBestWeight.textContent = metrics.bestWeight;
    }
    if (els.studentTechniqueNote) {
      els.studentTechniqueNote.textContent = exercise.coachNotes || 'Sin instrucción';
    }

    const nextSetNumber = studentUi.editingSetNumber || Math.min(sets.length + 1, Math.max(1, plannedSets));
    if (els.studentWeightInput && !els.studentWeightInput.value) {
      const fallbackWeight = Number(exercise.targetWeight || 0);
      if (fallbackWeight > 0) {
        els.studentWeightInput.value = String(fallbackWeight);
      }
    }
    if (els.studentSetList) {
      els.studentSetList.innerHTML = sets.length
        ? sets.map((setEntry) => `
          <div class="student-set-item">
            <div>
              <strong>Serie ${Number(setEntry.setNumber || 0)}</strong>
              <div class="meta">${Number(setEntry.weight || 0)} kg × ${Number(setEntry.reps || 0)}</div>
              <div class="meta">${setEntry.personalRecord ? '🏆 Posible nuevo récord' : ''}</div>
            </div>
            <button class="secondary small" type="button" data-student-set-edit="${Number(setEntry.setNumber || 0)}">Corregir</button>
          </div>`).join('')
        : '<div class="muted">Todavía no hay series registradas en este ejercicio.</div>';
    }

    if (els.studentExerciseCompletedNotice) {
      const completed = plannedSets > 0 && doneSets >= plannedSets;
      els.studentExerciseCompletedNotice.classList.toggle('hidden', !completed);
      els.studentExerciseCompletedNotice.textContent = completed ? 'Ejercicio completado' : `Serie ${nextSetNumber} de ${Math.max(1, plannedSets)}`;
    }

    if (els.studentNextExerciseBtn) {
      els.studentNextExerciseBtn.textContent = studentUi.exerciseIndex < exercises.length - 1 ? 'Siguiente ejercicio' : 'Completar sesión';
    }

    if (els.studentRestValue) {
      const baseRest = Number(exercise.restSeconds || 0);
      const displayRest = studentUi.restRunning || studentUi.restRemaining > 0 ? studentUi.restRemaining : baseRest;
      els.studentRestValue.textContent = `${Math.max(0, displayRest)} s`;
    }

    if (els.studentSessionFinishPanel) {
      const sessionDone = session.status === 'completed' || (sessionStats.totalExercises > 0 && sessionStats.completedExercises >= sessionStats.totalExercises);
      els.studentSessionFinishPanel.classList.toggle('hidden', !sessionDone);
      if (sessionDone && els.studentSessionSummary) {
        els.studentSessionSummary.innerHTML = `
          <div class="meta">Ejercicios completados: ${sessionStats.completedExercises}/${sessionStats.totalExercises}</div>
          <div class="meta">Series realizadas: ${sessionStats.totalSets}</div>
          <div class="meta">Récords potenciales: ${sessionStats.potentialRecords}</div>
          <div class="meta">Duración estimada: ${sessionStats.estimatedDurationMinutes} min</div>`;
      }
    }
  }

  function getClientDisplayName(client) {
    return client.full_name || client.name || 'Cliente sin nombre';
  }

  function getClientRenewalLabel(client) {
    if (client.renewal_date) {
      return formatClientDate(client.renewal_date);
    }
    if (client.renewal_day) {
      return `Día ${client.renewal_day}`;
    }
    return 'Sin fecha';
  }

  function getClientStatusTone(client) {
    if (client.client_status === 'inactive' || client.active === false) {
      return 'muted';
    }
    if (client.payment_status === 'overdue') {
      return 'bad';
    }
    if (client.payment_status === 'paid') {
      return 'ok';
    }
    return 'warn';
  }

  function getClientStatusLabel(client) {
    const labels = {
      paid: 'Pagado',
      pending: 'Pendiente',
      overdue: 'Atrasado',
      uncertain: 'En duda'
    };
    return labels[client.payment_status] || 'Pendiente';
  }

  function getClientPresenceLabel(client) {
    const labels = {
      active: 'Activo',
      paused: 'Pausado',
      uncertain: 'En duda',
      inactive: 'Inactivo'
    };
    return labels[client.client_status] || 'Activo';
  }

  function getVisibleClients() {
    const search = clientUi.search.trim().toLowerCase();
    return (clientUi.records || []).filter((client) => {
      const searchableText = `${getClientDisplayName(client)} ${client.phone || ''}`.toLowerCase();
      const matchesSearch = !search || searchableText.includes(search);
      if (!matchesSearch) {
        return false;
      }

      if (clientUi.filter === 'all') {
        return true;
      }
      if (clientUi.filter === 'active') {
        return client.client_status === 'active';
      }
      if (clientUi.filter === 'inactive') {
        return client.client_status === 'inactive';
      }
      if (clientUi.filter === 'uncertain') {
        return client.client_status === 'uncertain' || client.payment_status === 'uncertain';
      }
      if (clientUi.filter === 'pending') {
        return client.payment_status === 'pending' || client.payment_status === 'overdue';
      }
      return true;
    });
  }

  function setClientNotice(message, tone = 'neutral') {
    clientUi.notice = message;
    clientUi.noticeTone = tone;
    if (els.clientMessage) {
      els.clientMessage.textContent = message;
      els.clientMessage.classList.toggle('ok', tone === 'ok');
      els.clientMessage.classList.toggle('bad', tone === 'bad');
      els.clientMessage.classList.toggle('warn', tone === 'warn');
      els.clientMessage.classList.toggle('muted', tone === 'neutral');
    }
  }

  function clearClientForm() {
    if (!els.clientForm) {
      return;
    }
    els.clientForm.reset();
    const defaults = {
      clientService: 'Personalizado',
      clientStatus: 'active',
      clientPaymentStatus: 'pending'
    };
    Object.entries(defaults).forEach(([elementId, value]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.value = value;
      }
    });
    const clientIdInput = document.getElementById('clientId');
    if (clientIdInput) {
      clientIdInput.value = '';
    }
  }

  function fillClientForm(client) {
    if (!els.clientForm) {
      return;
    }
    document.getElementById('clientId').value = client?.id || '';
    document.getElementById('clientFullName').value = client?.full_name || client?.name || '';
    document.getElementById('clientPhone').value = client?.phone || '';
    document.getElementById('clientService').value = client?.service || 'Personalizado';
    document.getElementById('clientMonthlyValue').value = Number(client?.monthly_value ?? client?.amount ?? 0) || 0;
    document.getElementById('clientStatus').value = client?.client_status || 'active';
    document.getElementById('clientPaymentStatus').value = client?.payment_status || 'pending';
    document.getElementById('clientEmail').value = client?.email || '';
    document.getElementById('clientBirthDate').value = client?.birth_date || '';
    document.getElementById('clientTrainingDays').value = client?.training_days || '';
    document.getElementById('clientSchedule').value = client?.schedule_notes || '';
    document.getElementById('clientStartDate').value = client?.start_date || '';
    document.getElementById('clientRenewalDate').value = client?.renewal_date || '';
    document.getElementById('clientObjective').value = client?.objective || '';
    document.getElementById('clientInjuries').value = client?.injuries || '';
    document.getElementById('clientObservations').value = client?.observations || '';
    document.getElementById('clientEmergencyContact').value = client?.emergency_contact || '';
    document.getElementById('clientEmergencyPhone').value = client?.emergency_phone || '';
  }

  function toggleClientForm(open = true, client = null) {
    clientUi.formOpen = open;
    clientUi.editingId = client?.id || null;
    if (els.clientFormPanel) {
      els.clientFormPanel.classList.toggle('hidden', !open);
    }
    if (els.clientFormTitle) {
      els.clientFormTitle.textContent = client ? 'Editar cliente' : 'Nuevo cliente';
    }
    if (client) {
      fillClientForm(client);
    } else {
      clearClientForm();
    }
    if (open) {
      setClientNotice(client ? `Editando ${getClientDisplayName(client)}.` : 'Completa el formulario para crear un cliente.', 'neutral');
    }
  }

  function buildClientFormPayload() {
    if (!els.clientForm) {
      return null;
    }
    return Object.fromEntries(new FormData(els.clientForm).entries());
  }

  function validateClientPayload(payload, existingId = null) {
    const errors = [];
    const fullName = String(payload.fullName || '').trim();
    const phone = String(payload.phone || '').trim();
    const monthlyValue = Number(payload.monthlyValue);

    if (!fullName) {
      errors.push('El nombre no puede estar vacío');
    }
    if (!phone) {
      errors.push('El teléfono es obligatorio');
    }
    if (!payload.service) {
      errors.push('El servicio es obligatorio');
    }
    if (!Number.isFinite(monthlyValue) || monthlyValue < 0) {
      errors.push('El valor mensual no puede ser negativo');
    }

    ['birthDate', 'startDate', 'renewalDate'].forEach((field) => {
      if (!isValidDateInput(payload[field])) {
        errors.push(`La fecha de ${field} no es válida`);
      }
    });

    const phoneKey = normalizePhoneDigits(phone);
    const nameKey = fullName.toLowerCase();
    const duplicate = (clientUi.records || []).some((client) => {
      if (existingId && client.id === existingId) {
        return false;
      }
      return getClientDisplayName(client).trim().toLowerCase() === nameKey && normalizePhoneDigits(client.phone) === phoneKey;
    });
    if (duplicate) {
      errors.push('Ya existe un cliente con ese nombre y teléfono');
    }

    return { valid: errors.length === 0, errors };
  }

  function buildClientRecord(payload, existingClient = null) {
    const fullName = String(payload.fullName || '').trim();
    const monthlyValue = Number(payload.monthlyValue || 0);
    const renewalDate = payload.renewalDate || '';
    const clientStatus = payload.clientStatus || 'active';
    const paymentStatus = payload.paymentStatus || 'pending';
    const clientId = existingClient?.id || (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : dataApi.createId('client'));

    return normalizeClientRecord({
      ...existingClient,
      id: clientId,
      full_name: fullName,
      name: fullName,
      phone: payload.phone || '',
      email: payload.email || '',
      birth_date: payload.birthDate || '',
      training_days: payload.trainingDays || '',
      service: payload.service || 'Personalizado',
      monthly_value: monthlyValue,
      amount: monthlyValue,
      client_status: clientStatus,
      payment_status: paymentStatus,
      status: paymentStatus,
      schedule_notes: payload.schedule || '',
      objective: payload.objective || '',
      injuries: payload.injuries || '',
      observations: payload.observations || '',
      emergency_contact: payload.emergencyContact || '',
      emergency_phone: payload.emergencyPhone || '',
      start_date: payload.startDate || '',
      renewal_date: renewalDate,
      renewal_day: renewalDate ? new Date(`${renewalDate}T00:00:00`).getDate() : (existingClient?.renewal_day || ''),
      active: clientStatus !== 'inactive',
      continues: clientStatus !== 'inactive',
      createdAt: existingClient?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  function renderClientDetail(client) {
    if (!els.clientDetail) {
      return;
    }

    if (!client) {
      els.clientDetail.innerHTML = '<div class="muted">Selecciona "Ver ficha" para revisar el detalle completo.</div>';
      return;
    }

    els.clientDetail.innerHTML = `
      <div class="client-detail-card">
        <div class="client-card-head">
          <div>
            <h3>${escapeHtml(getClientDisplayName(client))}</h3>
            <div class="meta">${escapeHtml(client.phone || 'Sin teléfono')}</div>
          </div>
          <span class="client-badge ${getClientStatusTone(client)}">${escapeHtml(getClientStatusLabel(client))}</span>
        </div>
        <div class="client-detail-grid">
          <div><strong>Servicio</strong><div class="meta">${escapeHtml(client.service || 'Sin servicio')}</div></div>
          <div><strong>Estado del cliente</strong><div class="meta">${escapeHtml(getClientPresenceLabel(client))}</div></div>
          <div><strong>Valor mensual</strong><div class="meta">${financeApi.formatCurrency(Number(client.monthly_value ?? client.amount ?? 0))}</div></div>
          <div><strong>Fecha de renovación</strong><div class="meta">${escapeHtml(getClientRenewalLabel(client))}</div></div>
          <div><strong>Horario</strong><div class="meta">${escapeHtml(client.schedule_notes || 'Sin horario')}</div></div>
          <div><strong>Días de entrenamiento</strong><div class="meta">${escapeHtml(client.training_days || 'Sin información')}</div></div>
          <div><strong>Correo</strong><div class="meta">${escapeHtml(client.email || 'Sin correo')}</div></div>
          <div><strong>Objetivo</strong><div class="meta">${escapeHtml(client.objective || 'Sin objetivo')}</div></div>
          <div><strong>Contacto de emergencia</strong><div class="meta">${escapeHtml(client.emergency_contact || 'Sin contacto')}</div></div>
          <div><strong>Teléfono de emergencia</strong><div class="meta">${escapeHtml(client.emergency_phone || 'Sin teléfono')}</div></div>
          <div><strong>Lesiones</strong><div class="meta">${escapeHtml(client.injuries || 'Sin información')}</div></div>
          <div><strong>Observaciones</strong><div class="meta">${escapeHtml(client.observations || 'Sin observaciones')}</div></div>
          <div><strong>Fecha de inicio</strong><div class="meta">${escapeHtml(formatClientDate(client.start_date))}</div></div>
        </div>
        <div class="inline-actions">
          ${client.client_status === 'active' && client.active !== false ? `<button class="primary" type="button" data-client-student-view="${client.id}">Vista alumno</button>` : '<span class="muted">Vista alumno disponible para clientes activos</span>'}
        </div>
      </div>`;
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
            await refreshCloudSessionState();
            await refreshClients();
            await refreshTrainingsV08FromCloud();
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
      els.cloudModeBadge.textContent = isCloudSessionActive() ? 'Modo Cloud' : 'Modo Local';
    }
    renderAuthPanel();
    Object.entries(els.sections).forEach(([name, element]) => {
      element.classList.toggle('hidden', name !== section);
    });
    if (els.nav) {
      els.nav.classList.toggle('hidden', section === 'studentTraining');
    }
    document.querySelectorAll('[data-nav]').forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-nav') === section);
    });
    if (section === 'clients') {
      refreshClients().catch(() => {});
    }
    if (section === 'register') {
      ensureDateValue(document.getElementById('date'));
    }
    if (section === 'trainings') {
      ensureDateValue(els.routineDate);
      refreshTrainingsV08FromCloud().catch(() => {});
    }
    if (section === 'studentTraining') {
      renderStudentTraining();
    }
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
      els.quickCategories.innerHTML = (state.categories || [])
        .filter((category) => !['Mariela', 'Magic'].includes(category.name))
        .map((category) => `<button class="chip" type="button" data-quick-category="${escapeHtml(category.name)}">${escapeHtml(category.name)}</button>`).join('');
    }

    ensureDateValue(document.getElementById('date'));

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
    if (!els.clientList) {
      return;
    }

    const visibleClients = getVisibleClients();
    const selectedClient = clientUi.detailId ? (visibleClients.find((client) => client.id === clientUi.detailId) || clientUi.records.find((client) => client.id === clientUi.detailId)) : visibleClients[0] || null;

    if (els.clientCount) {
      els.clientCount.textContent = `${visibleClients.length} cliente${visibleClients.length === 1 ? '' : 's'}`;
    }
    if (els.clientSearch && els.clientSearch.value !== clientUi.search) {
      els.clientSearch.value = clientUi.search;
    }
    document.querySelectorAll('[data-client-filter]').forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-client-filter') === clientUi.filter);
    });
    if (els.clientFormPanel) {
      els.clientFormPanel.classList.toggle('hidden', !clientUi.formOpen);
    }
    if (els.clientFormTitle) {
      els.clientFormTitle.textContent = clientUi.editingId ? 'Editar cliente' : 'Nuevo cliente';
    }
    if (els.clientSubmitBtn) {
      els.clientSubmitBtn.textContent = clientUi.editingId ? 'Actualizar cliente' : 'Guardar cliente';
      els.clientSubmitBtn.disabled = clientUi.saving;
    }
    if (els.clientNewBtn) {
      els.clientNewBtn.disabled = clientUi.saving;
    }

    const emptyMessage = clientUi.loading
      ? '<div class="muted">Cargando clientes...</div>'
      : '<div class="muted">No hay clientes para mostrar.</div>';

    els.clientList.innerHTML = visibleClients.length ? visibleClients.map((client) => {
      const tone = getClientStatusTone(client);
      const serviceLabel = escapeHtml(client.service || 'Sin servicio');
      const scheduleLabel = escapeHtml(client.schedule_notes || 'Sin horario');
      const whatsappPhone = normalizeChileanPhoneForWhatsApp(client.phone);
      return `
        <article class="client-card">
          <div class="client-card-head">
            <div>
              <h3>${escapeHtml(getClientDisplayName(client))}</h3>
              <div class="meta">${serviceLabel} · ${scheduleLabel}</div>
            </div>
            <span class="client-badge ${tone}">${escapeHtml(getClientStatusLabel(client))}</span>
          </div>
          <div class="client-card-body">
            <div><strong>Valor mensual</strong><div class="meta">${financeApi.formatCurrency(Number(client.monthly_value ?? client.amount ?? 0))}</div></div>
            <div><strong>Renovación</strong><div class="meta">${escapeHtml(getClientRenewalLabel(client))}</div></div>
            <div><strong>Estado del cliente</strong><div class="meta">${escapeHtml(getClientPresenceLabel(client))}</div></div>
          </div>
          <div class="inline-actions client-actions">
            <button class="ghost small" type="button" data-client-view="${client.id}">Ver ficha</button>
            <button class="secondary small" type="button" data-client-edit="${client.id}">Editar</button>
            <button class="secondary small" type="button" data-client-whatsapp="${client.id}" ${whatsappPhone ? '' : 'disabled'}>WhatsApp</button>
          </div>
        </article>`;
    }).join('') : emptyMessage;

    renderClientDetail(selectedClient);
    if (clientUi.notice && els.clientMessage) {
      els.clientMessage.textContent = clientUi.notice;
      els.clientMessage.classList.toggle('ok', clientUi.noticeTone === 'ok');
      els.clientMessage.classList.toggle('bad', clientUi.noticeTone === 'bad');
      els.clientMessage.classList.toggle('warn', clientUi.noticeTone === 'warn');
      els.clientMessage.classList.toggle('muted', clientUi.noticeTone === 'neutral');
    }
  }

  async function refreshClients() {
    clientUi.loading = true;
    clientUi.records = (state.clients || []).map((client) => normalizeClientRecord(client));
    renderClients();

    const hasCloudSession = await refreshCloudSessionState();
    if (!hasCloudSession || !cloudDataApi || typeof cloudDataApi.listClients !== 'function') {
      clientUi.loading = false;
      renderClients();
      return;
    }

    const response = await cloudDataApi.listClients();
    if (response && response.error && response.error !== 'Modo local') {
      setClientNotice(response.error, 'bad');
    }

    if (response && Array.isArray(response.data)) {
      state.clients = response.data.map((client) => normalizeClientRecord(client));
      clientUi.records = state.clients.slice();
    }

    if (response && !response.error) {
      setClientNotice('', 'neutral');
    }

    clientUi.loading = false;
    renderClients();
  }

  async function refreshTrainingsV08FromCloud() {
    ensureTrainingsV08State();
    const hasCloudSession = await refreshCloudSessionState();
    if (!hasCloudSession || !cloudDataApi || typeof cloudDataApi.listTrainingSessions !== 'function') {
      return;
    }

    const sessionsResponse = await cloudDataApi.listTrainingSessions();
    if (sessionsResponse && sessionsResponse.error && sessionsResponse.error !== 'Modo local') {
      if (els.routineMessage) {
        els.routineMessage.textContent = sessionsResponse.error.message || sessionsResponse.error;
      }
      return;
    }

    if (sessionsResponse && Array.isArray(sessionsResponse.data)) {
      state.trainingModelVersion = '0.8.0';
      state.trainingsV08.sessions = sessionsResponse.data.slice();
    }

    if (cloudDataApi && typeof cloudDataApi.listTrainingPlans === 'function') {
      const plansResponse = await cloudDataApi.listTrainingPlans();
      if (plansResponse && Array.isArray(plansResponse.data)) {
        state.trainingsV08.plans = plansResponse.data.map((plan) => ({
          id: plan.id,
          clientId: plan.client_id,
          name: plan.name || 'Plan de entrenamiento',
          active: plan.active !== false,
          notes: plan.notes || ''
        }));
      }
    }

    renderTrainings();
    renderStudentTraining();
  }

  async function syncSessionToCloud(session) {
    if (!session) {
      return { ok: false, error: 'Sesion invalida' };
    }
    const hasCloudSession = await refreshCloudSessionState();
    if (!hasCloudSession || !cloudDataApi || typeof cloudDataApi.saveTrainingSessionDeep !== 'function') {
      return { ok: false, error: 'Modo local' };
    }

    const response = await cloudDataApi.saveTrainingSessionDeep(session);
    if (response && response.error) {
      return { ok: false, error: response.error.message || response.error };
    }

    return { ok: true };
  }

  function openClientWhatsApp(client) {
    const phone = normalizeChileanPhoneForWhatsApp(client.phone);
    if (!phone) {
      setClientNotice('El cliente no tiene un teléfono válido para WhatsApp.', 'warn');
      return;
    }
    window.open(`https://wa.me/${phone}`, '_blank', 'noopener,noreferrer');
  }

  function getCloudClientPayload(client) {
    return {
      full_name: client.full_name,
      email: client.email || null,
      birth_date: client.birth_date || null,
      phone: client.phone || null,
      service: client.service || null,
      schedule_notes: client.schedule_notes || null,
      objective: client.objective || null,
      injuries: client.injuries || null,
      observations: client.observations || null,
      emergency_contact: client.emergency_contact || null,
      emergency_phone: client.emergency_phone || null,
      start_date: client.start_date || null,
      renewal_date: client.renewal_date || null,
      monthly_value: Number(client.monthly_value ?? client.amount ?? 0),
      payment_status: client.payment_status || 'pending',
      client_status: client.client_status || 'active',
      active: client.client_status !== 'inactive',
      auth_user_id: null
    };
  }

  async function handleClientSubmit(event) {
    event.preventDefault();
    if (clientUi.saving) {
      return;
    }

    if (isCloudMode()) {
      await refreshCloudSessionState();
    }

    const payload = buildClientFormPayload();
    const existingClient = clientUi.editingId ? (clientUi.records || []).find((client) => client.id === clientUi.editingId) || null : null;
    const validation = validateClientPayload(payload, clientUi.editingId);
    if (!validation.valid) {
      setClientNotice(validation.errors.join('. '), 'bad');
      return;
    }

    clientUi.saving = true;
    if (els.clientSubmitBtn) {
      els.clientSubmitBtn.disabled = true;
    }
    if (els.clientNewBtn) {
      els.clientNewBtn.disabled = true;
    }
    setClientNotice('Guardando cliente...', 'neutral');

    try {
      const nextClient = buildClientRecord(payload, existingClient);
      let savedClient = nextClient;

      if (isCloudSessionActive()) {
        if (!cloudDataApi || typeof cloudDataApi.createClient !== 'function' || typeof cloudDataApi.updateClient !== 'function') {
          throw new Error('La integración Cloud no está disponible');
        }
        const cloudPayload = getCloudClientPayload(nextClient);
        const response = existingClient
          ? await cloudDataApi.updateClient(existingClient.id, cloudPayload)
          : await cloudDataApi.createClient(cloudPayload);

        if (response.error) {
          throw new Error(response.error.message || response.error || 'No se pudo guardar el cliente en Cloud');
        }
        savedClient = normalizeClientRecord(response.data || nextClient);
      }

      const normalizedSavedClient = normalizeClientRecord(savedClient);
      const nextRecords = (clientUi.records || []).filter((client) => client.id !== normalizedSavedClient.id);
      nextRecords.unshift(normalizedSavedClient);
      clientUi.records = nextRecords;
      state.clients = nextRecords.map((client) => normalizeClientRecord(client));
      clientUi.detailId = normalizedSavedClient.id;
      clientUi.formOpen = false;
      clientUi.editingId = null;
      clearClientForm();
      if (els.clientFormPanel) {
        els.clientFormPanel.classList.add('hidden');
      }
      setClientNotice(existingClient ? 'Cliente actualizado correctamente.' : 'Cliente guardado correctamente.', 'ok');
      if (!isCloudSessionActive()) {
        persist();
      } else {
        render();
      }
      renderClients();
    } catch (error) {
      setClientNotice(error.message || 'No se pudo guardar el cliente.', 'bad');
    } finally {
      clientUi.saving = false;
      if (els.clientSubmitBtn) {
        els.clientSubmitBtn.disabled = false;
      }
      if (els.clientNewBtn) {
        els.clientNewBtn.disabled = false;
      }
      renderClients();
    }
  }

  function editClientById(clientId) {
    const client = (clientUi.records || []).find((item) => item.id === clientId);
    if (!client) {
      setClientNotice('No se encontró el cliente para editar.', 'bad');
      return;
    }
    toggleClientForm(true, client);
    clientUi.detailId = client.id;
    renderClients();
  }

  function selectClientDetail(clientId) {
    const client = (clientUi.records || []).find((item) => item.id === clientId);
    if (client) {
      clientUi.detailId = client.id;
      renderClients();
    }
  }

  function renderTrainings() {
    ensureTrainingsV08State();
    const activeClients = getActiveTrainingClients();
    const selectedClientId = trainingUi.selectedClientId && activeClients.some((client) => client.id === trainingUi.selectedClientId)
      ? trainingUi.selectedClientId
      : (activeClients[0]?.id || '');
    trainingUi.selectedClientId = selectedClientId;

    if (!findSessionById(trainingUi.activeSessionId) || findSessionById(trainingUi.activeSessionId)?.clientId !== selectedClientId) {
      setActiveSessionForClient(selectedClientId);
    }

    const clientOptions = activeClients.map((client) => `<option value="${client.id}" ${client.id === selectedClientId ? 'selected' : ''}>${escapeHtml(getClientDisplayName(client))}</option>`).join('');

    if (els.studentId) {
      els.studentId.innerHTML = clientOptions || '<option value="">Primero debes crear un cliente</option>';
      els.studentId.disabled = !activeClients.length;
    }
    if (els.historyClientId) {
      els.historyClientId.innerHTML = clientOptions || '<option value="">Primero debes crear un cliente</option>';
      els.historyClientId.value = selectedClientId;
      els.historyClientId.disabled = !activeClients.length;
    }
    if (els.trainingClientNotice) {
      els.trainingClientNotice.textContent = activeClients.length ? '' : 'Primero debes crear un cliente';
      els.trainingClientNotice.classList.toggle('hidden', Boolean(activeClients.length));
    }

    const sessions = sortSessionsByDateAsc(getTrainingSessionsByClient(selectedClientId));
    const activeSession = getCurrentTrainingSession();
    const currentSession = activeSession && activeSession.clientId === selectedClientId ? activeSession : null;
    if (!currentSession && selectedClientId) {
      setActiveSessionForClient(selectedClientId);
    }
    const confirmedSession = getCurrentTrainingSession();
    const selectedSession = confirmedSession && confirmedSession.clientId === selectedClientId ? confirmedSession : null;

    if (els.trainingSessionId) {
      const sessionOptions = sessions.map((session) => {
        const dateLabel = session.date ? formatClientDate(session.date) : 'Sin fecha';
        return `<option value="${session.id}" ${session.id === selectedSession?.id ? 'selected' : ''}>${escapeHtml(dateLabel)} · ${escapeHtml(session.title || 'Sesión')} · ${escapeHtml(getSessionStatusLabel(session.status))}</option>`;
      }).join('');
      els.trainingSessionId.innerHTML = sessionOptions || '<option value="">No hay sesiones. Crea una nueva.</option>';
      els.trainingSessionId.disabled = !sessions.length;
    }

    if (els.routineDate && (!els.routineDate.value || selectedSession)) {
      els.routineDate.value = selectedSession?.date || getTodayLocalDate();
    }
    if (els.routineName && (!els.routineName.value || selectedSession)) {
      els.routineName.value = selectedSession?.title || getDefaultSessionTitle(selectedClientId);
    }
    if (els.sessionStatus) {
      els.sessionStatus.value = selectedSession?.status || 'planned';
    }
    if (els.sessionNotes) {
      els.sessionNotes.value = selectedSession?.notes || '';
    }

    const knownExercises = getExerciseOptionsForClient(selectedClientId);
    if (!trainingUi.selectedExercise && knownExercises.length && !els.historyExercise?.value) {
      trainingUi.selectedExercise = knownExercises[0];
    }

    if (els.historyExercise) {
      if (!els.historyExercise.value) {
        els.historyExercise.value = trainingUi.selectedExercise || '';
      }
      trainingUi.selectedExercise = els.historyExercise.value || trainingUi.selectedExercise || '';
    }

    if (els.trainingProgressSummary) {
      els.trainingProgressSummary.innerHTML = buildProgressSummary(selectedClientId, trainingUi.selectedExercise);
    }

    const activeExercises = getSessionExercises(selectedSession);
    if (selectedSession) {
      normalizeSessionExerciseOrder(selectedSession);
    }
    if (!activeExercises.some((exercise) => exercise.id === trainingUi.activeExerciseId)) {
      trainingUi.activeExerciseId = activeExercises[0]?.id || '';
    }

    const activeExercise = getCurrentTrainingExercise();
    if (els.coachExerciseList) {
      els.coachExerciseList.innerHTML = selectedSession
        ? (activeExercises.length
          ? activeExercises.map((exercise, index) => `
            <div class="training-set-item ${exercise.id === activeExercise?.id ? 'is-active' : ''}">
              <div>
                <strong>${index + 1}. ${escapeHtml(exercise.exerciseName)}</strong>
                <div class="meta">${Number(exercise.plannedSets || 0)} × ${Number(exercise.plannedRepMin || 0)}-${Number(exercise.plannedRepMax || 0)} · ${Number(exercise.restSeconds || 0)} s</div>
                <div class="meta">${Number(exercise.targetWeight || 0) > 0 ? `${Number(exercise.targetWeight || 0)} kg objetivo` : 'Sin peso objetivo'}${exercise.coachNotes ? ` · ${escapeHtml(exercise.coachNotes)}` : ''}</div>
              </div>
              <div class="inline-actions">
                <button class="secondary small" type="button" data-training-select-exercise="${exercise.id}">Usar</button>
                <button class="ghost small" type="button" data-training-edit-exercise="${exercise.id}">Editar</button>
                <button class="ghost small" type="button" data-training-move-up="${exercise.id}" ${index === 0 ? 'disabled' : ''}>Subir</button>
                <button class="ghost small" type="button" data-training-move-down="${exercise.id}" ${index === activeExercises.length - 1 ? 'disabled' : ''}>Bajar</button>
                <button class="danger small" type="button" data-training-delete-exercise="${exercise.id}">Eliminar</button>
              </div>
            </div>`).join('')
          : '<div class="muted">Agrega ejercicios para esta sesión.</div>')
        : '<div class="muted">Crea o selecciona una sesión para planificar ejercicios.</div>';
    }

    const currentExercise = getCurrentTrainingExercise();
    if (currentExercise) {
      trainingUi.selectedExercise = currentExercise.exerciseName;
      if (els.historyExercise && !els.historyExercise.matches(':focus')) {
        els.historyExercise.value = currentExercise.exerciseName;
      }
    }
    const currentSets = getExerciseSets(currentExercise);
    const plannedSets = Number(currentExercise?.plannedSets || 1);
    const nextSetNumber = trainingUi.editingSetNumber || Math.min(currentSets.length + 1, Math.max(plannedSets, 1));

    if (els.currentExerciseTitle) {
      els.currentExerciseTitle.textContent = currentExercise?.exerciseName || 'Serie activa';
    }
    if (els.setProgressLabel) {
      els.setProgressLabel.textContent = `Serie ${nextSetNumber} de ${Math.max(plannedSets, 1)}`;
    }
    if (els.trainingLastRecord) {
      const summary = buildLastSessionSummary(selectedClientId, currentExercise?.exerciseName || trainingUi.selectedExercise, {
        ignoreSessionId: currentSession?.id || ''
      });
      els.trainingLastRecord.textContent = summary;
    }

    if (els.setEntryList) {
      els.setEntryList.innerHTML = currentSets.length
        ? currentSets.map((setEntry) => `
            <div class="training-set-item">
              <div>
                <strong>Serie ${Number(setEntry.setNumber || 0)}</strong>
                <div class="meta">${Number(setEntry.weight || 0)} kg × ${Number(setEntry.reps || 0)} · ${setEntry.completed !== false ? 'Completada' : 'No completada'}</div>
                <div class="meta">${setEntry.personalRecord ? 'Posible nuevo récord' : ''}</div>
              </div>
              <button class="secondary small" type="button" data-set-edit="${Number(setEntry.setNumber || 0)}">Corregir</button>
            </div>`).join('')
        : '<div class="muted">Aún no hay series registradas para este ejercicio.</div>';
    }

    const buckets = getSessionBuckets(selectedClientId);
    const renderBucket = (title, list) => `
      <div class="student-card training-summary-grid">
        <strong>${title}</strong>
        <div class="routine-list">
          ${list.length ? list.map((session) => {
      const doneSets = getSessionExercises(session).reduce((sum, exercise) => sum + getExerciseSets(exercise).filter((setEntry) => setEntry.completed !== false).length, 0);
      const plannedSetsForSession = getSessionExercises(session).reduce((sum, exercise) => sum + Number(exercise.plannedSets || 0), 0);
      return `<div class="routine-pill">
                <div class="section-title">
                  <strong>${escapeHtml(session.title || 'Sesión')}</strong>
                  <span class="tag ${getSessionStatusTone(session.status)}">${escapeHtml(getSessionStatusLabel(session.status))}</span>
                </div>
                <div class="meta">${escapeHtml(formatClientDate(session.date || getTodayLocalDate()))} · ${getSessionExercises(session).length} ejercicios · ${doneSets}/${plannedSetsForSession || 0} series</div>
                <div class="inline-actions">
                  <button class="secondary small" type="button" data-training-open-session="${session.id}">Abrir</button>
                  <button class="ghost small" type="button" data-training-status="${session.id}" data-next-status="in_progress" ${session.status === 'in_progress' ? 'disabled' : ''}>En progreso</button>
                  <button class="ghost small" type="button" data-training-status="${session.id}" data-next-status="completed" ${session.status === 'completed' ? 'disabled' : ''}>Completar</button>
                </div>
              </div>`;
    }).join('') : '<div class="muted">Sin sesiones.</div>'}
        </div>
      </div>`;

    els.trainingsStudents.innerHTML = activeClients.length
      ? `${renderBucket('HOY', buckets.today)}${renderBucket('PRÓXIMAS', buckets.upcoming)}${renderBucket('COMPLETADAS', buckets.completed)}`
      : '<div class="notice">Primero debes crear un cliente</div>';

    ensureDateValue(els.routineDate);
    if (els.restPreset && els.restInput && els.restPreset.value !== 'custom') {
      els.restInput.value = els.restPreset.value;
    }

    if (els.setWeightInput && !els.setWeightInput.value && currentExercise) {
      const fallbackWeight = Number(currentExercise.targetWeight || 0);
      if (fallbackWeight > 0) {
        els.setWeightInput.value = String(fallbackWeight);
      }
    }

    if (els.saveSetBtn) {
      els.saveSetBtn.disabled = !(currentSession && currentExercise);
    }
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
    renderStudentTraining();
    renderSettings();
    renderNutrition();
  }

  function handleMovementSubmit(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(els.form));
    const selectedDate = payload.date || getTodayLocalDate();
    const result = financeApi.addMovement(state, {
      type: payload.type,
      amount: Number(payload.amount || 0),
      category: payload.category || 'Otro',
      date: selectedDate,
      description: payload.description || payload.category || 'Movimiento',
      segment: payload.segment || 'personal',
      accountId: payload.accountId || (state.accounts.find((account) => account.isMain)?.id || '')
    });

    if (!result.success) {
      els.formMessage.innerHTML = `<span class="bad">${result.errors.join(', ')}</span>`;
      return;
    }

    els.form.reset();
    const dateInput = document.getElementById('date');
    if (dateInput) {
      dateInput.value = selectedDate;
    }
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

  async function handleRoutineSubmit(event) {
    event.preventDefault();
    ensureTrainingsV08State();
    const activeClients = getActiveTrainingClients();
    if (!activeClients.length) {
      els.routineMessage.textContent = 'Primero debes crear un cliente';
      return;
    }

    const payload = Object.fromEntries(new FormData(els.routineForm));
    const clientId = payload.clientId || payload.studentId || '';
    if (!clientId) {
      els.routineMessage.textContent = 'Selecciona un cliente activo.';
      return;
    }

    trainingUi.selectedClientId = clientId;

    let activeSession = findSessionById(payload.sessionId || trainingUi.activeSessionId);
    if (!activeSession || activeSession.clientId !== clientId) {
      const createResult = await createSessionForClient(clientId);
      if (!createResult.ok) {
        els.routineMessage.textContent = createResult.error || 'No se pudo crear la sesión.';
        return;
      }
      activeSession = createResult.session;
    }

    activeSession.date = payload.date || getTodayLocalDate();
    activeSession.title = String(payload.title || '').trim() || getDefaultSessionTitle(clientId);
    activeSession.status = payload.status || 'planned';
    activeSession.notes = String(payload.sessionNotes || '').trim();

    const exerciseName = String(payload.exerciseName || payload.exercise || '').trim();
    if (!exerciseName) {
      els.routineMessage.textContent = 'Escribe el ejercicio.';
      return;
    }

    const plannedSets = Math.max(1, Number(payload.plannedSets || payload.sets || 1));
    const plannedRepMin = Math.max(1, Number(payload.plannedRepMin || payload.reps || 1));
    const plannedRepMaxRaw = Number(payload.plannedRepMax || plannedRepMin);
    const plannedRepMax = plannedRepMaxRaw >= plannedRepMin ? plannedRepMaxRaw : plannedRepMin;
    const targetWeight = Math.max(0, Number(payload.targetWeight || payload.weight || 0));
    const restSeconds = payload.restPreset === 'custom'
      ? Math.max(1, parseInt(String(payload.restSeconds || payload.rest || '90').replace(/\D/g, ''), 10) || 90)
      : Math.max(1, Number(payload.restPreset || 90));

    const requestedExerciseId = String(payload.exerciseId || trainingUi.editingExerciseId || '').trim();
    let exercise = requestedExerciseId
      ? getSessionExercises(activeSession).find((item) => item.id === requestedExerciseId)
      : null;
    if (!exercise) {
      exercise = getSessionExercises(activeSession).find((item) => String(item.exerciseName || '').trim().toLowerCase() === exerciseName.toLowerCase());
    }

    if (!exercise) {
      exercise = {
        id: dataApi.createId('tx-exercise'),
        exerciseName,
        order: getSessionExercises(activeSession).length + 1,
        plannedSets,
        plannedRepMin,
        plannedRepMax,
        targetWeight,
        restSeconds,
        coachNotes: String(payload.coachNotes || payload.techniqueNotes || '').trim(),
        sets: []
      };
      activeSession.exercises.push(exercise);
    } else {
      exercise.plannedSets = plannedSets;
      exercise.plannedRepMin = plannedRepMin;
      exercise.plannedRepMax = plannedRepMax;
      exercise.targetWeight = targetWeight;
      exercise.restSeconds = restSeconds;
      exercise.coachNotes = String(payload.coachNotes || payload.techniqueNotes || '').trim();
    }

    normalizeSessionExerciseOrder(activeSession);

    trainingUi.selectedClientId = clientId;
    trainingUi.selectedExercise = exerciseName;
    trainingUi.activeSessionId = activeSession.id;
    trainingUi.activeExerciseId = exercise.id;
    trainingUi.editingSetNumber = null;
    trainingUi.editingExerciseId = '';
    if (els.editingSetNumber) {
      els.editingSetNumber.value = '';
    }
    if (els.exerciseIdInput) {
      els.exerciseIdInput.value = '';
    }
    if (els.setWeightInput) {
      const previousSet = getExerciseSets(exercise)[getExerciseSets(exercise).length - 1] || null;
      els.setWeightInput.value = String(previousSet ? Number(previousSet.weight || 0) : targetWeight || 0);
    }
    if (els.setRepsInput) {
      els.setRepsInput.value = '';
    }
    if (els.historyClientId) {
      els.historyClientId.value = clientId;
    }
    if (els.historyExercise) {
      els.historyExercise.value = exerciseName;
    }

    if (isCloudSessionActive()) {
      const syncResult = await syncSessionToCloud(activeSession);
      if (!syncResult.ok) {
        els.routineMessage.textContent = syncResult.error || 'No se pudo sincronizar la sesión en Cloud.';
        return;
      }
      els.routineMessage.textContent = requestedExerciseId ? 'Ejercicio actualizado y sincronizado en Cloud.' : 'Ejercicio guardado y sincronizado en Cloud.';
      renderTrainings();
      return;
    }

    els.routineMessage.textContent = requestedExerciseId ? 'Ejercicio actualizado.' : 'Ejercicio guardado. Ahora registra serie por serie.';
    persist();
  }

  async function saveTrainingSetEntry() {
    ensureTrainingsV08State();
    const session = getCurrentTrainingSession();
    const exercise = getCurrentTrainingExercise();
    if (!session || !exercise) {
      if (els.routineMessage) {
        els.routineMessage.textContent = 'Primero prepara un ejercicio para la sesión.';
      }
      return;
    }

    if (session.status === 'planned') {
      session.status = 'in_progress';
    }

    const weight = Number(els.setWeightInput?.value || 0);
    const reps = Number(els.setRepsInput?.value || 0);
    const completed = els.setCompletedInput ? els.setCompletedInput.checked : true;
    if (!Number.isFinite(weight) || weight < 0 || !Number.isFinite(reps) || reps < 0) {
      if (els.setRecordNotice) {
        els.setRecordNotice.textContent = 'Peso y repeticiones deben ser válidos.';
      }
      return;
    }

    const sets = getExerciseSets(exercise);
    const requestedSetNumber = Number(els.editingSetNumber?.value || trainingUi.editingSetNumber || 0);
    const nextSetNumber = requestedSetNumber || (sets.length + 1);
    const previousBestWeight = getBestWeightForExercise(session.clientId, exercise.exerciseName, { ignoreSessionId: session.id });
    const isPotentialPr = weight > previousBestWeight && weight > 0;

    const existingSet = sets.find((setEntry) => Number(setEntry.setNumber || 0) === Number(nextSetNumber));
    if (existingSet) {
      existingSet.weight = weight;
      existingSet.reps = reps;
      existingSet.completed = completed;
      existingSet.techniqueStatus = existingSet.techniqueStatus || 'pending';
      existingSet.coachValidated = Boolean(existingSet.coachValidated);
      existingSet.personalRecord = isPotentialPr;
    } else {
      sets.push({
        setNumber: nextSetNumber,
        weight,
        reps,
        completed,
        createdAt: new Date().toISOString(),
        techniqueStatus: 'pending',
        coachValidated: false,
        personalRecord: isPotentialPr
      });
    }

    sets.sort((a, b) => Number(a.setNumber || 0) - Number(b.setNumber || 0));
    trainingUi.editingSetNumber = null;
    if (els.editingSetNumber) {
      els.editingSetNumber.value = '';
    }
    if (els.setRepsInput) {
      els.setRepsInput.value = '';
    }
    if (els.setRecordNotice) {
      els.setRecordNotice.textContent = isPotentialPr ? '🏆 Posible nuevo récord' : 'Serie guardada.';
    }
    if (isCloudSessionActive()) {
      const syncResult = await syncSessionToCloud(session);
      if (!syncResult.ok) {
        if (els.routineMessage) {
          els.routineMessage.textContent = syncResult.error || 'No se pudo sincronizar la serie en Cloud.';
        }
        return;
      }
      if (els.routineMessage) {
        els.routineMessage.textContent = 'Serie guardada y sincronizada en Cloud. Puedes iniciar descanso.';
      }
      renderTrainings();
      return;
    }

    if (els.routineMessage) {
      els.routineMessage.textContent = 'Serie guardada correctamente. Puedes iniciar descanso.';
    }
    persist();
  }

  async function updateSessionStatus(sessionId, nextStatus) {
    const session = findSessionById(sessionId);
    if (!session) {
      return;
    }
    session.status = nextStatus;
    if (isCloudSessionActive()) {
      const syncResult = await syncSessionToCloud(session);
      if (!syncResult.ok) {
        if (els.routineMessage) {
          els.routineMessage.textContent = syncResult.error || 'No se pudo actualizar el estado en Cloud.';
        }
        return;
      }
      renderTrainings();
      return;
    }
    persist();
  }

  async function removeExerciseFromActiveSession(exerciseId) {
    const session = getCurrentTrainingSession();
    if (!session) {
      return;
    }
    session.exercises = getSessionExercises(session).filter((exercise) => exercise.id !== exerciseId);
    normalizeSessionExerciseOrder(session);
    if (trainingUi.activeExerciseId === exerciseId) {
      trainingUi.activeExerciseId = getSessionExercises(session)[0]?.id || '';
    }
    trainingUi.editingExerciseId = '';
    if (els.exerciseIdInput) {
      els.exerciseIdInput.value = '';
    }

    if (isCloudSessionActive()) {
      const syncResult = await syncSessionToCloud(session);
      if (!syncResult.ok) {
        if (els.routineMessage) {
          els.routineMessage.textContent = syncResult.error || 'No se pudo eliminar el ejercicio en Cloud.';
        }
        return;
      }
      renderTrainings();
      return;
    }

    persist();
  }

  async function moveExerciseInSession(exerciseId, direction) {
    const session = getCurrentTrainingSession();
    if (!session) {
      return;
    }
    const exercises = getSessionExercises(session);
    const currentIndex = exercises.findIndex((exercise) => exercise.id === exerciseId);
    if (currentIndex < 0) {
      return;
    }
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= exercises.length) {
      return;
    }
    const [item] = exercises.splice(currentIndex, 1);
    exercises.splice(nextIndex, 0, item);
    normalizeSessionExerciseOrder(session);

    if (isCloudSessionActive()) {
      const syncResult = await syncSessionToCloud(session);
      if (!syncResult.ok) {
        if (els.routineMessage) {
          els.routineMessage.textContent = syncResult.error || 'No se pudo reordenar en Cloud.';
        }
        return;
      }
      renderTrainings();
      return;
    }

    persist();
  }

  function editExerciseFromActiveSession(exerciseId) {
    const session = getCurrentTrainingSession();
    if (!session) {
      return;
    }
    const exercise = getSessionExercises(session).find((item) => item.id === exerciseId);
    if (!exercise) {
      return;
    }
    trainingUi.activeExerciseId = exercise.id;
    trainingUi.editingExerciseId = exercise.id;
    if (els.exerciseIdInput) {
      els.exerciseIdInput.value = exercise.id;
    }
    if (els.exerciseInput) {
      els.exerciseInput.value = exercise.exerciseName || '';
    }
    if (els.plannedSetsInput) {
      els.plannedSetsInput.value = String(Number(exercise.plannedSets || 1));
    }
    if (els.plannedRepMinInput) {
      els.plannedRepMinInput.value = String(Number(exercise.plannedRepMin || 1));
    }
    if (els.plannedRepMaxInput) {
      els.plannedRepMaxInput.value = String(Number(exercise.plannedRepMax || 1));
    }
    if (els.targetWeightInput) {
      els.targetWeightInput.value = String(Number(exercise.targetWeight || 0));
    }
    if (els.techniqueNotesInput) {
      els.techniqueNotesInput.value = exercise.coachNotes || '';
    }
    if (els.restInput) {
      els.restInput.value = String(Number(exercise.restSeconds || 90));
    }
    if (els.restPreset) {
      const allowed = ['60', '90', '95', '120'];
      const restString = String(Number(exercise.restSeconds || 90));
      els.restPreset.value = allowed.includes(restString) ? restString : 'custom';
    }
    if (els.routineMessage) {
      els.routineMessage.textContent = `Editando ejercicio: ${exercise.exerciseName}`;
    }
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

    const clientFilterButton = target.closest('[data-client-filter]');
    if (clientFilterButton) {
      clientUi.filter = clientFilterButton.getAttribute('data-client-filter') || 'all';
      renderClients();
      return;
    }

    const clientViewId = target.getAttribute('data-client-view');
    if (clientViewId) {
      selectClientDetail(clientViewId);
      return;
    }

    const clientEditId = target.getAttribute('data-client-edit');
    if (clientEditId) {
      editClientById(clientEditId);
      return;
    }

    const clientWhatsAppId = target.getAttribute('data-client-whatsapp');
    if (clientWhatsAppId) {
      const client = (clientUi.records || []).find((item) => item.id === clientWhatsAppId);
      if (client) {
        openClientWhatsApp(client);
      }
      return;
    }

    const clientStudentViewId = target.getAttribute('data-client-student-view');
    if (clientStudentViewId) {
      enterStudentMode(clientStudentViewId);
      return;
    }

    if (target === els.clientNewBtn) {
      toggleClientForm(true, null);
      renderClients();
      return;
    }

    if (target === els.clientCancelBtn) {
      clientUi.formOpen = false;
      clientUi.editingId = null;
      clearClientForm();
      if (els.clientFormPanel) {
        els.clientFormPanel.classList.add('hidden');
      }
      setClientNotice('Formulario cerrado.', 'neutral');
      renderClients();
      return;
    }

    if (target === els.createSessionBtn) {
      const clientId = trainingUi.selectedClientId || els.studentId?.value || '';
      if (!clientId) {
        if (els.routineMessage) {
          els.routineMessage.textContent = 'Selecciona un cliente activo para crear sesión.';
        }
        return;
      }
      createSessionForClient(clientId).then((result) => {
        if (!result.ok && els.routineMessage) {
          els.routineMessage.textContent = result.error || 'No se pudo crear la sesión.';
          return;
        }
        if (els.routineMessage) {
          els.routineMessage.textContent = 'Sesión creada. Ahora agrega ejercicios.';
        }
        renderTrainings();
      }).catch((error) => {
        if (els.routineMessage) {
          els.routineMessage.textContent = error?.message || 'No se pudo crear la sesión.';
        }
      });
      return;
    }

    const openSessionId = target.getAttribute('data-training-open-session');
    if (openSessionId) {
      setActiveSessionForClient(trainingUi.selectedClientId, openSessionId);
      renderTrainings();
      return;
    }

    const nextStatus = target.getAttribute('data-next-status');
    const statusSessionId = target.getAttribute('data-training-status');
    if (statusSessionId && nextStatus) {
      updateSessionStatus(statusSessionId, nextStatus).catch((error) => {
        if (els.routineMessage) {
          els.routineMessage.textContent = error?.message || 'No se pudo actualizar el estado de la sesión.';
        }
      });
      return;
    }

    const selectExerciseId = target.getAttribute('data-training-select-exercise');
    if (selectExerciseId) {
      trainingUi.activeExerciseId = selectExerciseId;
      trainingUi.editingSetNumber = null;
      if (els.editingSetNumber) {
        els.editingSetNumber.value = '';
      }
      renderTrainings();
      return;
    }

    const editExerciseId = target.getAttribute('data-training-edit-exercise');
    if (editExerciseId) {
      editExerciseFromActiveSession(editExerciseId);
      renderTrainings();
      return;
    }

    const moveUpExerciseId = target.getAttribute('data-training-move-up');
    if (moveUpExerciseId) {
      moveExerciseInSession(moveUpExerciseId, 'up').catch((error) => {
        if (els.routineMessage) {
          els.routineMessage.textContent = error?.message || 'No se pudo mover el ejercicio.';
        }
      });
      return;
    }

    const moveDownExerciseId = target.getAttribute('data-training-move-down');
    if (moveDownExerciseId) {
      moveExerciseInSession(moveDownExerciseId, 'down').catch((error) => {
        if (els.routineMessage) {
          els.routineMessage.textContent = error?.message || 'No se pudo mover el ejercicio.';
        }
      });
      return;
    }

    const deleteExerciseId = target.getAttribute('data-training-delete-exercise');
    if (deleteExerciseId) {
      removeExerciseFromActiveSession(deleteExerciseId).catch((error) => {
        if (els.routineMessage) {
          els.routineMessage.textContent = error?.message || 'No se pudo eliminar el ejercicio.';
        }
      });
      return;
    }

    const setEditNumber = target.getAttribute('data-set-edit');
    if (setEditNumber) {
      const exercise = getCurrentTrainingExercise();
      const setEntry = getExerciseSets(exercise).find((item) => Number(item.setNumber || 0) === Number(setEditNumber));
      if (setEntry) {
        trainingUi.editingSetNumber = Number(setEditNumber);
        if (els.editingSetNumber) {
          els.editingSetNumber.value = String(setEditNumber);
        }
        if (els.setWeightInput) {
          els.setWeightInput.value = String(Number(setEntry.weight || 0));
        }
        if (els.setRepsInput) {
          els.setRepsInput.value = String(Number(setEntry.reps || 0));
        }
        if (els.setCompletedInput) {
          els.setCompletedInput.checked = setEntry.completed !== false;
        }
        if (els.setRecordNotice) {
          els.setRecordNotice.textContent = `Editando serie ${setEditNumber}`;
        }
      }
      return;
    }

    const weightDelta = target.getAttribute('data-weight-delta');
    if (weightDelta && els.setWeightInput) {
      const current = Number(els.setWeightInput.value || 0);
      const next = Math.max(0, Math.round((current + Number(weightDelta)) * 10) / 10);
      els.setWeightInput.value = String(next);
      return;
    }

    const studentSetEditNumber = target.getAttribute('data-student-set-edit');
    if (studentSetEditNumber) {
      const exercise = getStudentExercise();
      const setEntry = getExerciseSets(exercise).find((item) => Number(item.setNumber || 0) === Number(studentSetEditNumber));
      if (setEntry) {
        studentUi.editingSetNumber = Number(studentSetEditNumber);
        if (els.studentEditingSetNumber) {
          els.studentEditingSetNumber.value = String(studentSetEditNumber);
        }
        if (els.studentWeightInput) {
          els.studentWeightInput.value = String(Number(setEntry.weight || 0));
        }
        if (els.studentRepsInput) {
          els.studentRepsInput.value = String(Number(setEntry.reps || 0));
        }
        if (els.studentSetCompleted) {
          els.studentSetCompleted.checked = setEntry.completed !== false;
        }
        if (els.studentSetNotice) {
          els.studentSetNotice.textContent = `Editando serie ${studentSetEditNumber}`;
        }
      }
      return;
    }

    const studentWeightDelta = target.getAttribute('data-student-weight-delta');
    if (studentWeightDelta && els.studentWeightInput) {
      const current = Number(els.studentWeightInput.value || 0);
      const next = Math.max(0, Math.round((current + Number(studentWeightDelta)) * 10) / 10);
      els.studentWeightInput.value = String(next);
      return;
    }

    if (target === els.studentSaveSetBtn) {
      saveStudentSetEntry().catch((error) => {
        if (els.studentSetNotice) {
          els.studentSetNotice.textContent = error?.message || 'No se pudo guardar la serie.';
        }
      });
      return;
    }

    if (target === els.studentNextExerciseBtn) {
      goToNextStudentExercise().catch((error) => {
        if (els.studentSetNotice) {
          els.studentSetNotice.textContent = error?.message || 'No se pudo avanzar de ejercicio.';
        }
      });
      return;
    }

    if (target === els.studentRestStartBtn) {
      startStudentRest();
      return;
    }

    if (target === els.studentRestPlusBtn) {
      const exercise = getStudentExercise();
      if (!studentUi.restRunning && studentUi.restRemaining <= 0) {
        studentUi.restRemaining = Number(exercise?.restSeconds || 0);
      }
      studentUi.restRemaining = Math.max(0, Number(studentUi.restRemaining || 0) + 15);
      renderStudentTraining();
      return;
    }

    if (target === els.studentRestSkipBtn) {
      stopStudentRestTimer();
      studentUi.restRemaining = 0;
      renderStudentTraining();
      return;
    }

    if (target === els.studentBackBtn) {
      exitStudentMode();
      return;
    }

    if (target === els.studentFinalizeBtn) {
      finalizeStudentSession().catch((error) => {
        if (els.studentSetNotice) {
          els.studentSetNotice.textContent = error?.message || 'No se pudo finalizar la sesión.';
        }
      });
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
  els.clientForm?.addEventListener('submit', handleClientSubmit);
  document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);
  document.getElementById('exportBtn').addEventListener('click', exportData);
  els.fileInput.addEventListener('change', handleImport);
  els.clientSearch?.addEventListener('input', (event) => {
    clientUi.search = event.target.value || '';
    renderClients();
  });
  els.restPreset?.addEventListener('change', (event) => {
    const preset = event.target.value;
    if (!els.restInput) {
      return;
    }
    if (preset === 'custom') {
      if (!els.restInput.value || ['60', '90', '95', '120'].includes(String(els.restInput.value))) {
        els.restInput.value = '';
      }
      els.restInput.focus();
      return;
    }
    els.restInput.value = preset;
  });
  els.studentId?.addEventListener('change', (event) => {
    trainingUi.selectedClientId = event.target.value || '';
    setActiveSessionForClient(trainingUi.selectedClientId);
    if (els.historyClientId) {
      els.historyClientId.value = trainingUi.selectedClientId;
    }
    renderTrainings();
  });
  els.trainingSessionId?.addEventListener('change', (event) => {
    const sessionId = event.target.value || '';
    if (!sessionId) {
      trainingUi.activeSessionId = '';
      trainingUi.activeExerciseId = '';
      trainingUi.editingExerciseId = '';
      if (els.exerciseIdInput) {
        els.exerciseIdInput.value = '';
      }
      renderTrainings();
      return;
    }
    setActiveSessionForClient(trainingUi.selectedClientId, sessionId);
    renderTrainings();
  });
  els.historyClientId?.addEventListener('change', (event) => {
    trainingUi.selectedClientId = event.target.value || '';
    setActiveSessionForClient(trainingUi.selectedClientId);
    renderTrainings();
  });
  els.historyExercise?.addEventListener('input', (event) => {
    trainingUi.selectedExercise = event.target.value || '';
    renderTrainings();
  });
  document.getElementById('exercise')?.addEventListener('input', (event) => {
    if (!els.historyExercise || els.historyExercise.value) {
      return;
    }
    trainingUi.selectedExercise = event.target.value || '';
    renderTrainings();
  });
  els.saveSetBtn?.addEventListener('click', () => {
    saveTrainingSetEntry().catch((error) => {
      if (els.routineMessage) {
        els.routineMessage.textContent = error?.message || 'No se pudo guardar la serie.';
      }
    });
  });
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
  refreshCloudSessionState()
    .then((hasCloudSession) => {
      if (hasCloudSession) {
        return Promise.all([
          refreshClients(),
          refreshTrainingsV08FromCloud()
        ]);
      }
      return refreshClients();
    })
    .catch(() => {});

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
})();
