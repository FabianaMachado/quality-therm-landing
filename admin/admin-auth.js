"use strict";

/* =========================================================
   QUALITY THERM
   PROTEÇÃO DO PAINEL ADMINISTRATIVO
========================================================= */

console.log("🔐 Quality Therm: carregando autenticação do admin.");

/* =========================================================
   1. OBTÉM A MESMA INSTÂNCIA DO SUPABASE
========================================================= */

const adminSupabase = window.initQualityThermSupabase
  ? window.initQualityThermSupabase()
  : window.supabaseClient;

if (!adminSupabase) {
  console.error("❌ Supabase não foi inicializado no painel.");

  window.location.replace("./login.html");

  throw new Error("Supabase não inicializado.");
}

/* =========================================================
   2. EVITA REDIRECIONAMENTOS REPETIDOS
========================================================= */

let authRedirectInProgress = false;

function irParaLogin() {
  if (authRedirectInProgress) {
    return;
  }

  authRedirectInProgress = true;

  console.log("🔒 Sessão não encontrada. Redirecionando para login.");

  window.location.replace("./login.html");
}

/* =========================================================
   3. PROTEGER O PAINEL
========================================================= */

async function protegerPainel() {
  try {
    console.log("🔎 Verificando sessão do administrador...");

    const { data, error } = await adminSupabase.auth.getSession();

    if (error) {
      console.error("❌ Erro ao verificar sessão:", error);

      irParaLogin();

      return;
    }

    const session = data?.session;

    if (!session?.user) {
      console.log("⚠️ Nenhum usuário autenticado.");

      irParaLogin();

      return;
    }

    console.log("✅ Administrador autenticado:", session.user.email);

    /*
      Só libera visualmente o painel
      depois que a sessão for confirmada.
    */

    document.body.classList.add("admin-authenticated");

    document.documentElement.classList.add("admin-authenticated");

    /*
      Evento opcional para outros scripts
      saberem que a autenticação terminou.
    */

    window.dispatchEvent(
      new CustomEvent("qualitytherm:authenticated", {
        detail: {
          user: session.user,
        },
      }),
    );
  } catch (error) {
    console.error("❌ Erro inesperado na autenticação:", error);

    irParaLogin();
  }
}

/* =========================================================
   4. LOGOUT
========================================================= */

async function sairDoPainel() {
  try {
    console.log("🚪 Encerrando sessão...");

    const { error } = await adminSupabase.auth.signOut();

    if (error) {
      console.error("Erro ao sair:", error);
    }
  } catch (error) {
    console.error("Erro inesperado ao sair:", error);
  } finally {
    authRedirectInProgress = true;

    window.location.replace("./login.html");
  }
}

/* =========================================================
   5. DISPONIBILIZA LOGOUT PARA OS BOTÕES DO HTML
========================================================= */

window.sairDoPainel = sairDoPainel;

/* =========================================================
   6. MONITORA MUDANÇAS DE AUTENTICAÇÃO

   IMPORTANTE:
   Não redirecionamos para index.html aqui.

   O login.html é responsável por entrar no painel.
   Este arquivo é responsável somente por PROTEGER o painel.
========================================================= */

adminSupabase.auth.onAuthStateChange((event, session) => {
  console.log("🔄 Estado da autenticação:", event);

  /*
      Se o usuário realmente sair,
      manda para o login.
    */

  if (event === "SIGNED_OUT") {
    irParaLogin();

    return;
  }

  /*
      Se houver sessão válida,
      mantém o painel liberado.
    */

  if (session?.user) {
    document.body.classList.add("admin-authenticated");

    document.documentElement.classList.add("admin-authenticated");
  }
});

/* =========================================================
   7. INICIA A PROTEÇÃO
========================================================= */

protegerPainel();
