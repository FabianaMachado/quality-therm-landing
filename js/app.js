(() => {
  "use strict";

  const cfg = window.QT_CONFIG || {};

  const $ = (selector, context = document) => context.querySelector(selector);

  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];

  /* =========================================================
     IDIOMA
  ========================================================= */

  function getLanguage() {
    return window.QT_I18N?.getLanguage?.() || "pt-BR";
  }

  function tr(key, variables = {}) {
    if (!window.QT_I18N?.t) {
      return key;
    }

    return window.QT_I18N.t(key, getLanguage(), variables);
  }

  /* =========================================================
     RASTREAMENTO
  ========================================================= */

  function pushEvent(event, params = {}) {
    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      event,
      ...params,
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", event, params);
    }
  }

  /* =========================================================
     ATRIBUIÇÃO / UTM / GOOGLE ADS / META
  ========================================================= */

  function getAttribution() {
    const qs = new URLSearchParams(window.location.search);

    const fresh = {
      utm_source: qs.get("utm_source") || "",
      utm_medium: qs.get("utm_medium") || "",
      utm_campaign: qs.get("utm_campaign") || "",
      utm_content: qs.get("utm_content") || "",
      utm_term: qs.get("utm_term") || "",
      gclid: qs.get("gclid") || "",
      fbclid: qs.get("fbclid") || "",
      landing_page: window.location.pathname,
      referrer: document.referrer || "direct",
    };

    try {
      const hasCampaign =
        Object.entries(fresh).some(
          ([key, value]) => key.startsWith("utm_") && Boolean(value),
        ) ||
        Boolean(fresh.gclid) ||
        Boolean(fresh.fbclid);

      /*
       * localStorage é utilizado somente para atribuição
       * temporária de marketing.
       *
       * Produtos, clientes, avaliações e demais dados
       * persistentes continuam no Supabase.
       */

      if (!localStorage.getItem("qt_first_touch")) {
        localStorage.setItem("qt_first_touch", JSON.stringify(fresh));
      }

      if (hasCampaign || !localStorage.getItem("qt_last_touch")) {
        localStorage.setItem("qt_last_touch", JSON.stringify(fresh));
      }

      return JSON.parse(localStorage.getItem("qt_last_touch")) || fresh;
    } catch (error) {
      return fresh;
    }
  }

  const attribution = getAttribution();

  pushEvent("page_context", attribution);

  /* =========================================================
     WHATSAPP
  ========================================================= */

  function waUrl(message) {
    const phone = cfg.whatsapp || "5511985673883";

    return (
      "https://api.whatsapp.com/send" +
      `?phone=${encodeURIComponent(phone)}` +
      `&text=${encodeURIComponent(message)}`
    );
  }

  const generalMessageKeys = {
    geral: "dynamic.whatsapp.general",
    header: "dynamic.whatsapp.general",
    catalogo: "dynamic.whatsapp.catalog",
    compra: "dynamic.whatsapp.purchase",
    final: "dynamic.whatsapp.final",
  };

  function getGeneralMessage(intent) {
    const key = generalMessageKeys[intent] || generalMessageKeys.geral;

    return tr(key);
  }

  function updateGeneralWhatsAppLinks() {
    $$(".js-whatsapp").forEach((element) => {
      const intent = element.dataset.intent || "geral";

      element.href = waUrl(getGeneralMessage(intent));

      element.target = "_blank";
      element.rel = "noopener";
    });
  }

  updateGeneralWhatsAppLinks();

  /*
   * Se o idioma mudar enquanto a página estiver
   * aberta, os links do WhatsApp são atualizados.
   */

  document.addEventListener("qt:languagechange", () => {
    updateGeneralWhatsAppLinks();
  });

  /* =========================================================
     BOTÕES GERAIS DO WHATSAPP
  ========================================================= */

  $$(".js-whatsapp").forEach((element) => {
    element.addEventListener("click", () => {
      const intent = element.dataset.intent || "geral";

      pushEvent("whatsapp_click", {
        intent,
        ...attribution,
      });

      pushEvent("generate_lead", {
        lead_source: "whatsapp",
        lead_type: intent,
        currency: "BRL",
        value: 1,
        ...attribution,
      });
    });
  });

  /* =========================================================
     FUNÇÕES COMUNS DOS MODAIS
  ========================================================= */

  function openModal(modal, form, eventName, leadType) {
    if (!modal) {
      return;
    }

    modal.hidden = false;

    document.body.classList.add("modal-open");

    pushEvent(eventName, {
      lead_type: leadType,
      ...attribution,
    });

    setTimeout(() => {
      form?.querySelector('[name="name"]')?.focus();
    }, 50);
  }

  function closeModal(modal) {
    if (!modal) {
      return;
    }

    modal.hidden = true;

    const hasOpenModal = [
      ...document.querySelectorAll(".assistance-modal"),
    ].some((item) => !item.hidden);

    if (!hasOpenModal) {
      document.body.classList.remove("modal-open");
    }
  }

  /* =========================================================
     CEP
  ========================================================= */

  function formatCep(value) {
    const numbers = String(value || "")
      .replace(/\D/g, "")
      .slice(0, 8);

    if (numbers.length <= 5) {
      return numbers;
    }

    return numbers.slice(0, 5) + "-" + numbers.slice(5);
  }

  function isValidCep(cep) {
    return /^\d{5}-\d{3}$/.test(cep);
  }

  function bindCepMask(input) {
    input?.addEventListener("input", (event) => {
      event.target.value = formatCep(event.target.value);
    });
  }

  async function getAddressByCep(cep) {
    const cleanCep = String(cep || "").replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      return null;
    }

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.erro) {
        return null;
      }

      return {
        cep: data.cep || cep,
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      };
    } catch (error) {
      console.error("Erro ao consultar CEP:", error);
      return null;
    }
  }

  async function saveAssistanceLead(payload) {
    const supabaseUrl = window.QT_SUPABASE_CONFIG?.url || "";

    const supabaseAnonKey = window.QT_SUPABASE_CONFIG?.publishableKey || "";

    if (!supabaseUrl) {
      throw new Error("URL do Supabase não configurada.");
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/create-lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(supabaseAnonKey
          ? {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            }
          : {}),
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Não foi possível registrar o atendimento.",
      );
    }

    return result;
  }

  function validateRequired(values) {
    const missing = values.some((value) => !String(value || "").trim());

    if (missing) {
      alert(tr("dynamic.validation.required"));

      return false;
    }

    return true;
  }

  function validateCep(cep, input) {
    if (!isValidCep(cep)) {
      alert(tr("dynamic.validation.invalidCep"));

      input?.focus();

      return false;
    }

    return true;
  }

  /* =========================================================
     ASSISTÊNCIA TÉCNICA
  ========================================================= */

  const assistanceModal = $("#assistanceModal");

  const assistanceForm = $("#assistanceForm");

  const assistanceCep = $("#assistanceCep");

  const assistanceAddressResult = $("#assistanceAddressResult");
  const assistanceAddressText = $("#assistanceAddressText");
  const assistanceAddressFields = $("#assistanceAddressFields");
  const assistanceAddressNumber = $("#assistanceAddressNumber");
  const assistanceAddressComplement = $("#assistanceAddressComplement");
  const assistancePhone = $("#assistancePhone");

  function formatPhone(value) {
    const numbers = String(value || "")
      .replace(/\D/g, "")
      .slice(0, 11);

    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  assistancePhone?.addEventListener("input", (event) => {
    event.target.value = formatPhone(event.target.value);
  });

  $$(".js-open-assistance").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      openModal(
        assistanceModal,
        assistanceForm,
        "assistance_form_open",
        "assistencia",
      );
    });
  });

  $$(".js-close-assistance").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(assistanceModal);
    });
  });

  bindCepMask(assistanceCep);

  let assistanceAddress = null;

  assistanceCep?.addEventListener("blur", async () => {
    const cep = assistanceCep.value.trim();

    if (!isValidCep(cep)) {
      assistanceAddress = null;
      return;
    }

    const address = await getAddressByCep(cep);

    if (!address) {
      assistanceAddress = null;
      alert("Não foi possível localizar esse CEP.");
      assistanceCep.focus();
      return;
    }

    assistanceAddress = address;

    if (assistanceAddressResult && assistanceAddressText) {
      assistanceAddressText.textContent = `${address.street} — ${address.neighborhood} — ${address.city}/${address.state}`;

      assistanceAddressResult.hidden = false;
    }

    if (assistanceAddressFields) {
      assistanceAddressFields.hidden = false;
    }

    assistanceAddressNumber?.focus();

    console.log("Endereço localizado:", assistanceAddress);
  });

  assistanceForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") || "").trim();

    const phone = String(data.get("phone") || "").trim();

    const brand = String(data.get("brand") || "").trim();

    const model = String(data.get("model") || "").trim();

    const problem = String(data.get("problem") || "").trim();

    const cep = String(data.get("cep") || "").trim();

    const addressNumber = String(data.get("addressNumber") || "").trim();

    const addressComplement = String(
      data.get("addressComplement") || "",
    ).trim();

    if (!validateRequired([name, phone, brand, problem, cep, addressNumber])) {
      return;
    }

    if (!validateCep(cep, assistanceCep)) {
      return;
    }

    const modelText = model || "Não informado";
    const complementText = addressComplement || "Não informado";

    const street = assistanceAddress?.street || "";
    const neighborhood = assistanceAddress?.neighborhood || "";
    const city = assistanceAddress?.city || "";
    const state = assistanceAddress?.state || "";

    try {
      await saveAssistanceLead({
        lead_type: assistanceForm?.dataset.leadType || "assistencia",
        intent: assistanceForm?.dataset.intent || "manutencao",

        form_opened: true,
        form_started: true,
        form_completed: true,

        name,
        phone,
        brand,
        model,
        problem,
        cep,

        street,
        address_number: addressNumber,
        address_complement: addressComplement,
        neighborhood,
        city,
        state,

        source: "site",
        page_url: window.location.href,

        utm_source: attribution.utm_source || "",
        utm_medium: attribution.utm_medium || "",
        utm_campaign: attribution.utm_campaign || "",
        utm_term: attribution.utm_term || "",
        utm_content: attribution.utm_content || "",
        gclid: attribution.gclid || "",
      });
    } catch (error) {
      console.error("Erro ao registrar lead:", error);

      alert(
        "Não foi possível registrar sua solicitação. Tente novamente em alguns instantes.",
      );

      return;
    }

    const message =
      `Olá! Vim pelo site da Quality Therm e gostaria de solicitar assistência técnica.\n\n` +
      `Nome: ${name}\n` +
      `Telefone / WhatsApp: ${phone}\n` +
      `Marca: ${brand}\n` +
      `Modelo: ${modelText}\n` +
      `Problema informado: ${problem}\n\n` +
      `CEP: ${cep}\n` +
      `Endereço: ${street}, ${addressNumber}\n` +
      `Bairro: ${neighborhood}\n` +
      `Cidade: ${city}/${state}\n` +
      `Complemento: ${complementText}\n\n` +
      `Gostaria de verificar a disponibilidade para atendimento.`;

    pushEvent("assistance_form_complete", {
      lead_type: "assistencia",
      heater_brand: brand,
      model_provided: Boolean(model),
      cep_provided: true,
      ...attribution,
    });

    pushEvent("generate_lead", {
      lead_source: "whatsapp",
      lead_type: "assistencia",
      heater_brand: brand,
      currency: "BRL",
      value: 1,
      ...attribution,
    });

    pushEvent("whatsapp_click", {
      intent: "assistencia",
      ...attribution,
    });

    window.open(waUrl(message), "_blank", "noopener");

    closeModal(assistanceModal);
  });

  /* =========================================================
   MANUTENÇÃO PREVENTIVA
========================================================= */

  const maintenanceModal = $("#maintenanceModal");
  const maintenanceForm = $("#maintenanceForm");
  const maintenanceCep = $("#maintenanceCep");
  const maintenancePhone = $("#maintenancePhone");

  const maintenanceAddressResult = $("#maintenanceAddressResult");
  const maintenanceAddressText = $("#maintenanceAddressText");
  const maintenanceAddressFields = $("#maintenanceAddressFields");
  const maintenanceAddressNumber = $("#maintenanceAddressNumber");
  const maintenanceAddressComplement = $("#maintenanceAddressComplement");

  let maintenanceAddress = null;

  /* ABRIR MODAL */

  $$(".js-open-maintenance").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      openModal(
        maintenanceModal,
        maintenanceForm,
        "maintenance_form_open",
        "manutencao_preventiva",
      );
    });
  });

  /* FECHAR MODAL */

  $$(".js-close-maintenance").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(maintenanceModal);
    });
  });

  /* MÁSCARAS */

  bindCepMask(maintenanceCep);

  maintenancePhone?.addEventListener("input", (event) => {
    event.target.value = formatPhone(event.target.value);
  });

  /* BUSCAR ENDEREÇO PELO CEP */

  maintenanceCep?.addEventListener("blur", async () => {
    const cep = maintenanceCep.value.trim();

    if (!isValidCep(cep)) {
      maintenanceAddress = null;
      return;
    }

    const address = await getAddressByCep(cep);

    if (!address) {
      maintenanceAddress = null;

      alert("Não foi possível localizar esse CEP.");

      maintenanceCep.focus();

      return;
    }

    maintenanceAddress = address;

    if (maintenanceAddressResult && maintenanceAddressText) {
      maintenanceAddressText.textContent = `${address.street} — ${address.neighborhood} — ${address.city}/${address.state}`;

      maintenanceAddressResult.hidden = false;
    }

    if (maintenanceAddressFields) {
      maintenanceAddressFields.hidden = false;
    }

    maintenanceAddressNumber?.focus();
  });

  /* ENVIAR MANUTENÇÃO */

  maintenanceForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const brand = String(data.get("brand") || "").trim();
    const model = String(data.get("model") || "").trim();

    const lastMaintenance = String(data.get("lastMaintenance") || "").trim();

    const cep = String(data.get("cep") || "").trim();

    const addressNumber = String(data.get("addressNumber") || "").trim();

    const addressComplement = String(
      data.get("addressComplement") || "",
    ).trim();

    /* CAMPOS OBRIGATÓRIOS */

    if (
      !validateRequired([
        name,
        phone,
        brand,
        lastMaintenance,
        cep,
        addressNumber,
      ])
    ) {
      return;
    }

    if (!validateCep(cep, maintenanceCep)) {
      return;
    }

    const modelText = model || "Não informado";

    const complementText = addressComplement || "Não informado";

    const street = maintenanceAddress?.street || "";

    const neighborhood = maintenanceAddress?.neighborhood || "";

    const city = maintenanceAddress?.city || "";

    const state = maintenanceAddress?.state || "";

    /* SALVAR LEAD NO CRM */

    try {
      await saveAssistanceLead({
        lead_type: maintenanceForm?.dataset.leadType || "manutencao_preventiva",

        intent: maintenanceForm?.dataset.intent || "manutencao",

        form_opened: true,
        form_started: true,
        form_completed: true,

        name,
        phone,
        brand,
        model,

        problem: `Manutenção preventiva — última manutenção: ${lastMaintenance}`,

        cep,

        street,
        address_number: addressNumber,
        address_complement: addressComplement,
        neighborhood,
        city,
        state,

        source: "site",

        page_url: window.location.href,

        utm_source: attribution.utm_source || "",

        utm_medium: attribution.utm_medium || "",

        utm_campaign: attribution.utm_campaign || "",

        utm_term: attribution.utm_term || "",

        utm_content: attribution.utm_content || "",

        gclid: attribution.gclid || "",
      });
    } catch (error) {
      console.error("Erro ao registrar lead de manutenção:", error);

      alert(
        "Não foi possível registrar sua solicitação. Tente novamente em alguns instantes.",
      );

      return;
    }

    /* MENSAGEM DO WHATSAPP */

    const message =
      `Olá! Vim pelo site da Quality Therm e gostaria de solicitar manutenção preventiva.\n\n` +
      `Nome: ${name}\n` +
      `Telefone / WhatsApp: ${phone}\n` +
      `Marca: ${brand}\n` +
      `Modelo: ${modelText}\n` +
      `Última manutenção: ${lastMaintenance}\n\n` +
      `CEP: ${cep}\n` +
      `Endereço: ${street}, ${addressNumber}\n` +
      `Bairro: ${neighborhood}\n` +
      `Cidade: ${city}/${state}\n` +
      `Complemento: ${complementText}\n\n` +
      `Gostaria de verificar a disponibilidade para manutenção preventiva.`;

    /* RASTREAMENTO */

    pushEvent("maintenance_form_complete", {
      lead_type: "manutencao_preventiva",

      heater_brand: brand,

      last_maintenance: lastMaintenance,

      ...attribution,
    });

    pushEvent("generate_lead", {
      lead_source: "whatsapp",

      lead_type: "manutencao_preventiva",

      heater_brand: brand,

      currency: "BRL",

      value: 1,

      ...attribution,
    });

    pushEvent("whatsapp_click", {
      intent: "manutencao_preventiva",

      ...attribution,
    });

    window.open(waUrl(message), "_blank", "noopener");

    closeModal(maintenanceModal);
  });

  /* =========================================================
   INSTALAÇÃO / SUBSTITUIÇÃO
========================================================= */

  const installationModal = $("#installationModal");

  const installationForm = $("#installationForm");

  const installationCep = $("#installationCep");

  const installationPhone = $("#installationPhone");

  const installationAddressResult = $("#installationAddressResult");

  const installationAddressText = $("#installationAddressText");

  const installationAddressFields = $("#installationAddressFields");

  const installationAddressNumber = $("#installationAddressNumber");

  const installationAddressComplement = $("#installationAddressComplement");

  let installationAddress = null;

  /* ABRIR MODAL */

  $$(".js-open-installation").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      openModal(
        installationModal,
        installationForm,
        "installation_form_open",
        "instalacao",
      );
    });
  });

  /* FECHAR MODAL */

  $$(".js-close-installation").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(installationModal);
    });
  });

  /* MÁSCARAS */

  bindCepMask(installationCep);

  installationPhone?.addEventListener("input", (event) => {
    event.target.value = formatPhone(event.target.value);
  });

  /* BUSCAR ENDEREÇO */

  installationCep?.addEventListener("blur", async () => {
    const cep = installationCep.value.trim();

    if (!isValidCep(cep)) {
      installationAddress = null;
      return;
    }

    const address = await getAddressByCep(cep);

    if (!address) {
      installationAddress = null;

      alert("Não foi possível localizar esse CEP.");

      installationCep.focus();

      return;
    }

    installationAddress = address;

    if (installationAddressResult && installationAddressText) {
      installationAddressText.textContent = `${address.street} — ${address.neighborhood} — ${address.city}/${address.state}`;

      installationAddressResult.hidden = false;
    }

    if (installationAddressFields) {
      installationAddressFields.hidden = false;
    }

    installationAddressNumber?.focus();
  });

  /* ENVIAR INSTALAÇÃO */

  installationForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") || "").trim();

    const phone = String(data.get("phone") || "").trim();

    const installationType = String(data.get("installationType") || "").trim();

    const brand = String(data.get("brand") || "").trim();

    const model = String(data.get("model") || "").trim();

    const gas = String(data.get("gas") || "").trim();

    const cep = String(data.get("cep") || "").trim();

    const notes = String(data.get("notes") || "").trim();

    const addressNumber = String(data.get("addressNumber") || "").trim();

    const addressComplement = String(
      data.get("addressComplement") || "",
    ).trim();

    if (
      !validateRequired([
        name,
        phone,
        installationType,
        gas,
        cep,
        addressNumber,
      ])
    ) {
      return;
    }

    if (!validateCep(cep, installationCep)) {
      return;
    }

    const brandText = brand || "Não informado";

    const modelText = model || "Não informado";

    const notesText = notes || "Não informado";

    const complementText = addressComplement || "Não informado";

    const street = installationAddress?.street || "";

    const neighborhood = installationAddress?.neighborhood || "";

    const city = installationAddress?.city || "";

    const state = installationAddress?.state || "";

    /* SALVAR NO CRM */

    try {
      await saveAssistanceLead({
        lead_type: installationForm?.dataset.leadType || "instalacao",

        intent: installationForm?.dataset.intent || "instalacao",

        form_opened: true,
        form_started: true,
        form_completed: true,

        name,
        phone,

        brand: brandText,

        model: modelText,

        problem: `${installationType} — Gás: ${gas}${
          notes ? ` — ${notes}` : ""
        }`,

        cep,

        street,

        address_number: addressNumber,

        address_complement: addressComplement,

        neighborhood,
        city,
        state,

        source: "site",

        page_url: window.location.href,

        utm_source: attribution.utm_source || "",

        utm_medium: attribution.utm_medium || "",

        utm_campaign: attribution.utm_campaign || "",

        utm_term: attribution.utm_term || "",

        utm_content: attribution.utm_content || "",

        gclid: attribution.gclid || "",
      });
    } catch (error) {
      console.error("Erro ao registrar lead de instalação:", error);

      alert(
        "Não foi possível registrar sua solicitação. Tente novamente em alguns instantes.",
      );

      return;
    }

    /* WHATSAPP */

    const message =
      `Olá! Vim pelo site da Quality Therm e gostaria de solicitar orçamento para instalação/substituição.\n\n` +
      `Nome: ${name}\n` +
      `Telefone / WhatsApp: ${phone}\n` +
      `Serviço: ${installationType}\n` +
      `Marca: ${brandText}\n` +
      `Modelo: ${modelText}\n` +
      `Tipo de gás: ${gas}\n\n` +
      `CEP: ${cep}\n` +
      `Endereço: ${street}, ${addressNumber}\n` +
      `Bairro: ${neighborhood}\n` +
      `Cidade: ${city}/${state}\n` +
      `Complemento: ${complementText}\n` +
      `Observações: ${notesText}\n\n` +
      `Gostaria de verificar a disponibilidade e o orçamento.`;

    pushEvent("installation_form_complete", {
      lead_type: "instalacao",

      installation_type: installationType,

      heater_brand: brandText,

      gas_type: gas,

      ...attribution,
    });

    pushEvent("generate_lead", {
      lead_source: "whatsapp",

      lead_type: "instalacao",

      installation_type: installationType,

      currency: "BRL",

      value: 1,

      ...attribution,
    });

    pushEvent("whatsapp_click", {
      intent: "instalacao",

      ...attribution,
    });

    window.open(waUrl(message), "_blank", "noopener");

    closeModal(installationModal);
  });

  /* =========================================================
   COMPRA / INTERESSE EM PRODUTO
========================================================= */

  const purchaseModal = $("#purchaseModal");

  const purchaseForm = $("#purchaseForm");

  const purchasePhone = $("#purchasePhone");

  const purchaseCep = $("#purchaseCep");

  const purchaseProductName = $("#purchaseProductName");

  const purchaseAddressResult = $("#purchaseAddressResult");

  const purchaseAddressText = $("#purchaseAddressText");

  const purchaseAddressFields = $("#purchaseAddressFields");

  const purchaseAddressNumber = $("#purchaseAddressNumber");

  const purchaseAddressComplement = $("#purchaseAddressComplement");

  let purchaseAddress = null;

  /* ABRIR MODAL DE COMPRA */

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".js-open-purchase");

    if (!button) {
      return;
    }

    event.preventDefault();

    const product = button.dataset.product || "Aquecedor";

    if (purchaseProductName) {
      purchaseProductName.value = product;
    }

    openModal(purchaseModal, purchaseForm, "purchase_form_open", "produto");
  });

  /* FECHAR */

  $$(".js-close-purchase").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(purchaseModal);
    });
  });

  /* TELEFONE */

  purchasePhone?.addEventListener("input", (event) => {
    event.target.value = formatPhone(event.target.value);
  });

  /* CEP */

  bindCepMask(purchaseCep);

  purchaseCep?.addEventListener("blur", async () => {
    const cep = purchaseCep.value.trim();

    if (!isValidCep(cep)) {
      purchaseAddress = null;
      return;
    }

    const address = await getAddressByCep(cep);

    if (!address) {
      purchaseAddress = null;

      alert("Não foi possível localizar esse CEP.");

      purchaseCep.focus();

      return;
    }

    purchaseAddress = address;

    if (purchaseAddressResult && purchaseAddressText) {
      purchaseAddressText.textContent = `${address.street} — ${address.neighborhood} — ${address.city}/${address.state}`;

      purchaseAddressResult.hidden = false;
    }

    if (purchaseAddressFields) {
      purchaseAddressFields.hidden = false;
    }

    purchaseAddressNumber?.focus();
  });

  /* ENVIAR COMPRA */

  purchaseForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") || "").trim();

    const phone = String(data.get("phone") || "").trim();

    const productName = String(data.get("productName") || "").trim();

    const cep = String(data.get("cep") || "").trim();

    const addressNumber = String(data.get("addressNumber") || "").trim();

    const addressComplement = String(
      data.get("addressComplement") || "",
    ).trim();

    if (!validateRequired([name, phone, productName, cep, addressNumber])) {
      return;
    }

    if (!validateCep(cep, purchaseCep)) {
      return;
    }

    const street = purchaseAddress?.street || "";

    const neighborhood = purchaseAddress?.neighborhood || "";

    const city = purchaseAddress?.city || "";

    const state = purchaseAddress?.state || "";

    const complementText = addressComplement || "Não informado";

    /* SALVAR LEAD */

    try {
      await saveAssistanceLead({
        lead_type: purchaseForm?.dataset.leadType || "produto",

        intent: purchaseForm?.dataset.intent || "compra",

        product_name: productName,

        form_opened: true,
        form_started: true,
        form_completed: true,

        name,
        phone,

        brand: "Não informado",

        model: productName,

        problem: `Interesse de compra: ${productName}`,

        cep,

        street,

        address_number: addressNumber,

        address_complement: addressComplement,

        neighborhood,
        city,
        state,

        source: "site",

        page_url: window.location.href,

        utm_source: attribution.utm_source || "",

        utm_medium: attribution.utm_medium || "",

        utm_campaign: attribution.utm_campaign || "",

        utm_term: attribution.utm_term || "",

        utm_content: attribution.utm_content || "",

        gclid: attribution.gclid || "",
      });
    } catch (error) {
      console.error("Erro ao registrar lead de compra:", error);

      alert(
        "Não foi possível registrar seu interesse. Tente novamente em alguns instantes.",
      );

      return;
    }

    /* WHATSAPP */

    const message =
      `Olá! Vim pelo site da Quality Therm e tenho interesse em comprar um produto.\n\n` +
      `Nome: ${name}\n` +
      `Telefone / WhatsApp: ${phone}\n` +
      `Produto de interesse: ${productName}\n\n` +
      `CEP: ${cep}\n` +
      `Endereço: ${street}, ${addressNumber}\n` +
      `Bairro: ${neighborhood}\n` +
      `Cidade: ${city}/${state}\n` +
      `Complemento: ${complementText}\n\n` +
      `Gostaria de consultar preço, disponibilidade e condições.`;

    pushEvent("purchase_form_complete", {
      lead_type: "produto",

      intent: "compra",

      item_name: productName,

      ...attribution,
    });

    pushEvent("generate_lead", {
      lead_source: "whatsapp",

      lead_type: "produto",

      item_name: productName,

      currency: "BRL",

      value: 1,

      ...attribution,
    });

    pushEvent("whatsapp_click", {
      intent: "compra",

      ...attribution,
    });

    window.open(waUrl(message), "_blank", "noopener");

    closeModal(purchaseModal);
  });

  /* =========================================================
   FECHAR MODAIS COM ESC
========================================================= */

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (assistanceModal && !assistanceModal.hidden) {
      closeModal(assistanceModal);
    }

    if (maintenanceModal && !maintenanceModal.hidden) {
      closeModal(maintenanceModal);
    }

    if (installationModal && !installationModal.hidden) {
      closeModal(installationModal);
    }

    if (purchaseModal && !purchaseModal.hidden) {
      closeModal(purchaseModal);
    }
  });
  /* =========================================================
     PRODUTOS ESTÁTICOS
  ========================================================= */

  $$(".js-product").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");

      const product = card?.dataset.product || "aquecedor";

      pushEvent("product_interest", {
        item_name: product,
        ...attribution,
      });

      pushEvent("generate_lead", {
        lead_source: "whatsapp",

        lead_type: "produto",

        item_name: product,

        currency: "BRL",

        value: 1,

        ...attribution,
      });

      const message = tr("dynamic.whatsapp.product", {
        product,
      });

      window.open(waUrl(message), "_blank", "noopener");
    });
  });

  /* =========================================================
     CONDOMÍNIOS
  ========================================================= */

  $$(".js-condo").forEach((button) => {
    button.addEventListener("click", () => {
      const profile = button.dataset.profile || "morador";

      pushEvent("condo_interest", {
        profile,
        ...attribution,
      });

      pushEvent("generate_lead", {
        lead_source: "whatsapp",

        lead_type: "condominio",

        profile,

        currency: "BRL",

        value: 1,

        ...attribution,
      });

      const message = tr("dynamic.whatsapp.condominium", {
        profile,
      });

      window.open(waUrl(message), "_blank", "noopener");
    });
  });

  /* =========================================================
     TELEFONE
  ========================================================= */

  $(".js-phone")?.addEventListener("click", () => {
    pushEvent("phone_click", {
      ...attribution,
    });
  });

  /* =========================================================
     CTAs / ROLAGEM
  ========================================================= */

  $$(".js-scroll-track").forEach((element) => {
    element.addEventListener("click", () => {
      pushEvent(element.dataset.event || "cta_click", {
        ...attribution,
      });
    });
  });

  /* =========================================================
     DIMENSIONADOR
  ========================================================= */

  $("#sizingForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    const data = new FormData(form);

    const showers = Number(data.get("showers"));

    const flow = Number(data.get("flow"));

    const gas = String(data.get("gas") || "");

    const demand = showers * flow;

    let band;

    if (demand <= 10) {
      band = "10 a 15 L/min";
    } else if (demand <= 21) {
      band = "20 a 24 L/min";
    } else if (demand <= 30) {
      band = "26 a 33 L/min";
    } else if (demand <= 38) {
      band = "33 a 36 L/min";
    } else {
      band = tr("dynamic.sizingResult.band40");
    }

    const result = $("#sizingResult");

    if (!result) {
      return;
    }

    result.hidden = false;

    /*
     * Em vez de montar HTML com textos
     * fixos em português, os elementos
     * são criados separadamente.
     */

    result.innerHTML = "";

    const small = document.createElement("small");

    small.textContent = tr("dynamic.sizingResult.estimate");

    const lineBreak = document.createElement("br");

    const strong = document.createElement("strong");

    strong.textContent = band;

    const paragraph = document.createElement("p");

    paragraph.textContent = tr("dynamic.sizingResult.disclaimer");

    const button = document.createElement("button");

    button.type = "button";

    button.className = "btn btn-primary";

    button.id = "sendSizing";

    button.textContent = tr("dynamic.sizingResult.confirm");

    result.append(small, lineBreak, strong, paragraph, button);

    pushEvent("calculator_complete", {
      showers,

      flow_per_shower: flow,

      gas_type: gas,

      estimated_band: band,

      ...attribution,
    });

    button.addEventListener("click", () => {
      pushEvent("generate_lead", {
        lead_source: "whatsapp",

        lead_type: "dimensionador",

        estimated_band: band,

        currency: "BRL",

        value: 1,

        ...attribution,
      });

      pushEvent("whatsapp_click", {
        intent: "dimensionador",

        ...attribution,
      });

      const message = tr("dynamic.whatsapp.sizing", {
        showers,
        flow,
        gas,
        band,
      });

      window.open(waUrl(message), "_blank", "noopener");
    });
  });

  /* =========================================================
     MENU MOBILE
  ========================================================= */

  const menuBtn = $(".menu-toggle");

  const nav = $(".nav");

  menuBtn?.addEventListener("click", () => {
    if (!nav) {
      return;
    }

    const open = nav.classList.toggle("open");

    menuBtn.setAttribute("aria-expanded", String(open));
  });

  $$(".nav a").forEach((link) => {
    link.addEventListener("click", () => {
      nav?.classList.remove("open");

      menuBtn?.setAttribute("aria-expanded", "false");
    });
  });

  /* =========================================================
     ANO AUTOMÁTICO
  ========================================================= */

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* =========================================================
     VOLTAR AO TOPO
  ========================================================= */

  const backToTop = $("#backToTop");

  backToTop?.addEventListener("click", (event) => {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
})();
