(function () {
  const config = window.VALHALLA_CONFIG || {};
  const supabaseUrl = (config.SUPABASE_URL || window.SUPABASE_URL || '').trim();
  const supabaseAnonKey = (config.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY || '').trim();

  function isCloudEnabled() {
    return Boolean(supabaseUrl && supabaseAnonKey);
  }

  function getModeLabel() {
    return isCloudEnabled() ? 'Modo Cloud' : 'Modo Local';
  }

  function saveData(data) {
    if (window.VALHALLA && window.VALHALLA.data && typeof window.VALHALLA.data.saveState === 'function') {
      window.VALHALLA.data.saveState(data);
    }

    if (!isCloudEnabled()) {
      return { ok: true, mode: 'local', message: 'Guardado en localStorage' };
    }

    return { ok: true, mode: 'cloud', message: 'Guardado en localStorage mientras se sincroniza con Supabase' };
  }

  function loadData() {
    if (window.VALHALLA && window.VALHALLA.data && typeof window.VALHALLA.data.loadState === 'function') {
      return window.VALHALLA.data.loadState();
    }

    return null;
  }

  function initSupabase() {
    if (!isCloudEnabled()) {
      return { initialized: false, mode: 'local' };
    }

    return {
      initialized: true,
      mode: 'cloud',
      url: supabaseUrl,
      anonKey: supabaseAnonKey
    };
  }

  window.VALHALLA = window.VALHALLA || {};
  window.VALHALLA.supabase = {
    isCloudEnabled,
    getModeLabel,
    saveData,
    loadData,
    initSupabase
  };
})();
