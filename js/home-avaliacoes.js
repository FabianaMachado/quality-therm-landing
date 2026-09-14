(() => {
  "use strict";

  /* =========================================================
     CONFIGURAÇÃO
  ========================================================= */

  const STORAGE_KEY =
    "qt_admin_reviews";

  const $ = (
    selector,
    context = document
  ) =>
    context.querySelector(
      selector
    );

  /* =========================================================
     BUSCAR AVALIAÇÕES
  ========================================================= */

  function getReviews() {
    try {
      return (
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          )
        ) || []
      );
    } catch (error) {
      return [];
    }
  }

  /* =========================================================
     SEGURANÇA
  ========================================================= */

  function escapeHtml(text) {
    return String(
      text || ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  /* =========================================================
     ESTRELAS
  ========================================================= */

  function stars(rating) {
    const value =
      Math.max(
        1,
        Math.min(
          5,
          Number(
            rating || 0
          )
        )
      );

    return (
      "★".repeat(value) +
      "☆".repeat(
        5 - value
      )
    );
  }

  /* =========================================================
     DATA
  ========================================================= */

  function formatDate(date) {
    if (!date) {
      return "";
    }

    const parts =
      String(date)
        .split("-");

    if (
      parts.length !== 3
    ) {
      return date;
    }

    return (
      `${parts[2]}/` +
      `${parts[1]}/` +
      `${parts[0]}`
    );
  }

  /* =========================================================
     ORIGEM
  ========================================================= */

  function sourceLabel(source) {
    switch (
      String(
        source || ""
      ).toLowerCase()
    ) {
      case "google":
        return "Google";

      case "whatsapp":
        return "WhatsApp";

      case "site":
        return "Site";

      default:
        return (
          source ||
          "Avaliação"
        );
    }
  }

  /* =========================================================
     CARD
  ========================================================= */

  function createReviewCard(
    review
  ) {
    const url =
      String(
        review.reviewUrl || ""
      ).trim();

    return `
      <article
        class="review-card"
      >

        <div
          class="review-card-top"
        >

          <div
            class="review-stars"
            aria-label="${escapeHtml(
              review.rating
            )} de 5 estrelas"
          >
            ${stars(
              review.rating
            )}
          </div>

          <span
            class="review-source"
          >
            ${escapeHtml(
              sourceLabel(
                review.source
              )
            )}
          </span>

        </div>

        <blockquote>
          “${escapeHtml(
            review.comment
          )}”
        </blockquote>

        <div
          class="review-author"
        >

          <div
            class="review-avatar"
            aria-hidden="true"
          >
            ${escapeHtml(
              String(
                review.customerName ||
                "C"
              )
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div>

            <strong>
              ${escapeHtml(
                review.customerName
              )}
            </strong>

            ${
              review.date
                ? `
                  <small>
                    ${escapeHtml(
                      formatDate(
                        review.date
                      )
                    )}
                  </small>
                `
                : ""
            }

          </div>

        </div>

        ${
          url
            ? `
              <a
                class="review-original-link"
                href="${escapeHtml(
                  url
                )}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver avaliação original →
              </a>
            `
            : ""
        }

      </article>
    `;
  }

  /* =========================================================
     RENDERIZAR HOME
  ========================================================= */

  function renderHomeReviews() {
    const grid =
      $("#reviewsHomeGrid");

    const averageElement =
      $("#reviewsHomeAverage");

    const countElement =
      $("#reviewsHomeCount");

    if (!grid) {
      return;
    }

    const reviews =
      getReviews();

    /* SOMENTE:
       - ATIVA
       - EXIBIR NA HOME
    */

    const featured =
      reviews
        .filter(
          (review) =>
            review.active &&
            review.featured
        )
        .sort(
          (a, b) =>
            new Date(
              b.date ||
              b.createdAt ||
              0
            ) -
            new Date(
              a.date ||
              a.createdAt ||
              0
            )
        );

    /* =======================================================
       SEM AVALIAÇÕES
    ======================================================== */

    if (
      featured.length === 0
    ) {
      grid.innerHTML = `
        <div
          class="reviews-empty"
        >

          <strong>
            Avaliações em breve.
          </strong>

          <span>
            As avaliações selecionadas
            no painel administrativo
            aparecerão aqui.
          </span>

        </div>
      `;

      if (
        averageElement
      ) {
        averageElement.textContent =
          "0,0";
      }

      if (
        countElement
      ) {
        countElement.textContent =
          "Nenhuma avaliação em destaque";
      }

      return;
    }

    /* =======================================================
       MÉDIA
    ======================================================== */

    const total =
      featured.reduce(
        (
          sum,
          review
        ) =>
          sum +
          Number(
            review.rating || 0
          ),
        0
      );

    const average =
      total /
      featured.length;

    if (
      averageElement
    ) {
      averageElement.textContent =
        average
          .toFixed(1)
          .replace(
            ".",
            ","
          );
    }

    if (
      countElement
    ) {
      countElement.textContent =
        `${featured.length} ${
          featured.length === 1
            ? "avaliação em destaque"
            : "avaliações em destaque"
        }`;
    }

    /* =======================================================
       CARDS

       Mostramos até 6 na Home.
    ======================================================== */

    grid.innerHTML =
      featured
        .slice(0, 6)
        .map(
          createReviewCard
        )
        .join("");
  }

  /* =========================================================
     ATUALIZAR SE PAINEL ESTIVER EM OUTRA ABA
  ========================================================= */

  window.addEventListener(
    "storage",
    (event) => {
      if (
        event.key ===
        STORAGE_KEY
      ) {
        renderHomeReviews();
      }
    }
  );

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  renderHomeReviews();
})();