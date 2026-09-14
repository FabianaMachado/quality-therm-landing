window.QT_SUPABASE_CONFIG = {
  url: "https://fsuvdxthvjweufmrbtnn.supabase.co",
  publishableKey: "sb_publishable_hK7Fjseg6lPjWXOeyhY8AQ_cWWqJBAS",
};

if (!window.supabase && !document.getElementById("supabase-cdn")) {
  const script = document.createElement("script");
  script.id = "supabase-cdn";
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.onload = () => {
    window.supabaseClient = window.supabase.createClient(
      window.QT_SUPABASE_CONFIG.url,
      window.QT_SUPABASE_CONFIG.publishableKey,
    );
    console.log("Supabase conectado com sucesso!");
  };
  document.head.appendChild(script);
} else if (window.supabase && !window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(
    window.QT_SUPABASE_CONFIG.url,
    window.QT_SUPABASE_CONFIG.publishableKey,
  );
}
