(() => {
  "use strict";

  const cfg = window.QT_CONFIG || {};
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];

  /* =========================================================
     RASTREAMENTO
  ========================================================= */

  function pushEvent(event, params = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });

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
      `https://api.whatsapp.com/send` +
      `?phone=${encodeURIComponent(phone)}` +
      `&text=${encodeURIComponent(message)}`
    );
  }

  const messages = {
    geral:
      "Olá! Vim pelo site da Quality Therm e gostaria de atendimento. Pode me ajudar?",

    header:
      "Olá! Vim pelo site da Quality Therm e gostaria de atendimento. Pode me ajudar?",

    catalogo:
      "Olá! Vim pelo site da Quality Therm e gostaria de conhecer os modelos de aquecedores disponíveis.",

    compra:
      "Olá! Vim pelo site da Quality Therm e gostaria de um orçamento para aquecedor. Preciso de orientação para escolher o modelo ideal.",

    final:
      "Olá! Vim pelo site da Quality Therm e gostaria de solicitar um orçamento.",
  };

  /* =========================================================
     BOTÕES GERAIS DO WHATSAPP
  ========================================================= */

  $$(".js-whatsapp").forEach((element) => {
    const intent = element.dataset.intent || "geral";
    const message = messages[intent] || messages.geral;

    element.href = waUrl(message);
    element.target = "_blank";
    element.rel = "noopener";

    element.addEventListener("click", () => {
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
    if (!modal) return;

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
    if (!modal) return;

    modal.hidden = true;

    const hasOpenModal = [
      ...document.querySelectorAll(".assistance-modal"),
    ].some((item) => !item.hidden);

    if (!hasOpenModal) {
      document.body.classList.remove("modal-open");
    }
  }

  function formatCep(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 8);

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

  /* =========================================================
     MODAL — ASSISTÊNCIA TÉCNICA
  ========================================================= */

  const assistanceModal = $("#assistanceModal");
  const assistanceForm = $("#assistanceForm");
  const assistanceCep = $("#assistanceCep");

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

  assistanceForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") || "").trim();
    const brand = String(data.get("brand") || "").trim();
    const model = String(data.get("model") || "").trim();
    const problem = String(data.get("problem") || "").trim();
    const cep = String(data.get("cep") || "").trim();

    if (!name || !brand || !problem || !cep) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    if (!isValidCep(cep)) {
      alert("Digite um CEP válido no formato 00000-000.");
      assistanceCep?.focus();
      return;
    }

    const modelText = model || "Não informado";

    const message = `Olá! Vim pelo site da Quality Therm e gostaria de solicitar assistência técnica.

Nome: ${name}
Marca: ${brand}
Modelo: ${modelText}
Problema informado: ${problem}
CEP: ${cep}

Gostaria de verificar a disponibilidade para atendimento.`;

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
     MODAL — MANUTENÇÃO PREVENTIVA
  ========================================================= */

  const maintenanceModal = $("#maintenanceModal");
  const maintenanceForm = $("#maintenanceForm");
  const maintenanceCep = $("#maintenanceCep");

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

  $$(".js-close-maintenance").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(maintenanceModal);
    });
  });

  bindCepMask(maintenanceCep);

  maintenanceForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") || "").trim();
    const brand = String(data.get("brand") || "").trim();
    const model = String(data.get("model") || "").trim();
    const lastMaintenance = String(data.get("lastMaintenance") || "").trim();
    const cep = String(data.get("cep") || "").trim();

    if (!name || !brand || !lastMaintenance || !cep) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    if (!isValidCep(cep)) {
      alert("Digite um CEP válido no formato 00000-000.");
      maintenanceCep?.focus();
      return;
    }

    const modelText = model || "Não informado";

    const message = `Olá! Vim pelo site da Quality Therm e gostaria de agendar uma manutenção preventiva.

Nome: ${name}
Marca: ${brand}
Modelo: ${modelText}
Última manutenção: ${lastMaintenance}
CEP: ${cep}

Gostaria de verificar a disponibilidade para atendimento.`;

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
     MODAL — INSTALAÇÃO / SUBSTITUIÇÃO
  ========================================================= */

  const installationModal = $("#installationModal");
  const installationForm = $("#installationForm");
  const installationCep = $("#installationCep");

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

  $$(".js-close-installation").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(installationModal);
    });
  });

  bindCepMask(installationCep);

  installationForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const name = String(data.get("name") || "").trim();
    const installationType = String(data.get("installationType") || "").trim();
    const brand = String(data.get("brand") || "").trim();
    const model = String(data.get("model") || "").trim();
    const gas = String(data.get("gas") || "").trim();
    const cep = String(data.get("cep") || "").trim();
    const notes = String(data.get("notes") || "").trim();

    if (!name || !installationType || !gas || !cep) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    if (!isValidCep(cep)) {
      alert("Digite um CEP válido no formato 00000-000.");
      installationCep?.focus();
      return;
    }

    const brandText = brand || "Não informado";
    const modelText = model || "Não informado";
    const notesText = notes || "Não informado";

    const message = `Olá! Vim pelo site da Quality Therm e gostaria de solicitar um orçamento para instalação/substituição.

Nome: ${name}
Serviço: ${installationType}
Marca: ${brandText}
Modelo: ${modelText}
Tipo de gás: ${gas}
CEP: ${cep}
Observações: ${notesText}

Gostaria de verificar as condições e disponibilidade para atendimento.`;

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
     FECHAR MODAIS COM ESC
  ========================================================= */

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (assistanceModal && !assistanceModal.hidden) {
      closeModal(assistanceModal);
    }

    if (maintenanceModal && !maintenanceModal.hidden) {
      closeModal(maintenanceModal);
    }

    if (installationModal && !installationModal.hidden) {
      closeModal(installationModal);
    }
  });

  /* =========================================================
     PRODUTOS
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

      const message = `Olá! Vim pelo site da Quality Therm e tenho interesse no ${product}.

Gostaria de confirmar:
• disponibilidade;
• versão GN ou GLP;
• valor do equipamento;
• valor da instalação.

Pode me orientar?`;

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

      const message = `Olá! Vim pelo site da Quality Therm.

Sou ${profile} e gostaria de informações sobre atendimento programado para condomínio.

Pode me explicar como funciona?`;

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
    const gas = String(data.get("gas"));
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
      band = "40 L/min ou mais";
    }
    const result = $("#sizingResult");
    if (!result) return;

    result.hidden = false;

    result.innerHTML = `
      <small>Estimativa inicial</small>
      <br>
      <strong>${band}</strong>
       <p>
        O dimensionamento final pode variar conforme as
        condições da sua instalação. Para a indicação correta
        do modelo, fale com um especialista da Quality Therm.
      </p>
      <button
        type="button"
        class="btn btn-primary"
        id="sendSizing"
      >
        Confirmar com especialista
      </button>
    `;

    pushEvent("calculator_complete", {
      showers,
      flow_per_shower: flow,
      gas_type: gas,
      estimated_band: band,
      ...attribution,
    });

    $("#sendSizing")?.addEventListener("click", () => {
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

      const message = `Olá! Vim pelo site da Quality Therm e utilizei o dimensionador de aquecedor.

Dados informados:
• Uso simultâneo: ${showers} chuveiro(s)
• Vazão aproximada: ${flow} L/min por ducha
• Tipo de gás: ${gas}
• Faixa estimada: ${band}

Gostaria de confirmar qual modelo é mais indicado e receber um orçamento.`;

      window.open(waUrl(message), "_blank", "noopener");
    });
  });

  /* =========================================================
     MENU MOBILE
  ========================================================= */

  const menuBtn = $(".menu-toggle");
  const nav = $(".nav");

  menuBtn?.addEventListener("click", () => {
    if (!nav) return;

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
})();
