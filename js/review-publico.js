(() => {
  "use strict";

  const REVIEWS_KEY =
    "qt_admin_reviews";

  const $ = (
    selector,
    context = document
  ) =>
    context.querySelector(
      selector
    );

  const $$ = (
    selector,
    context = document
  ) =>
    [
      ...context.querySelectorAll(
        selector
      ),
    ];

  const modal =
    $("#reviewPublicModal");

  const backdrop =
    $("#reviewPublicBackdrop");

  const closeButton =
    $("#reviewPublicClose");

  const form =
    $("#reviewPublicForm");

  const success =
    $("#reviewPublicSuccess");

  const ratingInput =
    $("#reviewPublicRating");

  const referenceInput =
    $("#reviewServiceReference");

  const commentInput =
    $("#reviewPublicComment");

  const googleButton =
    $("#googleReviewButton");

  const copyButton =
    $("#copyReviewButton");

  const starButtons =
    $$("#publicReviewStars button");

  let currentRating = 0;

  /* =========================================================
     CONFIGURAÇÃO GOOGLE
  ========================================================= */

  const GOOGLE_REVIEW_URL =
    "COLE_AQUI_O_LINK_DE_AVALIACAO_DO_GOOGLE";

  /* =========================================================
     STORAGE
  ========================================================= */

  function getReviews() {
    try {
      return (
        JSON.parse(
          localStorage.getItem(
            REVIEWS_KEY
          )
        ) || []
      );
    } catch {
      return [];
    }
  }

  function saveReviews(
    reviews
  ) {
    localStorage.setItem(
      REVIEWS_KEY,
      JSON.stringify(
        reviews
      )
    );
  }

  /* =========================================================
     ID
  ========================================================= */

  function generateId() {
    if (
      typeof crypto !==
        "undefined" &&
      typeof crypto.randomUUID ===
        "function"
    ) {
      return crypto.randomUUID();
    }

    return String(
      Date.now() +
        Math.random()
    );
  }

  /* =========================================================
     ABRIR
  ========================================================= */

  function openModal(
    reference = ""
  ) {
    if (!modal) {
      return;
    }

    modal.hidden =
      false;

    document.body.style.overflow =
      "hidden";

    if (
      referenceInput
    ) {
      referenceInput.value =
        reference;
    }

    form.hidden =
      false;

    success.hidden =
      true;
  }

  /* =========================================================
     FECHAR
  ========================================================= */

  function closeModal() {
    if (!modal) {
      return;
    }

    modal.hidden =
      true;

    document.body.style.overflow =
      "";
  }

  backdrop
    ?.addEventListener(
      "click",
      closeModal
    );

  closeButton
    ?.addEventListener(
      "click",
      closeModal
    );

  /* =========================================================
     ESTRELAS
  ========================================================= */

  function renderStars() {
    starButtons.forEach(
      (button) => {
        const value =
          Number(
            button.dataset.rating
          );

        button.classList.toggle(
          "active",
          value <= currentRating
        );
      }
    );
  }

  starButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          currentRating =
            Number(
              button.dataset.rating
            );

          ratingInput.value =
            String(
              currentRating
            );

          renderStars();
        }
      );
    }
  );

  /* =========================================================
     SALVAR AVALIAÇÃO
  ========================================================= */

  form?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      if (
        currentRating < 1
      ) {
        alert(
          "Escolha uma nota de 1 a 5 estrelas."
        );

        return;
      }

      const data =
        new FormData(
          form
        );

      const reviews =
        getReviews();

      const review = {
        id:
          generateId(),

        customerName:
          String(
            data.get(
              "customerName"
            ) || ""
          ).trim(),

        rating:
          currentRating,

        source:
          "Site",

        date:
          new Date()
            .toISOString()
            .slice(
              0,
              10
            ),

        comment:
          String(
            data.get(
              "comment"
            ) || ""
          ).trim(),

        reviewUrl:
          "",

        serviceReference:
          String(
            data.get(
              "serviceReference"
            ) || ""
          ).trim(),

        active:
          false,

        featured:
          false,

        createdAt:
          new Date()
            .toISOString(),

        updatedAt:
          new Date()
            .toISOString(),
      };

      reviews.unshift(
        review
      );

      saveReviews(
        reviews
      );

      form.hidden =
        true;

      success.hidden =
        false;

      if (
        googleButton
      ) {
        googleButton.href =
          GOOGLE_REVIEW_URL;
      }
    }
  );

  /* =========================================================
     COPIAR COMENTÁRIO
  ========================================================= */

  copyButton
    ?.addEventListener(
      "click",
      async () => {
        const text =
          commentInput?.value ||
          "";

        if (!text) {
          return;
        }

        try {
          await navigator.clipboard.writeText(
            text
          );

          copyButton.textContent =
            "Comentário copiado ✓";
        } catch {
          alert(
            "Não foi possível copiar automaticamente."
          );
        }
      }
    );

  /* =========================================================
     ABRIR AUTOMATICAMENTE PELO LINK
  ========================================================= */

  const params =
    new URLSearchParams(
      window.location.search
    );

  const reference =
    params.get("avaliar");

  if (reference) {
    openModal(
      reference
    );
  }

  /* =========================================================
     ESC
  ========================================================= */

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        modal &&
        !modal.hidden
      ) {
        closeModal();
      }
    }
  );
})();