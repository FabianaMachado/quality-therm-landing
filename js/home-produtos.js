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
      return "Mais procurado";
    }

    if (product.promotion) {
      return "Promoção";
    }

    if (product.featured) {
      return "Destaque";
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
        label: "no PIX",
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
        ou ${installments}x de
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
          aria-label="Ver detalhes do ${escapeHtml(product.name)}"
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
          ${escapeHtml(product.brand || "Aquecedor")}
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
                Cor: ${escapeHtml(product.color)}
              </span>
            `
            : ""
        }

        <p>
          ${escapeHtml(
            product.short_description ||
              "Consulte informações e disponibilidade deste equipamento.",
          )}
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
            Ver detalhes
          </a>

          <a
            class="btn btn-outline"
            href="${whatsappUrl}"
            target="_blank"
            rel="noopener"
          >
            Consultar
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
      .eq("category", "Aquecedores")
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
        Carregando produtos...
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
            Nenhum aquecedor em destaque no momento.
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
          Não foi possível carregar os produtos no momento.
        </div>
      `;
    }
  }

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  renderHomeProducts();
})();
