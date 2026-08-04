(function () {
  const authApi = window.VALHALLA.auth;
  const supabaseApi = window.VALHALLA.supabase;

  function isAvailable() {
    return Boolean(supabaseApi && typeof supabaseApi.isCloudEnabled === 'function' && supabaseApi.isCloudEnabled());
  }

  async function listClients() {
    if (!isAvailable()) {
      return { data: [], error: 'Modo local' };
    }

    const client = window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
    if (!client) {
      return { data: [], error: 'Supabase SDK no disponible' };
    }

    const { data, error } = await client.from('clients').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  }

  async function createClient(payload) {
    if (!isAvailable()) {
      return { data: null, error: 'Modo local' };
    }

    const client = window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
    if (!client) {
      return { data: null, error: 'Supabase SDK no disponible' };
    }

    const { data, error } = await client.from('clients').insert(payload).select().single();
    return { data, error };
  }

  async function updateClient(id, payload) {
    if (!isAvailable()) {
      return { data: null, error: 'Modo local' };
    }

    const client = window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
    if (!client) {
      return { data: null, error: 'Supabase SDK no disponible' };
    }

    const { data, error } = await client.from('clients').update(payload).eq('id', id).select().single();
    return { data, error };
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
