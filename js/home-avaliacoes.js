(() => {
  "use strict";

  // =========================================================
  // SUPABASE
  // =========================================================

  const db = window.initQualityThermSupabase
    ? window.initQualityThermSupabase()
    : window.supabaseClient;

  const $ = (selector, context = document) =>
    context.querySelector(selector);

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

  function tr(key, fallback, variables = {}) {
    if (!window.QT_I18N?.t) {
      return fallback;
    }

    const translated = window.QT_I18N.t(
      key,
      getLanguage(),
      variables,
    );

    if (!translated || translated === key) {
      return fallback;
    }

    return translated;
  }

  // =========================================================
  // SEGURANÇA
  // =========================================================

  function escapeHtml(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================================================
  // ESTRELAS
  // =========================================================

  function stars(rating) {
    const value = Math.max(
      1,
      Math.min(5, Number(rating || 0)),
    );

    return "★".repeat(value) + "☆".repeat(5 - value);
  }

  // =========================================================
  // DATA
  // =========================================================

  function formatDate(date) {
    if (!date) {
      return "";
    }

    const value = new Date(`${date}T12:00:00`);

    if (Number.isNaN(value.getTime())) {
      return String(date);
    }

    const language = getLanguage();

    const locale =
      language === "en"
        ? "en-US"
        : language === "es"
          ? "es-ES"
          : "pt-BR";

    return new Intl.DateTimeFormat(locale).format(value);
  }

  // =========================================================
  // ORIGEM
  // =========================================================

  function sourceLabel(source) {
    const normalized = String(source || "").toLowerCase();

    if (normalized === "google") {
      return "Google";
    }

    if (normalized === "whatsapp") {
      return "WhatsApp";
    }

    if (normalized === "site") {
      return tr("reviews.sourceSite", "Site");
    }

    return source || tr("reviews.sourceReview", "Avaliação");
  }

  // =========================================================
  // TEXTOS
  // =========================================================

  function getReviewText(key) {
    const language = getLanguage();

    const texts = {
      "pt-BR": {
        original: "Ver avaliação original →",
        comingSoon: "Avaliações em breve.",
        comingSoonText:
          "As avaliações selecionadas no painel administrativo aparecerão aqui.",
        noFeatured: "Nenhuma avaliação em destaque",
        singular: "avaliação em destaque",
        plural: "avaliações em destaque",
        stars: "de 5 estrelas",
        loadError:
          "Não foi possível carregar as avaliações no momento.",
      },

      en: {
        original: "View original review →",
        comingSoon: "Reviews coming soon.",
        comingSoonText:
          "Reviews selected in the admin panel will appear here.",
        noFeatured: "No featured reviews",
        singular: "featured review",
        plural: "featured reviews",
        stars: "out of 5 stars",
        loadError:
          "Reviews could not be loaded at this time.",
      },

      es: {
        original: "Ver evaluación original →",
        comingSoon: "Evaluaciones próximamente.",
        comingSoonText:
          "Las evaluaciones seleccionadas en el panel administrativo aparecerán aquí.",
        noFeatured: "Ninguna evaluación destacada",
        singular: "evaluación destacada",
        plural: "evaluaciones destacadas",
        stars: "de 5 estrellas",
        loadError:
          "No fue posible cargar las evaluaciones en este momento.",
      },
    };

    return (
      texts[language]?.[key] ||
      texts["pt-BR"][key] ||
      ""
    );
  }

  // =========================================================
  // CARD
  // =========================================================

  function createReviewCard(review) {
    const url = String(review.review_url || "").trim();

    const customerName =
      String(review.customer_name || "").trim() ||
      "Cliente";

    return `
      <article
        class="review-card"
        data-user-content
      >

        <div class="review-card-top">

          <div
            class="review-stars"
            aria-label="${escapeHtml(
              `${review.rating} ${getReviewText("stars")}`,
            )}"
          >
            ${stars(review.rating)}
          </div>

          <span class="review-source">
            ${escapeHtml(sourceLabel(review.source))}
          </span>

        </div>

        <blockquote data-user-content>
          “${escapeHtml(review.comment)}”
        </blockquote>

        <div class="review-author">

          <div
            class="review-avatar"
            aria-hidden="true"
          >
            ${escapeHtml(
              customerName.charAt(0).toUpperCase(),
            )}
          </div>

          <div>

            <strong data-user-content>
              ${escapeHtml(customerName)}
            </strong>

            ${
              review.review_date
                ? `
                  <small>
                    ${escapeHtml(
                      formatDate(review.review_date),
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
                href="${escapeHtml(url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${escapeHtml(getReviewText("original"))}
              </a>
            `
            : ""
        }

      </article>
    `;
  }

  // =========================================================
  // BUSCAR NO SUPABASE
  // =========================================================

  async function getFeaturedReviews() {
    if (!db) {
      throw new Error("Supabase não conectado.");
    }

    const { data, error } = await db
      .from("reviews")
      .select(
        `
          id,
          customer_name,
          rating,
          source,
          review_date,
          comment,
          review_url,
          active,
          featured,
          created_at
        `,
      )
      .eq("active", true)
      .eq("featured", true)
      .order("review_date", {
        ascending: false,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(6);

    if (error) {
      throw error;
    }

    return data || [];
  }

  // =========================================================
  // ESTADO VAZIO
  // =========================================================

  function renderEmpty(grid, averageElement, countElement) {
    grid.innerHTML = `
      <div class="reviews-empty">

        <strong>
          ${escapeHtml(getReviewText("comingSoon"))}
        </strong>

        <span>
          ${escapeHtml(getReviewText("comingSoonText"))}
        </span>

      </div>
    `;

    if (averageElement) {
      averageElement.textContent = "0,0";
    }

    if (countElement) {
      countElement.textContent =
        getReviewText("noFeatured");
    }
  }

  // =========================================================
  // RENDERIZAR HOME
  // =========================================================

  async function renderHomeReviews() {
    const grid = $("#reviewsHomeGrid");
    const averageElement = $("#reviewsHomeAverage");
    const countElement = $("#reviewsHomeCount");

    if (!grid) {
      return;
    }

    try {
      const reviews = await getFeaturedReviews();

      if (!reviews.length) {
        renderEmpty(
          grid,
          averageElement,
          countElement,
        );

        return;
      }

      const total = reviews.reduce(
        (sum, review) =>
          sum + Number(review.rating || 0),
        0,
      );

      const average = total / reviews.length;

      if (averageElement) {
        const language = getLanguage();

        averageElement.textContent =
          new Intl.NumberFormat(
            language === "en"
              ? "en-US"
              : language === "es"
                ? "es-ES"
                : "pt-BR",
            {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            },
          ).format(average);
      }

      if (countElement) {
        countElement.textContent =
          `${reviews.length} ${
            reviews.length === 1
              ? getReviewText("singular")
              : getReviewText("plural")
          }`;
      }

      grid.innerHTML = reviews
        .map(createReviewCard)
        .join("");
    } catch (error) {
      console.error(
        "Erro ao carregar avaliações da Home:",
        error,
      );

      grid.innerHTML = `
        <div class="reviews-empty">
          <strong>
            ${escapeHtml(getReviewText("loadError"))}
          </strong>
        </div>
      `;

      if (countElement) {
        countElement.textContent = "";
      }
    }
  }

  // =========================================================
  // DISPONIBILIZAR ATUALIZAÇÃO
  // =========================================================

  window.QT_HOME_REVIEWS = {
    refresh: renderHomeReviews,
  };

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  renderHomeReviews();
})();
