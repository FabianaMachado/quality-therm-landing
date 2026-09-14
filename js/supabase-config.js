/* =========================================================
   QUALITY THERM - CONFIGURAÇÃO ÚNICA DO SUPABASE
========================================================= */

window.QT_SUPABASE_CONFIG = {
  url: "https://fsuvdxthvjweufmrbtnn.supabase.co",
  publishableKey: "sb_publishable_hK7Fjseg6lPjWXOeyhY8AQ_cWWqJBAS",
};

/* =========================================================
   CRIA / RECUPERA UMA ÚNICA INSTÂNCIA DO SUPABASE
========================================================= */

window.initQualityThermSupabase = function () {
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("Biblioteca do Supabase não foi carregada.");

    return null;
  }

  if (window.supabaseClient) {
    return window.supabaseClient;
  }

  const config = window.QT_SUPABASE_CONFIG;

  if (!config || !config.url || !config.publishableKey) {
    console.error("Configuração do Supabase está incompleta.");

    return null;
  }

  window.supabaseClient = window.supabase.createClient(
    config.url,
    config.publishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,

        /*
            IMPORTANTE:
            todos os arquivos do painel deverão
            usar esta mesma sessão.
          */
        storageKey: "qualitytherm-admin-auth",
      },
    },
  );

  console.log("Quality Therm: Supabase inicializado.");

  return window.supabaseClient;
};

/* =========================================================
   INICIALIZA AUTOMATICAMENTE
========================================================= */

if (window.supabase) {
  window.initQualityThermSupabase();
}
