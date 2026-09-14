(() => {
  "use strict";

  /* =========================================================
     CONFIGURAÇÕES
  ========================================================= */

  const STORAGE_KEY =
    "qt_admin_products";

  const $ = (
    selector,
    context = document
  ) =>
    context.querySelector(
      selector
    );

  /* =========================================================
     BUSCAR PRODUTOS
  ========================================================= */

  function getProducts() {
    try {
      return (
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          )
        ) || []
      );
    } catch {
      return [];
    }
  }

  /* =========================================================
     FORMATAR PREÇO
  ========================================================= */

  function formatCurrency(
    value
  ) {
    return Number(
      value || 0
    ).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  /* =========================================================
     SEGURANÇA
  ========================================================= */

  function escapeHtml(
    text
  ) {
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
     NORMALIZAR CATEGORIA
  ========================================================= */

  function getCategory(
    product
  ) {
    /*
      Compatibilidade com produtos antigos.

      Se o produto ainda não tiver categoria,
      consideramos como Aquecedores.
    */

    return (
      product.category ||
      "Aquecedores"
    );
  }

  /* =========================================================
     TIPO DE GÁS
  ========================================================= */

  function getGasText(
    product
  ) {
    const gases = [];

    if (
      product.gasGN
    ) {
      gases.push("GN");
    }

    if (
      product.gasGLP
    ) {
      gases.push("GLP");
    }

    if (
      gases.length === 0
    ) {
      return "";
    }

    return gases.join(
      " / "
    );
  }

  /* =========================================================
     SELO
  ========================================================= */

  function getTag(
    product
  ) {
    if (
      product.bestSeller
    ) {
      return "Mais procurado";
    }

    if (
      product.promotion
    ) {
      return "Promoção";
    }

    if (
      product.featured
    ) {
      return "Destaque";
    }

    return "";
  }

  /* =========================================================
     CAMINHO DA IMAGEM
  ========================================================= */

  function getImagePath(
    product
  ) {
    const image =
      String(
        product.image ||
        ""
      ).trim();

    if (!image) {
      return "assets/favicon.svg";
    }

    /*
      Produtos antigos:

      ../assets/produtos/rinnai-e21.webp

      Como estamos na Home,
      removemos o ../

      Imagens em Base64,
      vindas do upload do painel,
      continuam intactas.
    */

    if (
      image.startsWith(
        "data:image"
      )
    ) {
      return image;
    }

    return image.replace(
      /^\.\.\//,
      ""
    );
  }

  /* =========================================================
     LINK UNIVERSAL DO PRODUTO
  ========================================================= */

  function getProductUrl(
    product
  ) {
    if (
      !product.slug
    ) {
      return "#";
    }

    return (
      "produtos/produto.html" +
      `?produto=${encodeURIComponent(
        product.slug
      )}`
    );
  }

  /* =========================================================
     WHATSAPP
  ========================================================= */

  function getWhatsAppUrl(
    product
  ) {
    const phone =
      "5511985673883";

    const gas =
      getGasText(
        product
      );

    const category =
      getCategory(
        product
      );

    const message =
      `Olá! Vim pelo site da Quality Therm e tenho interesse no ${product.name}.

Categoria: ${category}
${product.flow ? `Vazão: ${product.flow}\n` : ""}${gas ? `Versão: ${gas}\n` : ""}Valor de referência: ${formatCurrency(product.price)}

Gostaria de confirmar disponibilidade e condições para compra.`;

    return (
      "https://api.whatsapp.com/send" +
      `?phone=${phone}` +
      `&text=${encodeURIComponent(
        message
      )}`
    );
  }

  /* =========================================================
     CRIAR CARD
  ========================================================= */

  function createProductCard(
    product
  ) {
    const tag =
      getTag(
        product
      );

    const gas =
      getGasText(
        product
      );

    const productUrl =
      getProductUrl(
        product
      );

    const whatsappUrl =
      getWhatsAppUrl(
        product
      );

    return `
      <article
        class="product-card ${
          product.bestSeller
            ? "featured"
            : ""
        }"
        data-product="${escapeHtml(
          product.name
        )}"
      >

        <a
          class="product-image-link"
          href="${productUrl}"
          aria-label="Ver detalhes do ${escapeHtml(
            product.name
          )}"
        >

          <div
            class="product-image"
          >

            <img
              src="${escapeHtml(
                getImagePath(
                  product
                )
              )}"
              alt="${escapeHtml(
                product.name
              )}"
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
                ${escapeHtml(
                  tag
                )}
              </span>
            `
            : ""
        }

        <span
          class="product-category"
        >
          ${escapeHtml(
            product.brand ||
            "Aquecedor"
          )}
        </span>

        <h3>
          ${escapeHtml(
            product.name
          )}
        </h3>

        ${
          product.flow
            ? `
              <span
                class="product-flow"
              >
                ${escapeHtml(
                  product.flow
                )}
              </span>
            `
            : ""
        }

        ${
          gas
            ? `
              <span
                class="product-gas"
              >
                ${escapeHtml(
                  gas
                )}
              </span>
            `
            : ""
        }

        <p>
          ${escapeHtml(
            product.shortDescription ||
            "Consulte informações e disponibilidade deste equipamento."
          )}
        </p>

        <div
          class="home-product-price"
        >

          <small>
            A partir de
          </small>

          <strong>
            ${formatCurrency(
              product.price
            )}
          </strong>

          ${
            Number(
              product.cashPrice
            ) > 0
              ? `
                <span>
                  À vista:
                  ${formatCurrency(
                    product.cashPrice
                  )}
                </span>
              `
              : ""
          }

        </div>

        <div
          class="product-actions"
        >

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

  /* =========================================================
     RENDERIZAR PRODUTOS NA HOME
  ========================================================= */

  function renderHomeProducts() {
    const container =
      $("#homeProductsGrid");

    if (!container) {
      return;
    }

    const products =
      getProducts();

    /*
      IMPORTANTE:

      A Home principal mostra APENAS:

      - produto ativo
      - destaque na Home
      - categoria Aquecedores

      Acessórios, Duchas e Peças
      NÃO entram nessa vitrine.
    */

    const featuredProducts =
      products
        .filter(
          (product) =>
            product.active &&
            product.featured &&
            getCategory(
              product
            ) ===
              "Aquecedores"
        )
        .slice(
          0,
          4
        );

    /* =======================================================
       SEM PRODUTOS
    ======================================================== */

    if (
      featuredProducts.length ===
      0
    ) {
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

    /* =======================================================
       PRODUTOS
    ======================================================== */

    container.innerHTML =
      featuredProducts
        .map(
          createProductCard
        )
        .join("");
  }

  /* =========================================================
     ATUALIZAR ENTRE ABAS
  ========================================================= */

  window.addEventListener(
    "storage",
    (event) => {
      if (
        event.key ===
        STORAGE_KEY
      ) {
        renderHomeProducts();
      }
    }
  );

  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  renderHomeProducts();
})();
