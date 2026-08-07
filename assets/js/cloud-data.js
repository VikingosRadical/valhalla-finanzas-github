(function () {
  const authApi = window.VALHALLA.auth;
  const supabaseApi = window.VALHALLA.supabase;
  const dataApi = window.VALHALLA.data;

  function isAvailable() {
    return Boolean(supabaseApi && typeof supabaseApi.isCloudEnabled === 'function' && supabaseApi.isCloudEnabled());
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

    const client = window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
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

    const client = window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
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

    const client = window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
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

  window.VALHALLA = window.VALHALLA || {};
  window.VALHALLA.cloudData = {
    isAvailable,
    listClients,
    createClient,
    updateClient,
    markClientPaid
  };
})();
