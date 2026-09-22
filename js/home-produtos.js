(() => {
  "use strict";

  // =========================================================
  // SUPABASE
  // =========================================================

  const db = window.initQualityThermSupabase
    ? window.initQualityThermSupabase()
    : window.supabaseClient;

  const $ = (selector, context = document) => context.querySelector(selector);

  // =========================================================
  // IDIOMA DOS PRODUTOS DA HOME
  // =========================================================

  function getLanguage() {
    const language =
      window.QT_SITE?.settings?.()?.siteLanguage ||
      window.QT_I18N?.getLanguage?.() ||
      "pt-BR";

    return window.QT_I18N?.normalizeLanguage?.(language) || "pt-BR";
  }

  const productTranslations = {
    "pt-BR": {
      bestSeller: "Mais procurado",
      promotion: "Promoção",
      featured: "Destaque",
      heater: "Aquecedor",
      color: "Cor",
      defaultDescription:
        "Consulte informações e disponibilidade deste equipamento.",
      pix: "no PIX",
      installments: "ou {count}x de",
      details: "Ver detalhes",
      consult: "Consultar",
      loading: "Carregando produtos...",
      empty: "Nenhum produto em destaque no momento.",
      error: "Não foi possível carregar os produtos no momento.",
      ariaDetails: "Ver detalhes de {product}",
    },

    en: {
      bestSeller: "Most popular",
      promotion: "Promotion",
      featured: "Featured",
      heater: "Heater",
      color: "Color",
      defaultDescription:
        "Check information and availability for this product.",
      pix: "via PIX",
      installments: "or {count}x of",
      details: "View details",
      consult: "Contact us",
      loading: "Loading products...",
      empty: "No featured products at the moment.",
      error: "Products could not be loaded at the moment.",
      ariaDetails: "View details for {product}",
    },

    es: {
      bestSeller: "Más buscado",
      promotion: "Promoción",
      featured: "Destacado",
      heater: "Calentador",
      color: "Color",
      defaultDescription:
        "Consulta información y disponibilidad de este producto.",
      pix: "por PIX",
      installments: "o {count}x de",
      details: "Ver detalles",
      consult: "Consultar",
      loading: "Cargando productos...",
      empty: "No hay productos destacados en este momento.",
      error: "No fue posible cargar los productos en este momento.",
      ariaDetails: "Ver detalles de {product}",
    },
  };

  function pt(key, replacements = {}) {
    const language = getLanguage();

    let text =
      productTranslations[language]?.[key] ||
      productTranslations["pt-BR"][key] ||
      key;

    Object.entries(replacements).forEach(([name, value]) => {
      text = text.replace(`{${name}}`, String(value));
    });

    return text;
  }

  // =========================================================
  // FORMATAR PREÇO
  // =========================================================

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // =========================================================
  // SEGURANÇA
  // =========================================================

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================================================
  // TIPO DE GÁS
  // =========================================================

  function getGasText(product) {
    const gases = [];

    if (product.gas_gn) {
      gases.push("GN");
    }

    if (product.gas_glp) {
      gases.push("GLP");
    }

    return gases.join(" / ");
  }

  // =========================================================
  // SELO
  // =========================================================

  function getTag(product) {
    if (product.best_seller) {
      return pt("bestSeller");
    }

    if (product.promotion) {
      return pt("promotion");
    }

    if (product.featured) {
      return pt("featured");
    }

    return "";
  }

  // =========================================================
  // IMAGEM
  // =========================================================

  function getImagePath(product) {
    const image = String(product.image || "").trim();

    if (!image) {
      return "assets/favicon.svg";
    }

    return image;
  }

  // =========================================================
  // LINK DO PRODUTO
  // =========================================================

  function getProductUrl(product) {
    if (!product.slug) {
      return "#";
    }

    return (
      "produtos/produto.html" + `?produto=${encodeURIComponent(product.slug)}`
    );
  }

  // =========================================================
  // WHATSAPP
  // =========================================================

  function getWhatsAppUrl(product) {
    const phone = "5511985673883";

    const gas = getGasText(product);

    const message =
      `Olá! Vim pelo site da Quality Therm e tenho interesse no ${product.name}.\n\n` +
      `Categoria: ${product.category || "Aquecedores"}\n` +
      `${product.flow ? `Vazão: ${product.flow}\n` : ""}` +
      `${gas ? `Versão: ${gas}\n` : ""}` +
      `Valor de referência: ${formatCurrency(product.price)}\n\n` +
      `Gostaria de confirmar disponibilidade e condições para compra.`;

    return (
      "https://api.whatsapp.com/send" +
      `?phone=${phone}` +
      `&text=${encodeURIComponent(message)}`
    );
  }

  // =========================================================
  // PREÇO EXIBIDO NA HOME
  // =========================================================

  function getHomePrice(product) {
    const usePix =
      product.home_price_type === "pix" && Number(product.cash_price) > 0;

    if (usePix) {
      return {
        value: product.cash_price,
        label: pt("pix"),
      };
    }

    return {
      value: product.price,
      label: "",
    };
  }

  // =========================================================
  // PARCELAMENTO
  // =========================================================

  function getInstallmentHtml(product) {
    const installments = Number(product.installments || 0);
    const installmentValue = Number(product.installment_value || 0);

    if (!installments || !installmentValue) {
      return "";
    }

    const extraText = product.installment_text
      ? ` ${escapeHtml(product.installment_text)}`
      : "";

    return `
      <span class="home-product-installment">
        ${pt("installments", { count: installments })}
        ${formatCurrency(installmentValue)}${extraText}
      </span>
    `;
  }

  // =========================================================
  // CRIAR CARD
  // =========================================================

  function createProductCard(product) {
    const tag = getTag(product);
    const gas = getGasText(product);
    const productUrl = getProductUrl(product);
    const whatsappUrl = getWhatsAppUrl(product);
    const homePrice = getHomePrice(product);

    return `
      <article
        class="product-card ${product.best_seller ? "featured" : ""}"
        data-product="${escapeHtml(product.name)}"
      >

        <a
          class="product-image-link"
          href="${productUrl}"
          aria-label="${escapeHtml(
            pt("ariaDetails", { product: product.name }),
          )}"
        >
          <div class="product-image">
            <img
              src="${escapeHtml(getImagePath(product))}"
              alt="${escapeHtml(product.name)}"
              width="600"
              height="600"
              loading="lazy"
              decoding="async"
            />
          </div>
        </a>

        ${
          tag
            ? `
              <span class="tag">
                ${escapeHtml(tag)}
              </span>
            `
            : ""
        }

        <span class="product-category">
          ${escapeHtml(product.brand || pt("heater"))}
        </span>

        <h3>
          ${escapeHtml(product.name)}
        </h3>

        ${
          product.flow
            ? `
              <span class="product-flow">
                ${escapeHtml(product.flow)}
              </span>
            `
            : ""
        }

        ${
          gas
            ? `
              <span class="product-gas">
                ${escapeHtml(gas)}
              </span>
            `
            : ""
        }

        ${
          product.color
            ? `
              <span class="product-color">
               ${escapeHtml(pt("color"))}: ${escapeHtml(product.color)}
              </span>
            `
            : ""
        }

        <p>
          ${escapeHtml(product.short_description || pt("defaultDescription"))}
        </p>

        <div class="home-product-price">

          <strong>
            ${formatCurrency(homePrice.value)}
            ${homePrice.label}
          </strong>

          ${getInstallmentHtml(product)}

        </div>

        <div class="product-actions">

          <a
            class="btn btn-primary"
            href="${productUrl}"
          >
           ${pt("details")}
          </a>

          <a
            class="btn btn-outline"
            href="${whatsappUrl}"
            target="_blank"
            rel="noopener"
          >
            ${pt("consult")}
          </a>

        </div>

      </article>
    `;
  }

  // =========================================================
  // CARREGAR PRODUTOS DO SUPABASE
  // =========================================================

  async function getFeaturedProducts() {
    if (!db) {
      throw new Error("Supabase não conectado.");
    }

    const { data, error } = await db
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      throw error;
    }

    return data || [];
  }

  // =========================================================
  // RENDERIZAR HOME
  // =========================================================

  async function renderHomeProducts() {
    const container = $("#homeProductsGrid");

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div
        style="
          grid-column:1 / -1;
          text-align:center;
          padding:35px;
          color:#667780;
        "
      >
       ${pt("loading")}
      </div>
    `;

    try {
      const products = await getFeaturedProducts();

      if (!products.length) {
        container.innerHTML = `
          <div
            style="
              grid-column:1 / -1;
              text-align:center;
              padding:35px;
              color:#667780;
            "
          >
            ${pt("empty")}
          </div>
        `;

        return;
      }

      container.innerHTML = products.map(createProductCard).join("");
    } catch (error) {
      console.error("Erro ao carregar produtos da Home:", error);

      container.innerHTML = `
        <div
          style="
            grid-column:1 / -1;
            text-align:center;
            padding:35px;
            color:#667780;
          "
        >
          ${pt("error")}
        </div>
      `;
    }
  }

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  renderHomeProducts();
})();
