const config = window.QT_SUPABASE_CONFIG;

if (!config || !config.url || !config.publishableKey) {
  console.error("Configuração do Supabase não encontrada.");

  window.location.href = "./login.html";

  throw new Error("Supabase config ausente.");
}

const adminSupabase = window.supabase.createClient(
  config.url,
  config.publishableKey,
);

async function protegerPainel() {
  try {
    const { data, error } = await adminSupabase.auth.getSession();

    if (error) {
      console.error("Erro ao verificar sessão:", error);

      window.location.href = "./login.html";

      return;
    }

    if (!data || !data.session || !data.session.user) {
      window.location.href = "./login.html";

      return;
    }

    document.body.classList.add("admin-authenticated");
  } catch (error) {
    console.error("Erro na proteção do painel:", error);

    window.location.href = "./login.html";
  }
}

async function sairDoPainel() {
  try {
    await adminSupabase.auth.signOut();
  } catch (error) {
    console.error("Erro ao sair:", error);
  }

  window.location.href = "./login.html";
}

window.sairDoPainel = sairDoPainel;

protegerPainel();
