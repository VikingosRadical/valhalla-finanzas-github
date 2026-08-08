(function () {
  const config = window.VALHALLA_CONFIG || {};
  const supabaseUrl = (config.SUPABASE_URL || window.SUPABASE_URL || '').trim();
  const supabaseAnonKey = (config.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY || '').trim();

  let clientInstance = null;

  function getClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    const keyPreview = supabaseAnonKey.slice(0, 15);
    const keyLength = supabaseAnonKey.length;
    const createClientAvailable = Boolean(window.supabase && typeof window.supabase.createClient === 'function');
    console.info('[VALHALLA Cloud Debug]', {
      projectUrl: supabaseUrl,
      keyFirst15: keyPreview,
      keyLength,
      createClientAvailable
    });

    if (!clientInstance && window.supabase && typeof window.supabase.createClient === 'function') {
      clientInstance = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.info('[VALHALLA Cloud Debug]', {
        clientCreated: Boolean(clientInstance)
      });
    }

    return clientInstance;
  }

  async function signIn(email, password) {
    const client = getClient();
    if (!client) {
      return { ok: false, error: 'Supabase no está configurado' };
    }

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      return { ok: false, error: error.message || 'No se pudo iniciar sesión' };
    }

    return { ok: true, session: data.session, user: data.user };
  }

  async function signOut() {
    const client = getClient();
    if (!client) {
      return { ok: true, message: 'Sin sesión activa' };
    }

    const { error } = await client.auth.signOut();
    if (error) {
      return { ok: false, error: error.message || 'No se pudo cerrar la sesión' };
    }

    return { ok: true };
  }

  async function loadSession() {
    const client = getClient();
    if (!client) {
      return { session: null, user: null };
    }

    const { data, error } = await client.auth.getSession();
    if (error) {
      return { session: null, user: null, error: error.message };
    }

    return { session: data.session, user: data.session?.user || null };
  }

  async function getProfile() {
    const client = getClient();
    if (!client) {
      return { profile: null };
    }

    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData?.session?.user || null;
    if (!user) {
      return { profile: null };
    }

    const { data, error } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) {
      return { profile: null, error: error.message };
    }

    return { profile: data };
  }

  window.VALHALLA = window.VALHALLA || {};
  window.VALHALLA.auth = {
    signIn,
    signOut,
    loadSession,
    getProfile
  };
})();
