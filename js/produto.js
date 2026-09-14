(() => {
  "use strict";

  const STORAGE_KEY =
    "qt_admin_products";

  const cfg =
    window.QT_CONFIG || {};

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

  /* =========================================================
     PRODUTOS
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
     SLUG
  ========================================================= */

  function getSlug() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return (
      params.get(
        "produto"
      ) || ""
    ).trim();
  }

  /* =========================================================
     FORMATAR DINHEIRO
  ========================================================= */

  function money(value) {
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
     CAMINHO DA IMAGEM
  ========================================================= */

  function imagePath(product) {
    const image =
      String(
        product.image || ""
      ).trim();

    if (!image) {
      return "../assets/favicon.svg";
    }

    return image;
  }

  /* =========================================================
     GÁS
  ========================================================= */

  function gasText(product) {
    const gases = [];

    if (product.gasGN) {
      gases.push("GN");
    }

    if (product.gasGLP) {
      gases.push("GLP");
    }

    return (
      gases.join(" / ") ||
      "Consulte"
    );
  }

  /* =========================================================
     WHATSAPP
  ========================================================= */

  function waUrl(message) {
    const phone =
      cfg.whatsapp ||
      "5511985673883";

    return (
      "https://api.whatsapp.com/send" +
      `?phone=${encodeURIComponent(
        phone
      )}` +
      `&text=${encodeURIComponent(
        message
      )}`
    );
  }

  function selectedValue(name) {
    return (
      $(
        `input[name="${name}"]:checked`
      )?.value || ""
    );
  }

  /* =========================================================
     PRODUTO
  ========================================================= */

  const slug =
    getSlug();

  const products =
    getProducts();

  const product =
    products.find(
      (item) =>
        item.slug === slug &&
        item.active
    );

  /* =========================================================
     NÃO ENCONTRADO
  ========================================================= */

  if (!product) {
    $("#productNotFound").hidden =
      false;

    const year =
      $("#year");

    if (year) {
      year.textContent =
        new Date()
          .getFullYear();
    }

    return;
  }

  /* =========================================================
     SEO / TITLE
  ========================================================= */

  document.title =
    `${product.name} | Quality Therm`;

  const descriptionMeta =
    $("#pageDescription");

  if (descriptionMeta) {
    descriptionMeta.content =
      product.shortDescription ||
      product.description ||
      `Aquecedor ${product.name}`;
  }

  /* =========================================================
     MOSTRAR SEÇÕES
  ========================================================= */

  [
    "#productContent",
    "#productBenefits",
    "#productInformation",
    "#productSpecs",
    "#productFaq",
  ].forEach(
    (selector) => {
      const element =
        $(selector);

      if (element) {
        element.hidden =
          false;
      }
    }
  );

  /* =========================================================
     PRINCIPAL
  ========================================================= */

  $("#breadcrumbName").textContent =
    product.name;

  $("#productEyebrow").textContent =
    `${product.brand} • Aquecedor a gás`;

  $("#productName").textContent =
    product.name;

  $("#productSubtitle").textContent =
    [
      product.sku,
      product.flow,
    ]
      .filter(Boolean)
      .join(" • ");

  $("#productMainImage").src =
    imagePath(product);

  $("#productMainImage").alt =
    product.name;

  /* =========================================================
     BADGES
  ========================================================= */

  const badges = [];

  if (product.bestSeller) {
    badges.push(
      "Mais procurado"
    );
  }

  if (product.promotion) {
    badges.push(
      "Promoção"
    );
  }

  if (product.featured) {
    badges.push(
      "Destaque"
    );
  }

  badges.push(
    gasText(product)
  );

  $("#productBadges").innerHTML =
    badges
      .map(
        (badge) =>
          `<span>${badge}</span>`
      )
      .join("");

  /* =========================================================
     PREÇOS
  ========================================================= */

  $("#productPrice").textContent =
    money(product.price);

  $("#equipmentPrice").textContent =
    money(product.price);

  if (
    Number(
      product.cashPrice
    ) > 0
  ) {
    $("#productCashPrice").textContent =
      `${money(
        product.cashPrice
      )} à vista*`;
  } else {
    $("#productCashPrice").hidden =
      true;
  }

  /* =========================================================
     GÁS
  ========================================================= */

  const optionGN =
    $("#optionGN");

  const optionGLP =
    $("#optionGLP");

  optionGN.hidden =
    !product.gasGN;

  optionGLP.hidden =
    !product.gasGLP;

  const firstGas =
    $('input[name="gas"]:not(:disabled)');

  if (
    product.gasGN
  ) {
    $(
      'input[name="gas"][value="GN"]'
    ).checked = true;
  } else if (
    product.gasGLP
  ) {
    $(
      'input[name="gas"][value="GLP"]'
    ).checked = true;
  }

  /* =========================================================
     DESCRIÇÕES
  ========================================================= */

  $("#informationTitle").textContent =
    product.name;

  $("#productDescription").textContent =
    product.description ||
    product.shortDescription ||
    "Consulte informações deste equipamento.";

  $("#featureBrand").textContent =
    `✓ Marca: ${product.brand}`;

  $("#featureFlow").textContent =
    `✓ Vazão: ${
      product.flow ||
      "Consulte"
    }`;

  $("#featureGas").textContent =
    `✓ Gás: ${gasText(
      product
    )}`;

  /* =========================================================
     BENEFÍCIOS
  ========================================================= */

  $("#benefitFlow").textContent =
    product.flow ||
    "Consulte";

  $("#benefitGas").textContent =
    gasText(product);

  $("#benefitSku").textContent =
    product.sku ||
    "Consulte";

  /* =========================================================
     FICHA
  ========================================================= */

  $("#specBrand").textContent =
    product.brand ||
    "—";

  $("#specModel").textContent =
    product.model ||
    "—";

  $("#specSku").textContent =
    product.sku ||
    "—";

  $("#specFlow").textContent =
    product.flow ||
    "—";

  $("#specGas").textContent =
    gasText(product);

  /* =========================================================
     MENSAGEM
  ========================================================= */

  function purchaseMessage(
    forceInstallation = false
  ) {
    const gas =
      selectedValue(
        "gas"
      ) ||
      "Não informado";

    const purchaseType =
      forceInstallation
        ? "equipamento + instalação"
        : selectedValue(
            "purchaseType"
          ) ||
          "equipamento";

    const price =
      purchaseType ===
      "equipamento"
        ? money(
            product.price
          )
        : "a confirmar após avaliação";

    return `Olá! Vim pelo site da Quality Therm e gostaria de comprar o ${product.name}.

Marca: ${product.brand}
Modelo: ${product.model || "Não informado"}
Vazão: ${product.flow || "Não informado"}
Versão: ${gas}
Opção: ${purchaseType}
Valor de referência: ${price}

Gostaria de confirmar disponibilidade, entrega e condições para finalizar a compra.`;
  }

  /* =========================================================
     COMPRAR
  ========================================================= */

  $("#buyWhatsApp")
    ?.addEventListener(
      "click",
      () => {
        window.open(
          waUrl(
            purchaseMessage(
              false
            )
          ),
          "_blank",
          "noopener"
        );
      }
    );

  /* =========================================================
     INSTALAÇÃO
  ========================================================= */

  $("#installationQuote")
    ?.addEventListener(
      "click",
      () => {
        window.open(
          waUrl(
            purchaseMessage(
              true
            )
          ),
          "_blank",
          "noopener"
        );
      }
    );

  /* =========================================================
     WHATSAPP GERAL
  ========================================================= */

  const generalMessage =
    `Olá! Vim pelo site da Quality Therm e gostaria de informações sobre o ${product.name}.`;

  [
    $("#headerWhatsapp"),
    $("#floatingWhatsapp"),
  ].forEach(
    (element) => {
      if (!element) {
        return;
      }

      element.href =
        waUrl(
          generalMessage
        );

      element.target =
        "_blank";

      element.rel =
        "noopener";
    }
  );

  /* =========================================================
     CARDS DE COMPRA
  ========================================================= */

  $$(
    'input[name="purchaseType"]'
  ).forEach(
    (input) => {
      input.addEventListener(
        "change",
        () => {
          $$(".purchase-card")
            .forEach(
              (card) => {
                const radio =
                  card.querySelector(
                    "input"
                  );

                card.classList.toggle(
                  "selected",
                  Boolean(
                    radio
                      ?.checked
                  )
                );
              }
            );
        }
      );
    }
  );

  /* =========================================================
     MENU MOBILE
  ========================================================= */

  const menuBtn =
    $(".menu-toggle");

  const nav =
    $(".nav");

  menuBtn
    ?.addEventListener(
      "click",
      () => {
        if (!nav) {
          return;
        }

        const open =
          nav.classList.toggle(
            "open"
          );

        menuBtn.setAttribute(
          "aria-expanded",
          String(open)
        );
      }
    );

  /* =========================================================
     ANO
  ========================================================= */

  const year =
    $("#year");

  if (year) {
    year.textContent =
      new Date()
        .getFullYear();
  }
})();
