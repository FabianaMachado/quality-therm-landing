const config = window.QT_SUPABASE_CONFIG;

if (!config || !config.url || !config.publishableKey) {
  console.error("Configuração do Supabase não encontrada.");

  window.location.replace("./login.html");

  throw new Error("Supabase config ausente.");
}

const adminSupabase = window.initQualityThermSupabase
  ? window.initQualityThermSupabase()
  : window.supabaseClient;

if (!adminSupabase) {
  console.error("Supabase não inicializado.");

  window.location.replace("./login.html");

  throw new Error("Supabase não inicializado.");
}

async function protegerPainel() {
  try {
    const { data, error } =
      await adminSupabase.auth.getSession();

    if (error) {
      console.error(
        "Erro ao verificar sessão:",
        error
      );

      window.location.replace("./login.html");

      return;
    }

    if (!data?.session?.user) {
      window.location.replace("./login.html");

      return;
    }

    document.body.classList.add(
      "admin-authenticated"
    );

  } catch (error) {
    console.error(
      "Erro na proteção do painel:",
      error
    );

    window.location.replace("./login.html");
  }
}

async function sairDoPainel() {
  try {
    await adminSupabase.auth.signOut();

  } catch (error) {
    console.error(
      "Erro ao sair:",
      error
    );
  }

  window.location.replace("./login.html");
}

window.sairDoPainel = sairDoPainel;

protegerPainel();
