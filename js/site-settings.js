(() => {
  "use strict";

  /* =========================================================
     CONFIGURAÇÕES PADRÃO
  ========================================================= */

  const defaults = {
    companyName: "Quality Therm Aquecedores",
    companyShortName: "Quality Therm",

    companyWhatsapp: "11985673883",
    companyPhone: "11976993640",
    companyEmail: "vendasqualitythermaquecedores@gmail.com",

    companyLogo: "",

    companyCnpj: "",

    addressStreet: "",
    addressNumber: "",
    addressComplement: "",
    addressNeighborhood: "",
    addressCity: "",
    addressState: "",
    addressZipCode: "",

    showCnpj: false,
    showAddress: false,

    googleReviewUrl: "",
    instagramUrl: "",
    facebookUrl: "",

    primaryColor: "#d97d2b",
    darkColor: "#0e171d",

    whatsappButtonText: "WhatsApp",

    menuStoreLabel: "Loja",

    homeStoreEyebrow: "Loja",
    homeStoreTitle: "Produtos em destaque",

    homeStoreDescription:
      "Equipamentos, acessórios e produtos selecionados para facilitar sua escolha. Consulte disponibilidade, instalação e condições diretamente com nossa equipe.",

    homeStoreButtonText: "Ver todos os produtos",

    siteLanguage: "pt-BR",
  };

  /* =========================================================
     ESTADO
  ========================================================= */

  let currentSettings = {
    ...defaults,
  };

  /* =========================================================
     CONFIGURAÇÕES ATUAIS
  ========================================================= */

  function settings() {
    return {
      ...currentSettings,
    };
  }

  /* =========================================================
     SUPABASE
  ========================================================= */

  function getSupabaseClient() {
    if (
      window.supabaseClient &&
      typeof window.supabaseClient.from === "function"
    ) {
      return window.supabaseClient;
    }

    if (typeof window.initQualityThermSupabase === "function") {
      return window.initQualityThermSupabase();
    }

    const config = window.QT_SUPABASE_CONFIG;

    if (
      !config ||
      !config.url ||
      !config.publishableKey ||
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      console.warn("Supabase não configurado. Usando configurações padrão.");

      return null;
    }

    window.supabaseClient = window.supabase.createClient(
      config.url,
      config.publishableKey,
    );

    return window.supabaseClient;
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
     FORMATAR CNPJ
  ========================================================= */

  function formatCnpj(value) {
    const number = digits(value);

    if (number.length !== 14) {
      return String(value || "");
    }

    return (
      `${number.slice(0, 2)}.` +
      `${number.slice(2, 5)}.` +
      `${number.slice(5, 8)}/` +
      `${number.slice(8, 12)}-` +
      `${number.slice(12)}`
    );
  }

  /* =========================================================
     FORMATAR CEP
  ========================================================= */

  function formatZipCode(value) {
    const number = digits(value);

    if (number.length !== 8) {
      return String(value || "");
    }

    return `${number.slice(0, 5)}-${number.slice(5)}`;
  }

  /* =========================================================
     ENDEREÇO COMPLETO
  ========================================================= */

  function getFullAddress() {
    const cfg = settings();

    const streetLine = [cfg.addressStreet, cfg.addressNumber]
      .filter(Boolean)
      .join(", ");

    const parts = [];

    if (streetLine) {
      parts.push(streetLine);
    }

    if (cfg.addressComplement) {
      parts.push(cfg.addressComplement);
    }

    if (cfg.addressNeighborhood) {
      parts.push(cfg.addressNeighborhood);
    }

    const cityState = [cfg.addressCity, cfg.addressState]
      .filter(Boolean)
      .join(" - ");

    if (cityState) {
      parts.push(cityState);
    }

    if (cfg.addressZipCode) {
      parts.push(`CEP ${formatZipCode(cfg.addressZipCode)}`);
    }

    return parts.join(" • ");
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
     CNPJ
  ========================================================= */

  function applyCnpj() {
    const cfg = settings();

    const wrappers = document.querySelectorAll("[data-company-cnpj-wrap]");

    const elements = document.querySelectorAll("[data-company-cnpj]");

    const visible =
      cfg.showCnpj === true && Boolean(String(cfg.companyCnpj || "").trim());

    wrappers.forEach((element) => {
      element.hidden = !visible;
    });

    elements.forEach((element) => {
      element.textContent = visible ? formatCnpj(cfg.companyCnpj) : "";
    });
  }

  /* =========================================================
     ENDEREÇO
  ========================================================= */

  function applyAddress() {
    const cfg = settings();

    const wrappers = document.querySelectorAll("[data-company-address-wrap]");

    const elements = document.querySelectorAll("[data-company-address]");

    const address = getFullAddress();

    const visible = cfg.showAddress === true && Boolean(address);

    wrappers.forEach((element) => {
      element.hidden = !visible;
    });

    elements.forEach((element) => {
      element.textContent = visible ? address : "";
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

          element.hidden = true;
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

          element.hidden = true;
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
     LOJA
  ========================================================= */

  function applyStoreSettings() {
    const cfg = settings();

    const language =
      window.QT_I18N?.normalizeLanguage(cfg.siteLanguage || "pt-BR") || "pt-BR";

    const storeTranslations = {
      "pt-BR": {
        menuStoreLabel: cfg.menuStoreLabel || defaults.menuStoreLabel,
        homeStoreEyebrow: cfg.homeStoreEyebrow || defaults.homeStoreEyebrow,
        homeStoreTitle: cfg.homeStoreTitle || defaults.homeStoreTitle,
        homeStoreDescription:
          cfg.homeStoreDescription || defaults.homeStoreDescription,
        homeStoreButtonText:
          cfg.homeStoreButtonText || defaults.homeStoreButtonText,
      },

      en: {
        menuStoreLabel: "Store",
        homeStoreEyebrow: "Store",
        homeStoreTitle: "Featured products",
        homeStoreDescription:
          "Equipment, accessories and selected products to make your choice easier. Check availability, installation and purchasing conditions directly with our team.",
        homeStoreButtonText: "View all products",
      },

      es: {
        menuStoreLabel: "Tienda",
        homeStoreEyebrow: "Tienda",
        homeStoreTitle: "Productos destacados",
        homeStoreDescription:
          "Equipos, accesorios y productos seleccionados para facilitar tu elección. Consulta disponibilidad, instalación y condiciones de compra directamente con nuestro equipo.",
        homeStoreButtonText: "Ver todos los productos",
      },
    };

    const text = storeTranslations[language] || storeTranslations["pt-BR"];

    const menuStoreLink = document.getElementById("menuStoreLink");
    const homeStoreEyebrow = document.getElementById("homeStoreEyebrow");
    const homeStoreTitle = document.getElementById("homeStoreTitle");

    const homeStoreDescription = document.getElementById(
      "homeStoreDescription",
    );

    const homeStoreButtonText = document.getElementById("homeStoreButtonText");

    if (menuStoreLink) {
      menuStoreLink.textContent = text.menuStoreLabel;
    }

    if (homeStoreEyebrow) {
      homeStoreEyebrow.textContent = text.homeStoreEyebrow;
    }

    if (homeStoreTitle) {
      homeStoreTitle.textContent = text.homeStoreTitle;
    }

    if (homeStoreDescription) {
      homeStoreDescription.textContent = text.homeStoreDescription;
    }

    if (homeStoreButtonText) {
      homeStoreButtonText.textContent = text.homeStoreButtonText;
    }
  }

  /* =========================================================
     IDIOMA / SISTEMA MULTILÍNGUE
  ========================================================= */

  function applyLanguage() {
    const cfg = settings();

    const language =
      window.QT_I18N?.normalizeLanguage(cfg.siteLanguage || "pt-BR") || "pt-BR";

    document.documentElement.lang = language;

    if (window.QT_I18N && typeof window.QT_I18N.setLanguage === "function") {
      window.QT_I18N.setLanguage(language);
    }
  }

  /* =========================================================
     APLICAR TODAS AS CONFIGURAÇÕES
  ========================================================= */

  function applySettings() {
    applyTheme();

    applyTextContent();

    applyCnpj();

    applyAddress();

    applyLinks();

    applyLogo();

    // Primeiro define o idioma oficial do site.
    applyLanguage();

    // Depois aplica os textos configuráveis da loja.
    applyStoreSettings();

    applyDocumentTitle();

    applyAccessibility();

    // Por último, reaplica a tradução sobre os elementos da página.
    if (window.QT_I18N && typeof window.QT_I18N.translate === "function") {
      window.QT_I18N.translate(document);
    }
  }

  /* =========================================================
     BUSCAR CONFIGURAÇÕES NO SUPABASE
  ========================================================= */

  async function loadSettings() {
    const client = getSupabaseClient();

    if (!client) {
      currentSettings = {
        ...defaults,
      };

      applySettings();

      return currentSettings;
    }

    try {
      const { data, error } = await client
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        currentSettings = {
          ...defaults,
        };

        applySettings();

        return currentSettings;
      }

      currentSettings = {
        ...defaults,

        companyName: data.company_name || defaults.companyName,

        companyShortName: data.company_short_name || defaults.companyShortName,

        companyWhatsapp: data.whatsapp ?? "",

        companyPhone: data.phone ?? "",

        companyEmail: data.email ?? "",

        companyLogo: data.logo_url ?? "",

        companyCnpj: data.cnpj ?? "",

        addressStreet: data.address_street ?? "",

        addressNumber: data.address_number ?? "",

        addressComplement: data.address_complement ?? "",

        addressNeighborhood: data.address_neighborhood ?? "",

        addressCity: data.address_city ?? "",

        addressState: data.address_state ?? "",

        addressZipCode: data.address_zip_code ?? "",

        showCnpj: data.show_cnpj === true,

        showAddress: data.show_address === true,

        googleReviewUrl: data.google_review_url ?? "",

        instagramUrl: data.instagram_url ?? "",

        facebookUrl: data.facebook_url ?? "",

        primaryColor: data.primary_color || defaults.primaryColor,

        darkColor: data.dark_color || defaults.darkColor,

        whatsappButtonText:
          data.whatsapp_button_text || defaults.whatsappButtonText,

        menuStoreLabel: data.menu_store_label || defaults.menuStoreLabel,

        homeStoreEyebrow: data.home_store_eyebrow || defaults.homeStoreEyebrow,

        homeStoreTitle: data.home_store_title || defaults.homeStoreTitle,

        homeStoreDescription:
          data.home_store_description || defaults.homeStoreDescription,

        homeStoreButtonText:
          data.home_store_button_text || defaults.homeStoreButtonText,

        siteLanguage: data.site_language || defaults.siteLanguage,
      };

      applySettings();

      return currentSettings;
    } catch (error) {
      console.error("Erro ao carregar configurações do site:", error);

      currentSettings = {
        ...defaults,
      };

      applySettings();

      return currentSettings;
    }
  }

  /* =========================================================
     COMPATIBILIDADE

     Mantemos loadStoreSettings porque outras páginas podem
     chamar esta função.
  ========================================================= */

  async function loadStoreSettings() {
    return loadSettings();
  }

  /* =========================================================
     API GLOBAL
  ========================================================= */

  window.QT_SITE = {
    settings,

    digits,

    formatPhone,

    formatCnpj,

    formatZipCode,

    getFullAddress,

    whatsappNumber,

    whatsappUrl,

    applySettings,

    applyLanguage,

    translate: (...args) => window.QT_I18N?.t?.(...args),

    loadSettings,

    loadStoreSettings,
  };

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  async function init() {
    /*
    Primeiro aplicamos os valores padrão
    enquanto aguardamos o Supabase.
  */

    applySettings();

    /*
    Depois carregamos a configuração oficial
    salva no Supabase e reaplicamos tudo.
  */

    await loadSettings();

    /*
    Ativa o observador global de idioma.
    Assim, conteúdos inseridos depois pelo
    JavaScript ou Supabase também passam
    pelo sistema multilíngue.
  */

    if (window.QT_I18N && typeof window.QT_I18N.observe === "function") {
      window.QT_I18N.observe(document.body);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true,
    });
  } else {
    init();
  }
})();
