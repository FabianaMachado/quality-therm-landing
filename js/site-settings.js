(() => {
  "use strict";

  /* =========================================================
     CONFIGURAÇÕES LOCAIS ANTIGAS
     Mantemos temporariamente para não quebrar
     empresa, WhatsApp, cores, logo etc.
  ========================================================= */

  const SETTINGS_KEY = "qt_admin_settings";

  const defaults = {
    companyName: "Quality Therm Aquecedores",

    companyShortName: "Quality Therm",

    companyWhatsapp: "11985673883",

    companyPhone: "11976993640",

    companyEmail: "vendasqualitythermaquecedores@gmail.com",

    companyLogo: "",

    googleReviewUrl: "",

    instagramUrl: "",

    facebookUrl: "",

    primaryColor: "#d97d2b",

    darkColor: "#0e171d",

    whatsappButtonText: "WhatsApp",
  };

  /* =========================================================
     CONFIGURAÇÕES DA LOJA - PADRÕES
  ========================================================= */

  const storeDefaults = {
    menuStoreLabel: "Loja",

    homeStoreEyebrow: "Loja",

    homeStoreTitle: "Produtos em destaque",

    homeStoreDescription:
      "Equipamentos, acessórios e produtos selecionados para facilitar sua escolha. Consulte disponibilidade, instalação e condições diretamente com nossa equipe.",

    homeStoreButtonText: "Ver todos os produtos",
  };

  /* =========================================================
     BUSCAR CONFIGURAÇÕES LOCAIS ANTIGAS
  ========================================================= */

  function getLocalSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));

      if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
        return {};
      }

      return saved;
    } catch (error) {
      console.error("Erro ao carregar configurações locais:", error);

      return {};
    }
  }

  function settings() {
    return {
      ...defaults,
      ...getLocalSettings(),
    };
  }

  /* =========================================================
     SUPABASE
  ========================================================= */

  function createPublicSupabaseClient() {
    const config = window.QT_SUPABASE_CONFIG;

    if (!config || !config.url || !config.publishableKey) {
      console.warn("Supabase não configurado. Usando valores padrão da Loja.");

      return null;
    }

    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      console.warn("Biblioteca do Supabase não carregada.");

      return null;
    }

    return window.supabase.createClient(config.url, config.publishableKey);
  }

  /* =========================================================
     SOMENTE NÚMEROS
  ========================================================= */

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  /* =========================================================
     FORMATAR TELEFONE
  ========================================================= */

  function formatPhone(value) {
    const number = digits(value);

    let local = number;

    if (local.startsWith("55") && local.length > 11) {
      local = local.slice(2);
    }

    if (local.length === 11) {
      return (
        `(${local.slice(0, 2)}) ` +
        `${local.slice(2, 7)}-` +
        `${local.slice(7)}`
      );
    }

    if (local.length === 10) {
      return (
        `(${local.slice(0, 2)}) ` +
        `${local.slice(2, 6)}-` +
        `${local.slice(6)}`
      );
    }

    return String(value || "");
  }

  /* =========================================================
     WHATSAPP
  ========================================================= */

  function whatsappNumber() {
    const cfg = settings();

    const value = digits(cfg.companyWhatsapp);

    if (!value) {
      return "";
    }

    if (value.startsWith("55")) {
      return value;
    }

    return `55${value}`;
  }

  function whatsappUrl(message = "") {
    const phone = whatsappNumber();

    if (!phone) {
      return "#";
    }

    return (
      "https://api.whatsapp.com/send" +
      `?phone=${encodeURIComponent(phone)}` +
      `&text=${encodeURIComponent(message)}`
    );
  }

  /* =========================================================
     TEMA / CORES
  ========================================================= */

  function applyTheme() {
    const cfg = settings();

    const root = document.documentElement;

    root.style.setProperty(
      "--brand",
      cfg.primaryColor || defaults.primaryColor,
    );

    root.style.setProperty("--ink", cfg.darkColor || defaults.darkColor);

    root.style.setProperty(
      "--primary",
      cfg.primaryColor || defaults.primaryColor,
    );

    root.style.setProperty(
      "--primary-color",
      cfg.primaryColor || defaults.primaryColor,
    );

    root.style.setProperty("--dark", cfg.darkColor || defaults.darkColor);

    root.style.setProperty("--dark-color", cfg.darkColor || defaults.darkColor);

    const themeMeta = document.querySelector('meta[name="theme-color"]');

    if (themeMeta && cfg.darkColor) {
      themeMeta.setAttribute("content", cfg.darkColor);
    }
  }

  /* =========================================================
     TEXTOS DA EMPRESA
  ========================================================= */

  function applyTextContent() {
    const cfg = settings();

    document.querySelectorAll("[data-company-name]").forEach((element) => {
      element.textContent = cfg.companyName || defaults.companyName;
    });

    document
      .querySelectorAll("[data-company-short-name]")
      .forEach((element) => {
        element.textContent = cfg.companyShortName || defaults.companyShortName;
      });

    document.querySelectorAll("[data-company-whatsapp]").forEach((element) => {
      element.textContent = formatPhone(cfg.companyWhatsapp);
    });

    document.querySelectorAll("[data-company-phone]").forEach((element) => {
      element.textContent = formatPhone(cfg.companyPhone);
    });

    document.querySelectorAll("[data-company-email]").forEach((element) => {
      element.textContent = cfg.companyEmail || defaults.companyEmail;
    });

    document.querySelectorAll("[data-whatsapp-text]").forEach((element) => {
      element.textContent =
        cfg.whatsappButtonText || defaults.whatsappButtonText;
    });
  }

  /* =========================================================
     LINKS
  ========================================================= */

  function applyLinks() {
    const cfg = settings();

    document.querySelectorAll("[data-whatsapp-link]").forEach((element) => {
      const defaultMessage = `Olá! Vim pelo site da ${
        cfg.companyShortName || defaults.companyShortName
      } e gostaria de atendimento.`;

      const message = element.dataset.whatsappMessage || defaultMessage;

      element.href = whatsappUrl(message);
    });

    document
      .querySelectorAll("[data-company-email-link]")
      .forEach((element) => {
        if (cfg.companyEmail) {
          element.href = `mailto:${cfg.companyEmail}`;

          element.hidden = false;
        } else {
          element.removeAttribute("href");
        }
      });

    document
      .querySelectorAll("[data-company-phone-link]")
      .forEach((element) => {
        const phone = digits(cfg.companyPhone);

        if (phone) {
          element.href = `tel:+55${phone}`;

          element.hidden = false;
        } else {
          element.removeAttribute("href");
        }
      });

    document.querySelectorAll("[data-instagram-link]").forEach((element) => {
      if (cfg.instagramUrl) {
        element.href = cfg.instagramUrl;

        element.hidden = false;
      } else {
        element.hidden = true;
      }
    });

    document.querySelectorAll("[data-facebook-link]").forEach((element) => {
      if (cfg.facebookUrl) {
        element.href = cfg.facebookUrl;

        element.hidden = false;
      } else {
        element.hidden = true;
      }
    });

    document
      .querySelectorAll("[data-google-review-link]")
      .forEach((element) => {
        if (cfg.googleReviewUrl) {
          element.href = cfg.googleReviewUrl;

          element.hidden = false;
        } else {
          element.hidden = true;
        }
      });
  }

  /* =========================================================
     LOGO
  ========================================================= */

  function applyLogo() {
    const cfg = settings();

    const logos = document.querySelectorAll("[data-company-logo]");

    const fallbacks = document.querySelectorAll("[data-company-logo-fallback]");

    if (!cfg.companyLogo) {
      logos.forEach((image) => {
        image.hidden = true;

        image.removeAttribute("src");
      });

      fallbacks.forEach((element) => {
        element.hidden = false;
      });

      return;
    }

    logos.forEach((image) => {
      image.src = cfg.companyLogo;

      image.hidden = false;
    });

    fallbacks.forEach((element) => {
      element.hidden = true;
    });
  }

  /* =========================================================
     TÍTULO DO NAVEGADOR
  ========================================================= */

  function applyDocumentTitle() {
    const cfg = settings();

    const shortName = cfg.companyShortName || defaults.companyShortName;

    const title = document.title;

    if (!title) {
      return;
    }

    if (title.includes("Quality Therm")) {
      document.title = title.replace(/Quality Therm/g, shortName);
    }
  }

  /* =========================================================
     ACESSIBILIDADE
  ========================================================= */

  function applyAccessibility() {
    const cfg = settings();

    const shortName = cfg.companyShortName || defaults.companyShortName;

    document.querySelectorAll("[data-company-logo]").forEach((image) => {
      image.alt = `Logo ${shortName}`;
    });
  }

  /* =========================================================
     APLICAR CONFIGURAÇÕES DA LOJA
  ========================================================= */

  function applyStoreSettings(store) {
    const config = {
      ...storeDefaults,
      ...store,
    };

    const menuStoreLink = document.getElementById("menuStoreLink");

    const homeStoreEyebrow = document.getElementById("homeStoreEyebrow");

    const homeStoreTitle = document.getElementById("homeStoreTitle");

    const homeStoreDescription = document.getElementById(
      "homeStoreDescription",
    );

    const homeStoreButtonText = document.getElementById("homeStoreButtonText");

    if (menuStoreLink) {
      menuStoreLink.textContent = config.menuStoreLabel;
    }

    if (homeStoreEyebrow) {
      homeStoreEyebrow.textContent = config.homeStoreEyebrow;
    }

    if (homeStoreTitle) {
      homeStoreTitle.textContent = config.homeStoreTitle;
    }

    if (homeStoreDescription) {
      homeStoreDescription.textContent = config.homeStoreDescription;
    }

    if (homeStoreButtonText) {
      homeStoreButtonText.textContent = config.homeStoreButtonText;
    }
  }

  /* =========================================================
     BUSCAR CONFIGURAÇÕES DA LOJA NO SUPABASE
  ========================================================= */

  async function loadStoreSettings() {
    const client = createPublicSupabaseClient();

    if (!client) {
      applyStoreSettings(storeDefaults);

      return;
    }

    try {
      const { data, error } = await client
        .from("site_settings")
        .select(
          `
            menu_store_label,
            home_store_eyebrow,
            home_store_title,
            home_store_description,
            home_store_button_text
          `,
        )
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Erro ao carregar configurações da Loja:", error);

        applyStoreSettings(storeDefaults);

        return;
      }

      if (!data) {
        applyStoreSettings(storeDefaults);

        return;
      }

      applyStoreSettings({
        menuStoreLabel: data.menu_store_label || storeDefaults.menuStoreLabel,

        homeStoreEyebrow:
          data.home_store_eyebrow || storeDefaults.homeStoreEyebrow,

        homeStoreTitle: data.home_store_title || storeDefaults.homeStoreTitle,

        homeStoreDescription:
          data.home_store_description || storeDefaults.homeStoreDescription,

        homeStoreButtonText:
          data.home_store_button_text || storeDefaults.homeStoreButtonText,
      });
    } catch (error) {
      console.error(
        "Erro inesperado ao carregar configurações da Loja:",
        error,
      );

      applyStoreSettings(storeDefaults);
    }
  }

  /* =========================================================
     APLICAR CONFIGURAÇÕES ANTIGAS
  ========================================================= */

  function applySettings() {
    applyTheme();

    applyTextContent();

    applyLinks();

    applyLogo();

    applyDocumentTitle();

    applyAccessibility();
  }

  /* =========================================================
     API GLOBAL
  ========================================================= */

  window.QT_SITE = {
    settings,
    digits,
    formatPhone,
    whatsappNumber,
    whatsappUrl,
    applySettings,
    loadStoreSettings,
  };

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  async function init() {
    applySettings();

    await loadStoreSettings();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true,
    });
  } else {
    init();
  }

  /* =========================================================
     ALTERAÇÕES LOCAIS ENTRE ABAS
  ========================================================= */

  window.addEventListener("storage", (event) => {
    if (event.key === SETTINGS_KEY) {
      applySettings();
    }
  });
})();
