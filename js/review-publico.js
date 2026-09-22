(() => {
  "use strict";

  // =========================================================
  // SUPABASE
  // =========================================================

  const db = window.initQualityThermSupabase
    ? window.initQualityThermSupabase()
    : window.supabaseClient;

  const $ = (selector, context = document) => context.querySelector(selector);

  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];

  // =========================================================
  // ELEMENTOS
  // =========================================================

  const modal = $("#reviewPublicModal");
  const backdrop = $("#reviewPublicBackdrop");
  const closeButton = $("#reviewPublicClose");
  const form = $("#reviewPublicForm");
  const success = $("#reviewPublicSuccess");
  const ratingInput = $("#reviewPublicRating");
  const referenceInput = $("#reviewServiceReference");
  const commentInput = $("#reviewPublicComment");
  const googleButton = $("#googleReviewButton");
  const copyButton = $("#copyReviewButton");
  const starButtons = $$("#publicReviewStars button");

  let currentRating = 0;
  let isSubmitting = false;

  // =========================================================
  // IDIOMA
  // =========================================================

  function getLanguage() {
    return (
      window.QT_I18N?.getLanguage?.() ||
      document.documentElement.lang ||
      "pt-BR"
    );
  }

  function getText(key) {
    const language = getLanguage();

    const texts = {
      "pt-BR": {
        ratingRequired: "Escolha uma nota de 1 a 5 estrelas.",
        requiredFields: "Preencha seu nome e conte como foi seu atendimento.",
        saveError:
          "Não foi possível enviar sua avaliação no momento. Tente novamente.",
        copied: "Comentário copiado ✓",
        copyError: "Não foi possível copiar automaticamente.",
        sending: "Enviando...",
        submit: "Enviar avaliação",
      },

      en: {
        ratingRequired: "Choose a rating from 1 to 5 stars.",
        requiredFields: "Enter your name and tell us about your experience.",
        saveError:
          "Your review could not be submitted at this time. Please try again.",
        copied: "Review copied ✓",
        copyError: "The review could not be copied automatically.",
        sending: "Sending...",
        submit: "Submit review",
      },

      es: {
        ratingRequired: "Elija una puntuación de 1 a 5 estrellas.",
        requiredFields:
          "Ingrese su nombre y cuéntenos cómo fue su experiencia.",
        saveError:
          "No fue posible enviar su evaluación en este momento. Inténtelo nuevamente.",
        copied: "Comentario copiado ✓",
        copyError: "No fue posible copiar automáticamente.",
        sending: "Enviando...",
        submit: "Enviar evaluación",
      },
    };

    return texts[language]?.[key] || texts["pt-BR"][key] || "";
  }

  // =========================================================
  // GOOGLE
  // =========================================================

  function getGoogleReviewUrl() {
    return window.QT_SITE?.settings?.googleReviewUrl || "";
  }

  // =========================================================
  // ABRIR MODAL
  // =========================================================

  function openModal(reference = "") {
    if (!modal) {
      return;
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";

    if (referenceInput) {
      referenceInput.value = reference;
    }

    if (form) {
      form.hidden = false;
    }

    if (success) {
      success.hidden = true;
    }
  }

  // =========================================================
  // FECHAR MODAL
  // =========================================================

  function closeModal() {
    if (!modal) {
      return;
    }

    modal.hidden = true;
    document.body.style.overflow = "";
  }

  backdrop?.addEventListener("click", closeModal);
  closeButton?.addEventListener("click", closeModal);

  // =========================================================
  // ESTRELAS
  // =========================================================

  function renderStars() {
    starButtons.forEach((button) => {
      const value = Number(button.dataset.rating);

      button.classList.toggle("active", value <= currentRating);

      button.setAttribute("aria-pressed", String(value === currentRating));
    });
  }

  starButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentRating = Number(button.dataset.rating);

      if (ratingInput) {
        ratingInput.value = String(currentRating);
      }

      renderStars();
    });
  });

  // =========================================================
  // BOTÃO DE ENVIO
  // =========================================================

  function getSubmitButton() {
    return form?.querySelector('button[type="submit"]');
  }

  function setSubmitting(value) {
    isSubmitting = value;

    const button = getSubmitButton();

    if (!button) {
      return;
    }

    button.disabled = value;

    button.textContent = value ? getText("sending") : getText("submit");
  }

  // =========================================================
  // SALVAR AVALIAÇÃO NO SUPABASE
  // =========================================================

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (currentRating < 1) {
      alert(getText("ratingRequired"));
      return;
    }

    const data = new FormData(form);

    const customerName = String(data.get("customerName") || "").trim();

    const comment = String(data.get("comment") || "").trim();

    const serviceReference = String(data.get("serviceReference") || "").trim();

    if (!customerName || !comment) {
      alert(getText("requiredFields"));
      return;
    }

    if (!db) {
      console.error("Supabase não está disponível para salvar a avaliação.");

      alert(getText("saveError"));
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await db.from("reviews").insert({
        customer_name: customerName,
        rating: currentRating,
        source: "Site",
        review_date: new Date().toISOString().slice(0, 10),
        comment,
        review_url: "",
        active: false,
        featured: false,
      });

      if (error) {
        throw error;
      }

      form.hidden = true;

      if (success) {
        success.hidden = false;
      }

      const googleReviewUrl = getGoogleReviewUrl();

      if (googleButton) {
        if (googleReviewUrl) {
          googleButton.href = googleReviewUrl;
          googleButton.hidden = false;
        } else {
          googleButton.hidden = true;
        }
      }

      form.reset();

      currentRating = 0;

      if (ratingInput) {
        ratingInput.value = "";
      }

      renderStars();

      if (
        window.QT_HOME_REVIEWS &&
        typeof window.QT_HOME_REVIEWS.refresh === "function"
      ) {
        window.QT_HOME_REVIEWS.refresh();
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);

      alert(getText("saveError"));
    } finally {
      setSubmitting(false);
    }
  });

  // =========================================================
  // COPIAR COMENTÁRIO
  // =========================================================

  copyButton?.addEventListener("click", async () => {
    const text = commentInput?.value || "";

    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);

      copyButton.textContent = getText("copied");
    } catch (error) {
      console.error("Erro ao copiar comentário:", error);

      alert(getText("copyError"));
    }
  });

  // =========================================================
  // ABRIR AUTOMATICAMENTE PELO LINK
  // =========================================================

  const params = new URLSearchParams(window.location.search);

  const reference = params.get("avaliar");

  if (reference) {
    openModal(reference);
  }

  // =========================================================
  // ESC
  // =========================================================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeModal();
    }
  });

  // =========================================================
  // API PÚBLICA
  // =========================================================

  window.QT_PUBLIC_REVIEW = {
    open: openModal,
    close: closeModal,
  };
})();
