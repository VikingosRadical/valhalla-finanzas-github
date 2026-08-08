(function () {
  const authApi = window.VALHALLA.auth;
  const supabaseApi = window.VALHALLA.supabase;
  const dataApi = window.VALHALLA.data;

  function isAvailable() {
    return Boolean(supabaseApi && typeof supabaseApi.isCloudEnabled === 'function' && supabaseApi.isCloudEnabled());
  }

  function getSupabaseClient() {
    if (!isAvailable()) {
      return null;
    }
    if (!(window.supabase && typeof window.supabase.createClient === 'function')) {
      return null;
    }
    return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  async function getOwnerContext() {
    if (!authApi || typeof authApi.loadSession !== 'function' || typeof authApi.getProfile !== 'function') {
      return { ownerId: null, authUserId: null, error: 'Autenticación no disponible' };
    }

    const sessionResult = await authApi.loadSession();
    if (!sessionResult || !sessionResult.session || !sessionResult.user) {
      return { ownerId: null, authUserId: null, error: 'No existe una sesión activa en Cloud' };
    }

    const profileResult = await authApi.getProfile();
    if (!profileResult || !profileResult.profile || !profileResult.profile.id) {
      return { ownerId: null, authUserId: null, error: 'No se encontró un perfil asociado a la sesión activa' };
    }

    return {
      ownerId: profileResult.profile.id,
      authUserId: sessionResult.user.id,
      error: null
    };
  }

  function normalizeTrainingSet(setEntry, index) {
    return {
      setNumber: Number(setEntry?.setNumber || index + 1),
      weight: Number(setEntry?.weight || 0),
      reps: Number(setEntry?.reps || 0),
      completed: setEntry?.completed !== false,
      createdAt: setEntry?.createdAt || new Date().toISOString(),
      techniqueStatus: setEntry?.techniqueStatus || 'pending',
      coachValidated: Boolean(setEntry?.coachValidated),
      personalRecord: Boolean(setEntry?.personalRecord)
    };
  }

  function normalizeTrainingExercise(exercise, index) {
    const plannedSets = Number(exercise?.plannedSets || 1);
    const plannedRepMin = Number(exercise?.plannedRepMin || 1);
    const plannedRepMaxRaw = Number(exercise?.plannedRepMax || plannedRepMin);
    return {
      id: String(exercise?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx-exercise-${Date.now()}-${index + 1}`)),
      exerciseName: String(exercise?.exerciseName || 'Ejercicio'),
      order: Number(exercise?.order || index + 1),
      plannedSets: plannedSets > 0 ? plannedSets : 1,
      plannedRepMin: plannedRepMin > 0 ? plannedRepMin : 1,
      plannedRepMax: plannedRepMaxRaw >= plannedRepMin ? plannedRepMaxRaw : plannedRepMin,
      targetWeight: Number(exercise?.targetWeight || 0),
      restSeconds: Number(exercise?.restSeconds || 90),
      coachNotes: String(exercise?.coachNotes || ''),
      sets: Array.isArray(exercise?.sets)
        ? exercise.sets.map((setEntry, setIndex) => normalizeTrainingSet(setEntry, setIndex))
        : []
    };
  }

  function normalizeTrainingSession(session, index) {
    return {
      id: String(session?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx-session-${Date.now()}-${index + 1}`)),
      clientId: String(session?.clientId || ''),
      planId: session?.planId || null,
      groupSessionId: session?.groupSessionId || null,
      date: String(session?.date || ''),
      title: String(session?.title || `Sesion ${index + 1}`),
      status: String(session?.status || 'in_progress'),
      notes: String(session?.notes || ''),
      exercises: Array.isArray(session?.exercises)
        ? session.exercises.map((exercise, exerciseIndex) => normalizeTrainingExercise(exercise, exerciseIndex))
        : []
    };
  }

  function normalizeClientRecord(client) {
    if (dataApi && typeof dataApi.normalizeClient === 'function') {
      return dataApi.normalizeClient(client);
    }

    return client;
  }

  async function listClients() {
    if (!isAvailable()) {
      return { data: [], error: 'Modo local' };
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: [], error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: [], error: 'Supabase SDK no disponible' };
    }

    const { data, error } = await client.from('clients').select('*').eq('owner_id', ownerContext.ownerId).order('created_at', { ascending: false });
    return { data: Array.isArray(data) ? data.map((item) => normalizeClientRecord(item)) : [], error };
  }

  async function createClient(payload) {
    if (!isAvailable()) {
      return { data: null, error: 'Modo local' };
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: null, error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: 'Supabase SDK no disponible' };
    }

    const nextPayload = {
      ...payload,
      owner_id: ownerContext.ownerId,
      auth_user_id: ownerContext.authUserId
    };

    const { data, error } = await client.from('clients').insert(nextPayload).select().single();
    return { data: data ? normalizeClientRecord(data) : null, error };
  }

  async function updateClient(id, payload) {
    if (!isAvailable()) {
      return { data: null, error: 'Modo local' };
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: null, error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: 'Supabase SDK no disponible' };
    }

    const { data, error } = await client.from('clients').update(payload).eq('id', id).eq('owner_id', ownerContext.ownerId).select().single();
    return { data: data ? normalizeClientRecord(data) : null, error };
  }

  async function markClientPaid(clientId, paymentDetails) {
    if (!isAvailable()) {
      return { data: null, error: 'Modo local' };
    }

    return { data: null, error: 'Integración en preparación' };
  }

  async function listTrainingPlans() {
    if (!isAvailable()) {
      return { data: [], error: 'Modo local' };
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: [], error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: [], error: 'Supabase SDK no disponible' };
    }

    const { data, error } = await client
      .from('training_plans')
      .select('*')
      .eq('owner_id', ownerContext.ownerId)
      .order('created_at', { ascending: false });

    return { data: Array.isArray(data) ? data : [], error };
  }

  async function upsertTrainingPlan(planPayload) {
    if (!isAvailable()) {
      return { data: null, error: 'Modo local' };
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: null, error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: 'Supabase SDK no disponible' };
    }

    const payload = {
      id: String(planPayload?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx-plan-${Date.now()}`)),
      owner_id: ownerContext.ownerId,
      client_id: String(planPayload?.client_id || ''),
      name: String(planPayload?.name || 'Plantilla de entrenamiento'),
      notes: String(planPayload?.notes || ''),
      active: planPayload?.active !== false
    };

    const { data, error } = await client
      .from('training_plans')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    return { data, error };
  }

  async function deleteTrainingPlan(planId) {
    if (!isAvailable()) {
      return { data: null, error: 'Modo local' };
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: null, error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: 'Supabase SDK no disponible' };
    }

    const { error } = await client
      .from('training_plans')
      .delete()
      .eq('id', planId)
      .eq('owner_id', ownerContext.ownerId);

    return { data: null, error };
  }

  async function listTrainingSessions() {
    if (!isAvailable()) {
      return { data: [], error: 'Modo local' };
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: [], error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: [], error: 'Supabase SDK no disponible' };
    }

    const { data: sessionsData, error: sessionsError } = await client
      .from('training_sessions')
      .select('*')
      .eq('owner_id', ownerContext.ownerId)
      .order('session_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (sessionsError) {
      return { data: [], error: sessionsError };
    }

    const sessionIds = (sessionsData || []).map((session) => String(session.id));
    if (!sessionIds.length) {
      return { data: [], error: null };
    }

    const { data: exercisesData, error: exercisesError } = await client
      .from('training_exercises')
      .select('*')
      .eq('owner_id', ownerContext.ownerId)
      .in('session_id', sessionIds)
      .order('exercise_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (exercisesError) {
      return { data: [], error: exercisesError };
    }

    const exerciseIds = (exercisesData || []).map((exercise) => String(exercise.id));
    const setsByExerciseId = new Map();
    if (exerciseIds.length) {
      const { data: setsData, error: setsError } = await client
        .from('training_sets')
        .select('*')
        .eq('owner_id', ownerContext.ownerId)
        .in('exercise_id', exerciseIds)
        .order('set_number', { ascending: true })
        .order('created_at', { ascending: true });
      if (setsError) {
        return { data: [], error: setsError };
      }

      (setsData || []).forEach((setRow, setIndex) => {
        const key = String(setRow.exercise_id);
        if (!setsByExerciseId.has(key)) {
          setsByExerciseId.set(key, []);
        }
        setsByExerciseId.get(key).push(normalizeTrainingSet({
          setNumber: setRow.set_number,
          weight: setRow.weight,
          reps: setRow.reps,
          completed: setRow.completed,
          createdAt: setRow.created_at,
          techniqueStatus: setRow.technique_status,
          coachValidated: setRow.coach_validated,
          personalRecord: setRow.personal_record
        }, setIndex));
      });
    }

    const exercisesBySessionId = new Map();
    (exercisesData || []).forEach((exerciseRow, index) => {
      const sessionId = String(exerciseRow.session_id);
      if (!exercisesBySessionId.has(sessionId)) {
        exercisesBySessionId.set(sessionId, []);
      }
      exercisesBySessionId.get(sessionId).push(normalizeTrainingExercise({
        id: exerciseRow.id,
        exerciseName: exerciseRow.exercise_name,
        order: exerciseRow.exercise_order,
        plannedSets: exerciseRow.planned_sets,
        plannedRepMin: exerciseRow.planned_rep_min,
        plannedRepMax: exerciseRow.planned_rep_max,
        targetWeight: exerciseRow.target_weight,
        restSeconds: exerciseRow.rest_seconds,
        coachNotes: exerciseRow.coach_notes,
        sets: setsByExerciseId.get(String(exerciseRow.id)) || []
      }, index));
    });

    const sessions = (sessionsData || []).map((sessionRow, index) => normalizeTrainingSession({
      id: sessionRow.id,
      clientId: sessionRow.client_id,
      planId: sessionRow.plan_id,
      groupSessionId: sessionRow.group_session_id,
      date: sessionRow.session_date,
      title: sessionRow.title,
      status: sessionRow.status,
      notes: sessionRow.notes,
      exercises: exercisesBySessionId.get(String(sessionRow.id)) || []
    }, index));

    return { data: sessions, error: null };
  }

  async function upsertTrainingSession(session) {
    if (!isAvailable()) {
      return { data: null, error: 'Modo local' };
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: null, error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: 'Supabase SDK no disponible' };
    }

    const normalized = normalizeTrainingSession(session, 0);
    const payload = {
      id: normalized.id,
      owner_id: ownerContext.ownerId,
      client_id: normalized.clientId,
      plan_id: normalized.planId,
      group_session_id: normalized.groupSessionId,
      session_date: normalized.date || null,
      title: normalized.title,
      status: normalized.status,
      notes: normalized.notes
    };

    const { data, error } = await client
      .from('training_sessions')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    return { data, error };
  }

  async function upsertTrainingExercise(session, exercise) {
    if (!isAvailable()) {
      return { data: null, error: 'Modo local' };
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: null, error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: 'Supabase SDK no disponible' };
    }

    const normalizedSession = normalizeTrainingSession(session, 0);
    const normalizedExercise = normalizeTrainingExercise(exercise, 0);

    const payload = {
      id: normalizedExercise.id,
      owner_id: ownerContext.ownerId,
      client_id: normalizedSession.clientId,
      session_id: normalizedSession.id,
      exercise_name: normalizedExercise.exerciseName,
      exercise_order: normalizedExercise.order,
      planned_sets: normalizedExercise.plannedSets,
      planned_rep_min: normalizedExercise.plannedRepMin,
      planned_rep_max: normalizedExercise.plannedRepMax,
      target_weight: normalizedExercise.targetWeight,
      rest_seconds: normalizedExercise.restSeconds,
      coach_notes: normalizedExercise.coachNotes
    };

    const { data, error } = await client
      .from('training_exercises')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    return { data, error };
  }

  async function upsertTrainingSet(session, exercise, setEntry) {
    if (!isAvailable()) {
      return { data: null, error: 'Modo local' };
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: null, error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: 'Supabase SDK no disponible' };
    }

    const normalizedSession = normalizeTrainingSession(session, 0);
    const normalizedExercise = normalizeTrainingExercise(exercise, 0);
    const normalizedSet = normalizeTrainingSet(setEntry, 0);
    const setId = String(setEntry?.id || `${normalizedExercise.id}::${normalizedSet.setNumber}`);

    const payload = {
      id: setId,
      owner_id: ownerContext.ownerId,
      client_id: normalizedSession.clientId,
      session_id: normalizedSession.id,
      exercise_id: normalizedExercise.id,
      set_number: normalizedSet.setNumber,
      weight: normalizedSet.weight,
      reps: normalizedSet.reps,
      completed: normalizedSet.completed,
      technique_status: normalizedSet.techniqueStatus,
      coach_validated: normalizedSet.coachValidated,
      personal_record: normalizedSet.personalRecord,
      created_at: normalizedSet.createdAt
    };

    const { data, error } = await client
      .from('training_sets')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    return { data, error };
  }

  async function saveTrainingSessionDeep(session) {
    const normalizedSession = normalizeTrainingSession(session, 0);
    const sessionResult = await upsertTrainingSession(normalizedSession);
    if (sessionResult.error) {
      return sessionResult;
    }

    const ownerContext = await getOwnerContext();
    if (ownerContext.error) {
      return { data: null, error: ownerContext.error };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: 'Supabase SDK no disponible' };
    }

    const incomingExerciseIds = new Set(normalizedSession.exercises.map((exercise) => String(exercise.id)));
    const incomingSetIds = new Set();

    for (let exerciseIndex = 0; exerciseIndex < normalizedSession.exercises.length; exerciseIndex += 1) {
      const exercise = normalizeTrainingExercise(normalizedSession.exercises[exerciseIndex], exerciseIndex);
      const exerciseResult = await upsertTrainingExercise(normalizedSession, exercise);
      if (exerciseResult.error) {
        return exerciseResult;
      }
      for (let setIndex = 0; setIndex < exercise.sets.length; setIndex += 1) {
        const setEntry = normalizeTrainingSet(exercise.sets[setIndex], setIndex);
        incomingSetIds.add(String(setEntry?.id || `${exercise.id}::${setEntry.setNumber}`));
        const setResult = await upsertTrainingSet(normalizedSession, exercise, setEntry);
        if (setResult.error) {
          return setResult;
        }
      }
    }

    const { data: existingExercises, error: existingExercisesError } = await client
      .from('training_exercises')
      .select('id')
      .eq('owner_id', ownerContext.ownerId)
      .eq('session_id', normalizedSession.id);

    if (existingExercisesError) {
      return { data: null, error: existingExercisesError };
    }

    const staleExerciseIds = (existingExercises || [])
      .map((row) => String(row.id))
      .filter((exerciseId) => !incomingExerciseIds.has(exerciseId));

    if (staleExerciseIds.length) {
      const { error: deleteExercisesError } = await client
        .from('training_exercises')
        .delete()
        .eq('owner_id', ownerContext.ownerId)
        .in('id', staleExerciseIds);
      if (deleteExercisesError) {
        return { data: null, error: deleteExercisesError };
      }
    }

    const { data: existingSets, error: existingSetsError } = await client
      .from('training_sets')
      .select('id')
      .eq('owner_id', ownerContext.ownerId)
      .eq('session_id', normalizedSession.id);

    if (existingSetsError) {
      return { data: null, error: existingSetsError };
    }

    const staleSetIds = (existingSets || [])
      .map((row) => String(row.id))
      .filter((setId) => !incomingSetIds.has(setId));

    if (staleSetIds.length) {
      const { error: deleteSetsError } = await client
        .from('training_sets')
        .delete()
        .eq('owner_id', ownerContext.ownerId)
        .in('id', staleSetIds);
      if (deleteSetsError) {
        return { data: null, error: deleteSetsError };
      }
    }

    return { data: normalizedSession, error: null };
  }

  async function uploadLocalDataToCloud(localState) {
    if (!isAvailable()) {
      return { ok: false, error: 'Modo local' };
    }
    return {
      ok: false,
      error: 'Funcion manual pendiente: Subir datos locales a Cloud'
    };
  }

  window.VALHALLA = window.VALHALLA || {};
  window.VALHALLA.cloudData = {
    isAvailable,
    getOwnerContext,
    listClients,
    createClient,
    updateClient,
    markClientPaid,
    listTrainingPlans,
    upsertTrainingPlan,
    deleteTrainingPlan,
    listTrainingSessions,
    upsertTrainingSession,
    upsertTrainingExercise,
    upsertTrainingSet,
    saveTrainingSessionDeep,
    uploadLocalDataToCloud
  };
})();
