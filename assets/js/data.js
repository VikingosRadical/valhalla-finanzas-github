(function () {
  const DEFAULT_RECURRING_TRANSACTIONS = [
    { id: 'salary', type: 'income', name: 'Ingreso semanal', amount: 250000, frequency: 'weekly', weekday: 6, active: true, segment: 'personal', category: 'Sueldo', paid: false },
    { id: 'rent', type: 'expense', name: 'Arriendo mensual', amount: 550000, frequency: 'monthly', day: 1, active: true, segment: 'business', category: 'Arriendo', paid: false },
    { id: 'light', type: 'expense', name: 'Luz mensual', amount: 89000, frequency: 'monthly', day: 10, active: true, segment: 'business', category: 'Luz', paid: false },
    { id: 'internet', type: 'expense', name: 'Internet mensual', amount: 20000, frequency: 'monthly', day: 10, active: true, segment: 'business', category: 'Internet', paid: false },
    { id: 'fuel', type: 'expense', name: 'Bencina estimada', amount: 120000, frequency: 'monthly', day: 5, active: true, segment: 'business', category: 'Bencina de trabajo', paid: false },
    { id: 'market', type: 'expense', name: 'Supermercado estimado', amount: 80000, frequency: 'weekly', weekday: 6, active: true, segment: 'personal', category: 'Supermercado', paid: false },
    { id: 'fee', type: 'expense', name: 'Cuota mensual', amount: 100000, frequency: 'monthly', day: 5, active: true, segment: 'business', category: 'Cuota', paid: false },
    { id: 'debt', type: 'expense', name: 'Deuda 12 cuotas', amount: 100000, frequency: 'monthly', day: 5, active: true, segment: 'business', category: 'Deuda', paid: false, installments_pending: 7 }
  ];

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
    accounts: [
      { id: 'account-bancoestado', name: 'Cuenta Corriente BancoEstado', initialBalance: 0, isActive: true, isMain: true, isOperational: true },
      { id: 'account-rut', name: 'CuentaRUT', initialBalance: 0, isActive: true, isMain: false, isOperational: true },
      { id: 'account-global66', name: 'Global66', initialBalance: 0, isActive: true, isMain: false, isOperational: false },
      { id: 'account-efectivo', name: 'Efectivo', initialBalance: 0, isActive: true, isMain: false, isOperational: true }
    ],
    categories: [
      { id: 'cat-breakfast', name: 'Desayuno', group: 'personal' },
      { id: 'cat-lunch', name: 'Almuerzo', group: 'personal' },
      { id: 'cat-once', name: 'Once', group: 'personal' },
      { id: 'cat-supermarket', name: 'Supermercado', group: 'personal' },
      { id: 'cat-fiesta', name: 'Fiesta', group: 'personal' },
      { id: 'cat-paseo', name: 'Paseo', group: 'personal' },
      { id: 'cat-transporte', name: 'Transporte', group: 'personal' },
      { id: 'cat-magic', name: 'Magic', group: 'personal' },
      { id: 'cat-mariela', name: 'Mariela', group: 'personal' },
      { id: 'cat-monster', name: 'Monster / bebidas', group: 'personal' },
      { id: 'cat-other-personal', name: 'Otros personales', group: 'personal' },
      { id: 'cat-rent', name: 'Arriendo', group: 'business' },
      { id: 'cat-light', name: 'Luz', group: 'business' },
      { id: 'cat-internet', name: 'Internet', group: 'business' },
      { id: 'cat-work-fuel', name: 'Bencina de trabajo', group: 'business' },
      { id: 'cat-equipment', name: 'Equipamiento', group: 'business' },
      { id: 'cat-maintenance', name: 'Mantención', group: 'business' },
      { id: 'cat-advertising', name: 'Publicidad', group: 'business' },
      { id: 'cat-teachers', name: 'Profesores', group: 'business' },
      { id: 'cat-materials', name: 'Materiales', group: 'business' },
      { id: 'cat-other-business', name: 'Otros del negocio', group: 'business' },
      { id: 'cat-salary', name: 'Sueldo', group: 'income' },
      { id: 'cat-student', name: 'Alumno', group: 'income' },
      { id: 'cat-extraordinary', name: 'Aporte extraordinario', group: 'income' },
      { id: 'cat-income-other', name: 'Otro ingreso', group: 'income' }
    ],
    movements: [],
    recurring: JSON.parse(JSON.stringify(DEFAULT_RECURRING_TRANSACTIONS)),
    recurringTransactions: JSON.parse(JSON.stringify(DEFAULT_RECURRING_TRANSACTIONS)),
    financialGoals: [
      { id: 'goal-debt', name: 'Pago de deuda', targetAmount: 1200000, accumulatedAmount: 0, priority: 'alta', targetDate: '', progress: 0 },
      { id: 'goal-travel', name: 'Viaje', targetAmount: 800000, accumulatedAmount: 0, priority: 'media', targetDate: '', progress: 0 },
      { id: 'goal-gym', name: 'Equipamiento del gimnasio', targetAmount: 900000, accumulatedAmount: 0, priority: 'media', targetDate: '', progress: 0 },
      { id: 'goal-emergency', name: 'Fondo de emergencia', targetAmount: 1000000, accumulatedAmount: 0, priority: 'alta', targetDate: '', progress: 0 },
      { id: 'goal-magic', name: 'Magic', targetAmount: 300000, accumulatedAmount: 0, priority: 'media', targetDate: '', progress: 0 }
    ],
    debts: [
      { id: 'debt-main', name: 'Deuda total', totalAmount: 1200000, installmentsTotal: 12, installmentsPaid: 5, installmentsPending: 7, amountPerInstallment: 100000, status: 'active' }
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
    },
    trainingModelVersion: '0.8.0',
    trainingsV08: {
      plans: [],
      sessions: []
    },
    exerciseLibrary: [],
    sportsProfiles: [],
    sportsConsiderations: [],
    movementStatuses: []
  };

  const STORAGE_KEY = 'valhalla_v07';
  const LEGACY_STORAGE_KEYS = ['valhalla_v05', 'valhalla_v06'];

  function createId(prefix) {
    return `${prefix}-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)}`;
  }

  function createInitialNutritionPlan() {
    return {
      id: createId('plan'),
      name: 'Ciclo base 9 días + día 10 libre',
      description: 'Plantilla editable para seguimiento general de nutrición con día libre al final del ciclo.',
      cycleLength: 10,
      freeDay: true,
      waterMinLiters: 3,
      waterMaxLiters: 5,
      active: true,
      days: [
        {
          dayNumber: 1,
          name: 'Día 1',
          description: 'Inicio del ciclo con enfoque en alimentos simples y estructura básica.',
          carbohydrateLevel: 'bajo',
          meals: [
            { id: createId('meal'), mealName: 'Desayuno', time: '08:00', blocks: [{ type: 'Proteína', quantity: '', unit: '', options: '' }], supplements: '', instructions: '' }
          ],
          supplements: '',
          instructions: 'Registrar fotos y mediciones en el día 9 o 10.'
        },
        {
          dayNumber: 4,
          name: 'Día 4',
          description: 'Aumento de carbohidratos según la pauta y revisión del seguimiento.',
          carbohydrateLevel: 'medio',
          meals: [
            { id: createId('meal'), mealName: 'Almuerzo', time: '13:00', blocks: [{ type: 'Carbohidrato', quantity: '', unit: '', options: '' }], supplements: '', instructions: '' }
          ],
          supplements: '',
          instructions: 'Ajustar según respuesta del alumno y criterio del entrenador.'
        },
        {
          dayNumber: 10,
          name: 'Día 10 libre',
          description: 'Día libre o comida libre según configuración del entrenador.',
          carbohydrateLevel: 'libre',
          meals: [
            { id: createId('meal'), mealName: 'Comida libre', time: '', blocks: [{ type: 'Otro', quantity: '', unit: '', options: '' }], supplements: '', instructions: '' }
          ],
          supplements: '',
          instructions: 'Se puede usar como día libre o para una comida de mayor flexibilidad.'
        }
      ]
    };
  }

  function createInitialFoodBlocks() {
    return [
      { id: createId('food'), type: 'Proteína', name: 'Proteína tradicional', portion: '', unit: '', alternatives: '', tags: ['tradicional'] },
      { id: createId('food'), type: 'Proteína', name: 'Proteína vegetariana', portion: '', unit: '', alternatives: '', tags: ['vegetariana'] },
      { id: createId('food'), type: 'Carbohidrato', name: 'Carbohidrato integral', portion: '', unit: '', alternatives: '', tags: ['integral'] },
      { id: createId('food'), type: 'Vegetal', name: 'Vegetales', portion: '', unit: '', alternatives: '', tags: ['vegetal'] },
      { id: createId('food'), type: 'Grasa', name: 'Grasas', portion: '', unit: '', alternatives: '', tags: ['grasa'] },
      { id: createId('food'), type: 'Fruta', name: 'Fruta', portion: '', unit: '', alternatives: '', tags: ['fruta'] },
      { id: createId('food'), type: 'Colación', name: 'Colación', portion: '', unit: '', alternatives: '', tags: ['colacion'] },
      { id: createId('food'), type: 'Otro', name: 'Hidratación', portion: '', unit: 'L', alternatives: '', tags: ['hidratacion'] }
    ];
  }

  function createInitialState() {
    const state = JSON.parse(JSON.stringify(INITIAL_STATE));
    state.clients = state.clients.map((client) => normalizeClient(client));
    state.nutritionProfiles = [];
    state.nutritionPlans = [createInitialNutritionPlan()];
    state.nutritionLogs = [];
    state.foodBlocks = createInitialFoodBlocks();
    state.trainingModelVersion = '0.8.0';
    state.trainingsV08 = {
      plans: [],
      sessions: []
    };
    state.exerciseLibrary = [];
    state.sportsProfiles = [];
    state.sportsConsiderations = [];
    state.movementStatuses = [];
    return state;
  }

  function normalizeSportsProfile(profile) {
    return {
      id: profile.id || createId('sports-profile'),
      clientId: profile.clientId || profile.client_id || '',
      primaryGoal: profile.primaryGoal || profile.primary_goal || 'otro',
      secondaryGoal: profile.secondaryGoal || profile.secondary_goal || '',
      goalNotes: profile.goalNotes || profile.goal_notes || '',
      experienceLevel: profile.experienceLevel || profile.experience_level || 'principiante',
      experienceMonths: Math.max(0, Number(profile.experienceMonths ?? profile.experience_months ?? 0)),
      coachStartDate: profile.coachStartDate || profile.coach_start_date || '',
      sessionsPerWeek: Math.max(0, Number(profile.sessionsPerWeek ?? profile.sessions_per_week ?? 3)),
      sessionDurationMinutes: Math.max(0, Number(profile.sessionDurationMinutes ?? profile.session_duration_minutes ?? 60)),
      coachNotes: profile.coachNotes || profile.coach_notes || ''
    };
  }

  function normalizeSportsConsideration(item) {
    return {
      id: item.id || createId('sports-consideration'),
      clientId: item.clientId || item.client_id || '',
      title: item.title || '',
      description: item.description || '',
      status: item.status || 'activa',
      notedOn: item.notedOn || item.noted_on || new Date().toISOString().slice(0, 10),
      reviewDate: item.reviewDate || item.review_date || ''
    };
  }

  function normalizeMovementStatus(item) {
    return {
      id: item.id || createId('movement-status'),
      clientId: item.clientId || item.client_id || '',
      movementName: item.movementName || item.movement_name || '',
      movementKey: item.movementKey || item.movement_key || '',
      status: item.status || 'no_evaluado',
      coachNote: item.coachNote || item.coach_note || '',
      evaluated1rm: item.evaluated1rm ?? item.evaluated_1rm ?? '',
      lastEvaluatedOn: item.lastEvaluatedOn || item.last_evaluated_on || ''
    };
  }

  function normalizeLibraryExercise(item) {
    return {
      id: item.id || createId('library-exercise'),
      name: item.name || 'Ejercicio',
      normalizedName: item.normalizedName || item.normalized_name || '',
      description: item.description || '',
      pattern: item.pattern || 'other',
      primaryMuscle: item.primaryMuscle || item.primary_muscle || 'full_body',
      secondaryMuscles: Array.isArray(item.secondaryMuscles)
        ? item.secondaryMuscles.slice()
        : (Array.isArray(item.secondary_muscles) ? item.secondary_muscles.slice() : []),
      equipments: Array.isArray(item.equipments)
        ? item.equipments.slice()
        : (Array.isArray(item.equipment_keys) ? item.equipment_keys.slice() : []),
      technicalLevel: item.technicalLevel || item.technical_level || 'beginner',
      loadType: item.loadType || item.load_type || 'external_load',
      active: item.active !== false,
      relations: Array.isArray(item.relations) ? item.relations.map((relation) => ({
        id: relation.id || createId('library-relation'),
        relatedExerciseId: relation.relatedExerciseId || relation.related_exercise_id || '',
        relationType: relation.relationType || relation.relation_type || 'alternative_to',
        notes: relation.notes || '',
        relatedExerciseName: relation.relatedExerciseName || relation.related_exercise_name || ''
      })) : []
    };
  }

  function slugifyTrainingPart(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'base';
  }

  function normalizeTrainingSet(setEntry, index) {
    const rawType = String(setEntry.setType || setEntry.set_type || 'S').trim().toUpperCase();
    const setType = rawType === 'A' || rawType === 'T' || rawType === 'S' ? rawType : 'S';
    return {
      setNumber: Number(setEntry.setNumber || index + 1),
      weight: Number(setEntry.weight || 0),
      reps: Number(setEntry.reps || 0),
      completed: setEntry.completed !== false,
      setType,
      createdAt: setEntry.createdAt || new Date().toISOString(),
      techniqueStatus: setEntry.techniqueStatus || 'pending',
      coachValidated: Boolean(setEntry.coachValidated),
      personalRecord: Boolean(setEntry.personalRecord)
    };
  }

  function normalizeTrainingExercise(exercise, index) {
    const plannedSets = Number(exercise.plannedSets || exercise.sets || 1);
    const plannedRepMin = Number(exercise.plannedRepMin || exercise.reps || 1);
    const plannedRepMax = Number(exercise.plannedRepMax || exercise.reps || plannedRepMin);
    return {
      id: exercise.id || createId('tx-exercise'),
      exerciseName: exercise.exerciseName || exercise.exercise || 'Ejercicio',
      order: Number(exercise.order || index + 1),
      plannedSets: plannedSets > 0 ? plannedSets : 1,
      plannedRepMin: plannedRepMin > 0 ? plannedRepMin : 1,
      plannedRepMax: plannedRepMax >= plannedRepMin ? plannedRepMax : plannedRepMin,
      targetWeight: Number(exercise.targetWeight || exercise.weight || 0),
      restSeconds: Number(exercise.restSeconds || 90),
      coachNotes: exercise.coachNotes || exercise.techniqueNotes || '',
      sets: Array.isArray(exercise.sets)
        ? exercise.sets.map((setEntry, setIndex) => normalizeTrainingSet(setEntry, setIndex))
        : []
    };
  }

  function normalizeTrainingSession(session, index) {
    const status = session.status || (session.sessionCompleted ? 'completed' : 'in_progress');
    return {
      id: session.id || createId('tx-session'),
      clientId: session.clientId || session.studentId || '',
      planId: session.planId || null,
      groupSessionId: session.groupSessionId || null,
      date: session.date || '',
      title: session.title || session.name || `Sesión ${index + 1}`,
      status,
      notes: session.notes || '',
      exercises: Array.isArray(session.exercises)
        ? session.exercises.map((exercise, exerciseIndex) => normalizeTrainingExercise(exercise, exerciseIndex))
        : []
    };
  }

  function mergeTrainingSessionsById(existingItems, incomingItems) {
    const map = new Map();
    [...(existingItems || []), ...(incomingItems || [])].forEach((item, index) => {
      const normalized = normalizeTrainingSession(item, index);
      if (!normalized.id) {
        return;
      }
      map.set(normalized.id, normalized);
    });
    return Array.from(map.values());
  }

  function migrateLegacyRoutinesToV08(routines) {
    if (!Array.isArray(routines) || !routines.length) {
      return [];
    }

    const sessionsMap = new Map();
    routines.forEach((routine, index) => {
      const clientId = routine.clientId || routine.studentId || '';
      if (!clientId) {
        return;
      }

      const date = routine.date || '';
      const title = routine.name || 'Sesión migrada';
      const sessionKey = `${slugifyTrainingPart(clientId)}-${slugifyTrainingPart(date)}-${slugifyTrainingPart(title)}`;
      const sessionId = `legacy-session-${sessionKey}`;
      if (!sessionsMap.has(sessionId)) {
        sessionsMap.set(sessionId, {
          id: sessionId,
          clientId,
          planId: null,
          groupSessionId: null,
          date,
          title,
          status: routine.sessionCompleted ? 'completed' : 'in_progress',
          notes: '',
          exercises: []
        });
      }

      const session = sessionsMap.get(sessionId);
      const exerciseId = routine.id ? `legacy-exercise-${routine.id}` : `legacy-exercise-${index + 1}`;
      const exercise = {
        id: exerciseId,
        exerciseName: routine.exercise || 'Ejercicio migrado',
        order: session.exercises.length + 1,
        plannedSets: Number(routine.sets || 1),
        plannedRepMin: Number(routine.reps || 1),
        plannedRepMax: Number(routine.reps || 1),
        targetWeight: Number(routine.weight || 0),
        restSeconds: Number(routine.restSeconds || parseInt(String(routine.rest || '').replace(/\D/g, ''), 10) || 90),
        coachNotes: routine.techniqueNotes || '',
        sets: []
      };

      if (routine.performedWeight || routine.performedReps) {
        exercise.sets.push(normalizeTrainingSet({
          setNumber: 1,
          weight: Number(routine.performedWeight || routine.weight || 0),
          reps: Number(routine.performedReps || routine.reps || 0),
          completed: routine.sessionCompleted !== false,
          createdAt: routine.created_at || new Date().toISOString(),
          techniqueStatus: 'pending',
          coachValidated: false,
          personalRecord: false
        }, 0));
      }

      session.exercises.push(exercise);
    });

    return Array.from(sessionsMap.values()).map((session, index) => normalizeTrainingSession(session, index));
  }

  function normalizeClient(client) {
    const fullName = client.full_name || client.name || '';
    const phone = client.phone || client.phone_number || '';
    const service = client.service || 'Personalizado';
    const monthlyValue = Number(client.monthly_value ?? client.amount ?? 0);
    const paymentStatus = client.payment_status || (client.status === 'paid' ? 'paid' : client.status === 'uncertain' ? 'uncertain' : client.status === 'overdue' ? 'overdue' : 'pending');
    const clientStatus = client.client_status || (client.status === 'uncertain' ? 'uncertain' : client.continues === false ? 'inactive' : 'active');
    const renewalDate = client.renewal_date || '';
    const renewalDayFromDate = renewalDate ? new Date(renewalDate) : null;
    const renewalDay = client.renewal_day || (renewalDayFromDate && !Number.isNaN(renewalDayFromDate.getTime()) ? renewalDayFromDate.getDate() : '');
    const normalized = {
      ...client,
      id: client.id || createId('client'),
      full_name: fullName,
      name: fullName,
      phone,
      email: client.email || '',
      birth_date: client.birth_date || '',
      training_days: client.training_days || '',
      service,
      monthly_value: monthlyValue,
      amount: Number(client.amount ?? monthlyValue),
      schedule_notes: client.schedule_notes || client.schedule || '',
      objective: client.objective || '',
      injuries: client.injuries || '',
      observations: client.observations || '',
      emergency_contact: client.emergency_contact || '',
      emergency_phone: client.emergency_phone || '',
      start_date: client.start_date || '',
      renewal_date: renewalDate,
      renewal_day: renewalDay,
      payment_status: paymentStatus,
      client_status: clientStatus,
      status: paymentStatus,
      active: client.active !== false,
      continues: client.continues !== undefined ? client.continues : clientStatus !== 'inactive'
    };
    return normalized;
  }

  function normalizeNutritionProfile(profile) {
    const next = {
      id: profile.id || createId('profile'),
      clientId: profile.clientId || '',
      objective: profile.objective || '',
      dietType: profile.dietType || 'Tradicional',
      restrictions: profile.restrictions || '',
      notes: profile.notes || '',
      cycleStartDate: profile.cycleStartDate || '',
      currentPlanId: profile.currentPlanId || '',
      active: profile.active !== false,
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: profile.updatedAt || new Date().toISOString()
    };
    return next;
  }

  function normalizeNutritionPlan(plan) {
    const next = {
      id: plan.id || createId('plan'),
      name: plan.name || 'Plan sin nombre',
      description: plan.description || '',
      cycleLength: Number(plan.cycleLength || 10),
      freeDay: plan.freeDay !== false,
      waterMinLiters: Number(plan.waterMinLiters || 3),
      waterMaxLiters: Number(plan.waterMaxLiters || 5),
      active: plan.active !== false,
      days: Array.isArray(plan.days) ? plan.days.map((day, index) => ({
        dayNumber: Number(day.dayNumber || index + 1),
        name: day.name || `Día ${index + 1}`,
        description: day.description || '',
        carbohydrateLevel: day.carbohydrateLevel || '',
        meals: Array.isArray(day.meals) ? day.meals.map((meal) => ({
          id: meal.id || createId('meal'),
          mealName: meal.mealName || '',
          time: meal.time || '',
          blocks: Array.isArray(meal.blocks) ? meal.blocks.map((block) => ({
            type: block.type || '',
            quantity: block.quantity || '',
            unit: block.unit || '',
            options: block.options || ''
          })) : []
        })) : [],
        supplements: day.supplements || '',
        instructions: day.instructions || ''
      })) : []
    };
    return next;
  }

  function normalizeNutritionLog(log) {
    return {
      id: log.id || createId('log'),
      clientId: log.clientId || '',
      planId: log.planId || '',
      date: log.date || new Date().toISOString().slice(0, 10),
      cycleDay: Number(log.cycleDay || 1),
      completedMeals: Number(log.completedMeals || 0),
      totalMeals: Number(log.totalMeals || 0),
      waterLiters: Number(log.waterLiters || 0),
      supplementsCompleted: log.supplementsCompleted || false,
      energy: Number(log.energy || 0),
      hunger: Number(log.hunger || 0),
      digestion: log.digestion || 'Regular',
      weight: log.weight ? Number(log.weight) : '',
      notes: log.notes || '',
      createdAt: log.createdAt || new Date().toISOString()
    };
  }

  function normalizeFoodBlock(block) {
    return {
      id: block.id || createId('food'),
      type: block.type || '',
      name: block.name || '',
      portion: block.portion || '',
      unit: block.unit || '',
      alternatives: block.alternatives || '',
      tags: Array.isArray(block.tags) ? block.tags : []
    };
  }

  function normalizeArray(items, fallback, normalizeItem) {
    if (Array.isArray(items)) {
      return items.map((item, index) => normalizeItem(item, index)).filter(Boolean);
    }
    return fallback.map((item, index) => normalizeItem(item, index));
  }

  function normalizeAccount(account) {
    return {
      id: account.id || createId('account'),
      name: account.name || 'Cuenta',
      initialBalance: Number(account.initialBalance || 0),
      isActive: account.isActive !== false,
      isMain: account.isMain === true,
      isOperational: account.isOperational !== false
    };
  }

  function normalizeFinancialGoal(goal) {
    const targetAmount = Number(goal.targetAmount || 0);
    const accumulatedAmount = Number(goal.accumulatedAmount || 0);
    const progress = Number(goal.progress || Math.min(100, targetAmount ? (accumulatedAmount / targetAmount) * 100 : 0));
    return {
      id: goal.id || createId('goal'),
      name: goal.name || 'Meta',
      targetAmount,
      accumulatedAmount,
      priority: goal.priority || 'media',
      targetDate: goal.targetDate || '',
      progress: Number.isFinite(progress) ? progress : 0
    };
  }

  function normalizeDebt(debt) {
    return {
      id: debt.id || createId('debt'),
      name: debt.name || 'Deuda',
      totalAmount: Number(debt.totalAmount || 0),
      installmentsTotal: Number(debt.installmentsTotal || 0),
      installmentsPaid: Number(debt.installmentsPaid || 0),
      installmentsPending: Number(debt.installmentsPending || 0),
      amountPerInstallment: Number(debt.amountPerInstallment || 0),
      status: debt.status || 'active'
    };
  }

  function mergeArrayById(existingItems, incomingItems, normalizeItem) {
    const base = Array.isArray(incomingItems) && incomingItems.length ? incomingItems : existingItems;
    const merged = [];
    const byId = new Map();
    base.forEach((item) => {
      const normalized = normalizeItem(item);
      byId.set(normalized.id, normalized);
      merged.push(normalized);
    });
    existingItems.forEach((item) => {
      const normalized = normalizeItem(item);
      if (!byId.has(normalized.id)) {
        merged.push(normalized);
      }
    });
    return merged;
  }

  function mergeWithDefaults(parsed) {
    const base = createInitialState();
    const legacyMigratedSessions = migrateLegacyRoutinesToV08(parsed.trainings?.routines || []);
    const parsedSessions = Array.isArray(parsed.trainingsV08?.sessions) ? parsed.trainingsV08.sessions : [];
    const mergedSessions = mergeTrainingSessionsById(parsedSessions, legacyMigratedSessions);
    const recurringSource = Array.isArray(parsed.recurringTransactions) && parsed.recurringTransactions.length
      ? parsed.recurringTransactions
      : (Array.isArray(parsed.recurring) ? parsed.recurring : base.recurring);
    const merged = {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile || {}) },
      settings: { ...base.settings, ...(parsed.settings || {}) },
      accounts: mergeArrayById(base.accounts, parsed.accounts, normalizeAccount),
      categories: mergeArrayById(base.categories, parsed.categories, (item) => ({ id: item.id || createId('category'), name: item.name || 'Categoría', group: item.group || 'personal' })),
      recurring: mergeArrayById(base.recurring, recurringSource, (item) => item),
      recurringTransactions: mergeArrayById(base.recurringTransactions, recurringSource, (item) => item),
      clients: mergeArrayById(base.clients, parsed.clients, normalizeClient),
      movements: mergeArrayById(base.movements, parsed.movements, (item) => item),
      financialGoals: mergeArrayById(base.financialGoals, parsed.financialGoals, normalizeFinancialGoal),
      debts: mergeArrayById(base.debts, parsed.debts, normalizeDebt),
      trainings: {
        students: mergeArrayById(base.trainings.students, parsed.trainings?.students, (item) => item),
        routines: mergeArrayById(base.trainings.routines, parsed.trainings?.routines, (item) => item)
      },
      trainingModelVersion: parsed.trainingModelVersion || '0.8.0',
      trainingsV08: {
        plans: normalizeArray(parsed.trainingsV08?.plans, base.trainingsV08.plans, (plan) => ({
          id: plan.id || createId('tx-plan'),
          clientId: plan.clientId || '',
          name: plan.name || 'Plan de entrenamiento',
          active: plan.active !== false,
          notes: plan.notes || ''
        })),
        sessions: mergedSessions
      },
      exerciseLibrary: normalizeArray(parsed.exerciseLibrary, base.exerciseLibrary, normalizeLibraryExercise),
      sportsProfiles: normalizeArray(parsed.sportsProfiles, base.sportsProfiles, normalizeSportsProfile),
      sportsConsiderations: normalizeArray(parsed.sportsConsiderations, base.sportsConsiderations, normalizeSportsConsideration),
      movementStatuses: normalizeArray(parsed.movementStatuses, base.movementStatuses, normalizeMovementStatus),
      nutritionProfiles: normalizeArray(parsed.nutritionProfiles, base.nutritionProfiles, normalizeNutritionProfile),
      nutritionPlans: normalizeArray(parsed.nutritionPlans, base.nutritionPlans, normalizeNutritionPlan),
      nutritionLogs: normalizeArray(parsed.nutritionLogs, base.nutritionLogs, normalizeNutritionLog),
      foodBlocks: normalizeArray(parsed.foodBlocks, base.foodBlocks, normalizeFoodBlock)
    };
    return merged;
  }

  function loadState() {
    try {
      const existingKeys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
      const storedRaw = existingKeys.map((key) => ({ key, value: localStorage.getItem(key) })).find((entry) => Boolean(entry.value));
      if (!storedRaw) {
        return createInitialState();
      }
      const parsed = JSON.parse(storedRaw.value);
      return mergeWithDefaults(parsed);
    } catch (error) {
      console.warn('No se pudo cargar el estado inicial', error);
      return createInitialState();
    }
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
    importState,
    createId,
    normalizeClient,
    normalizeLibraryExercise,
    normalizeSportsProfile,
    normalizeSportsConsideration,
    normalizeMovementStatus
  };
})();
