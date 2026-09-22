(() => {
  "use strict";

  const cfg = window.QT_CONFIG || {};

  const $ = (selector, context = document) => context.querySelector(selector);

  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];

  const db = window.initQualityThermSupabase
    ? window.initQualityThermSupabase()
    : window.supabaseClient;

  /* =========================================================
     UTILITÁRIOS
  ========================================================= */

  function getSlug() {
    const params = new URLSearchParams(window.location.search);

    return String(params.get("produto") || "")
      .trim()
      .toLowerCase();
  }

  function money(value) {
    const number = Number(value || 0);

    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function text(value, fallback = "—") {
    const result = String(value ?? "").trim();

    return result || fallback;
  }

  function setText(selector, value) {
    const element = $(selector);

    if (element) {
      element.textContent = value;
    }
  }

  function show(selector) {
    const element = $(selector);

    if (element) {
      element.hidden = false;
    }
  }

  function hide(selector) {
    const element = $(selector);

    if (element) {
      element.hidden = true;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

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

  function selectedValue(name) {
    return $(`input[name="${name}"]:checked`)?.value || "";
  }

  /* =========================================================
     GÁS
  ========================================================= */

  function gasText(product) {
    const gases = [];

    if (product.gas_gn) {
      gases.push("GN");
    }

    if (product.gas_glp) {
      gases.push("GLP");
    }

    return gases.join(" / ") || "Consulte";
  }

  /* =========================================================
     CATEGORIA
  ========================================================= */

  function categoryLabel(product) {
    return text(product.category, "Produto");
  }

  function productEyebrow(product) {
    const parts = [];

    if (product.brand) {
      parts.push(product.brand);
    }

    if (product.category) {
      parts.push(product.category);
    }

    return parts.join(" • ") || "Produto";
  }

  /* =========================================================
     IMAGEM
  ========================================================= */

  function fallbackImage() {
    return "../assets/favicon.svg";
  }

  function principalImage(product) {
    return String(product.image || "").trim() || fallbackImage();
  }

  /* =========================================================
     BUSCAR PRODUTO NO SUPABASE
  ========================================================= */

  async function getProduct(slug) {
    if (!db || !slug) {
      return null;
    }

    const { data, error } = await db
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar produto:", error);

      throw error;
    }

    return data || null;
  }

  /* =========================================================
     BUSCAR GALERIA
  ========================================================= */

  async function getProductImages(productId) {
    if (!db || !productId) {
      return [];
    }

    const { data, error } = await db
      .from("product_images")
      .select("id, image_url, storage_path, sort_order")
      .eq("product_id", productId)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("Erro ao carregar galeria:", error);

      return [];
    }

    return data || [];
  }

  /* =========================================================
     GALERIA
  ========================================================= */

  function renderGallery(product, galleryImages) {
    const mainImage = $("#productMainImage");
    const mainImageWrap = $("#productMainImageWrap");
    const thumbnails = $("#productThumbnails");
    const prevButton = $("#productGalleryPrev");
    const nextButton = $("#productGalleryNext");

    if (!mainImage || !thumbnails) {
      return;
    }

    const images = [];

    const principal = principalImage(product);

    if (principal) {
      images.push({
        url: principal,
        label: "Imagem principal",
      });
    }

    galleryImages.forEach((image, index) => {
      const url = String(image.image_url || "").trim();

      if (!url) {
        return;
      }

      /*
       * Evita repetir a imagem principal
       * caso ela também esteja cadastrada
       * em product_images.
       */
      if (images.some((item) => item.url === url)) {
        return;
      }

      images.push({
        url,
        label: `Imagem ${index + 2}`,
      });
    });

    if (!images.length) {
      images.push({
        url: fallbackImage(),
        label: "Produto",
      });
    }

    let currentIndex = 0;

    /*
     * Atualiza a imagem principal
     * e sincroniza a miniatura ativa.
     */
    function updateGallery(index, scrollThumbnail = true) {
      if (!images.length) {
        return;
      }

      /*
       * Faz a navegação circular:
       * depois da última volta para a primeira;
       * antes da primeira volta para a última.
       */
      currentIndex = (index + images.length) % images.length;

      const currentImage = images[currentIndex];

      mainImage.src = currentImage.url;

      mainImage.alt = `${product.name || "Produto"} - ${currentImage.label}`;

      const buttons = $$(".product-thumbnail", thumbnails);

      buttons.forEach((button, buttonIndex) => {
        const active = buttonIndex === currentIndex;

        button.classList.toggle("active", active);

        button.setAttribute("aria-current", active ? "true" : "false");
      });

      /*
       * Quando navegamos pelas setas,
       * mantém a miniatura selecionada visível.
       */
      if (scrollThumbnail) {
        const activeButton = buttons[currentIndex];

        activeButton?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }

    /*
     * Primeira imagem exibida.
     */
    mainImage.src = images[0].url;

    mainImage.alt = product.name || "Produto";

    /*
     * Se houver somente uma imagem:
     * - esconde miniaturas;
     * - esconde seta anterior;
     * - esconde seta próxima.
     */
    if (images.length <= 1) {
      thumbnails.innerHTML = "";

      thumbnails.hidden = true;

      if (prevButton) {
        prevButton.hidden = true;
      }

      if (nextButton) {
        nextButton.hidden = true;
      }

      return;
    }

    /*
     * Cria as miniaturas.
     */
    thumbnails.innerHTML = images
      .map(
        (image, index) => `
          <button
            type="button"
            class="product-thumbnail ${index === 0 ? "active" : ""}"
            data-image-index="${index}"
            aria-label="${escapeHtml(image.label)}"
            aria-current="${index === 0 ? "true" : "false"}"
          >
            <img
              src="${escapeHtml(image.url)}"
              alt="${escapeHtml(
                `${product.name || "Produto"} - ${image.label}`,
              )}"
              loading="lazy"
              decoding="async"
            />
          </button>
        `,
      )
      .join("");

    thumbnails.hidden = false;

    /*
     * SETA ANTERIOR
     */
    if (prevButton) {
      prevButton.hidden = false;

      prevButton.onclick = () => {
        updateGallery(currentIndex - 1);
      };
    }

    /*
     * SETA PRÓXIMA
     */
    if (nextButton) {
      nextButton.hidden = false;

      nextButton.onclick = () => {
        updateGallery(currentIndex + 1);
      };
    }

    /*
     * CLIQUE NAS MINIATURAS
     */
    $$(".product-thumbnail", thumbnails).forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.imageIndex);

        if (!Number.isInteger(index)) {
          return;
        }

        updateGallery(index, false);
      });
    });

    /*
     * =====================================================
     * DESLIZAR NO CELULAR / TABLET
     * =====================================================
     *
     * Esquerda  -> próxima imagem
     * Direita   -> imagem anterior
     */
    if (mainImageWrap) {
      let touchStartX = 0;

      let touchStartY = 0;

      mainImageWrap.addEventListener(
        "touchstart",
        (event) => {
          const touch = event.changedTouches?.[0];

          if (!touch) {
            return;
          }

          touchStartX = touch.clientX;

          touchStartY = touch.clientY;
        },
        {
          passive: true,
        },
      );

      mainImageWrap.addEventListener(
        "touchend",
        (event) => {
          const touch = event.changedTouches?.[0];

          if (!touch) {
            return;
          }

          const deltaX = touch.clientX - touchStartX;

          const deltaY = touch.clientY - touchStartY;

          /*
           * Evita trocar a imagem quando
           * o usuário estiver apenas rolando
           * a página para cima ou para baixo.
           */
          if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) {
            return;
          }

          /*
           * Arrastou para esquerda.
           */
          if (deltaX < 0) {
            updateGallery(currentIndex + 1);
          } else {

          /*
           * Arrastou para direita.
           */
            updateGallery(currentIndex - 1);
          }
        },
        {
          passive: true,
        },
      );
    }

    /*
     * Inicializa a galeria
     * na primeira imagem.
     */
    updateGallery(0, false);
  }

  /* =========================================================
     PREÇOS
  ========================================================= */

  function renderPrices(product) {
    const normalPrice = Number(product.price || 0);

    const pixPrice = Number(product.cash_price || 0);

    const homePriceType = String(
      product.home_price_type || "normal",
    ).toLowerCase();

    let displayedPrice = normalPrice;
    let priceLabel = "Preço do produto";

    /*
     * Se o produto estiver configurado
     * para destacar PIX e existir preço PIX,
     * ele será o preço principal.
     */
    if (homePriceType === "pix" && pixPrice > 0) {
      displayedPrice = pixPrice;
      priceLabel = "Preço no PIX";
    }

    setText("#productPrice", money(displayedPrice));

    setText("#productPriceLabel", priceLabel);

    /*
     * O card "Somente equipamento"
     * acompanha o preço principal escolhido.
     */
    setText("#equipmentPrice", money(displayedPrice));

    /*
     * Não exibimos um segundo preço PIX
     * quando PIX já é o preço principal.
     */
    const cashElement = $("#productCashPrice");

    // Exibimos apenas um preço principal:
    // PIX quando configurado como PIX;
    // normal quando configurado como normal.
    if (cashElement) {
      cashElement.textContent = "";
      cashElement.hidden = true;
    }

    /* PARCELAMENTO */

    const installmentElement = $("#productInstallment");

    if (!installmentElement) {
      return;
    }

    const installments = Number(product.installments || 0);

    const installmentValue = Number(product.installment_value || 0);

    const customInstallmentText = String(product.installment_text || "").trim();

    if (customInstallmentText) {
      installmentElement.textContent = customInstallmentText;

      installmentElement.hidden = false;

      return;
    }

    if (installments > 0 && installmentValue > 0) {
      installmentElement.textContent = `Ou em até ${installments}x de ${money(
        installmentValue,
      )} sem juros no cartão de crédito`;

      installmentElement.hidden = false;

      return;
    }

    installmentElement.textContent = "";
    installmentElement.hidden = true;
  }

  function referencePrice(product) {
    const normalPrice = Number(product.price || 0);

    const pixPrice = Number(product.cash_price || 0);

    const type = String(product.home_price_type || "normal").toLowerCase();

    if (type === "pix" && pixPrice > 0) {
      return pixPrice;
    }

    return normalPrice;
  }

  /* =========================================================
     BADGES
  ========================================================= */

  function renderBadges(product) {
    const badges = [];

    if (product.best_seller) {
      badges.push("Mais procurado");
    }

    if (product.promotion) {
      badges.push("Promoção");
    }

    if (product.featured) {
      badges.push("Destaque");
    }

    const gases = gasText(product);

    if (gases !== "Consulte") {
      badges.push(gases);
    }

    const element = $("#productBadges");

    if (!element) {
      return;
    }

    element.innerHTML = badges
      .map((badge) => `<span>${escapeHtml(badge)}</span>`)
      .join("");
  }

  /* =========================================================
     OPÇÕES DE GÁS
  ========================================================= */

  function renderGasOptions(product) {
    const optionGN = $("#optionGN");

    const optionGLP = $("#optionGLP");

    const gasOptions = $("#gasOptions");

    if (optionGN) {
      optionGN.hidden = !product.gas_gn;
    }

    if (optionGLP) {
      optionGLP.hidden = !product.gas_glp;
    }

    /*
     * Para peças/acessórios que não possuem
     * opção GN/GLP, escondemos todo o bloco.
     */
    if (!product.gas_gn && !product.gas_glp) {
      if (gasOptions) {
        gasOptions.hidden = true;
      }

      return;
    }

    if (gasOptions) {
      gasOptions.hidden = false;
    }

    if (product.gas_gn) {
      const input = $('input[name="gas"][value="GN"]');

      if (input) {
        input.checked = true;
      }

      return;
    }

    if (product.gas_glp) {
      const input = $('input[name="gas"][value="GLP"]');

      if (input) {
        input.checked = true;
      }
    }
  }

  /* =========================================================
     PREENCHER PRODUTO
  ========================================================= */

  function renderProduct(product) {
    document.title = `${product.name} | Quality Therm`;

    const descriptionMeta = $("#pageDescription");

    if (descriptionMeta) {
      descriptionMeta.content =
        product.short_description ||
        product.description ||
        `${product.name} na Quality Therm.`;
    }

    setText("#breadcrumbName", text(product.name, "Produto"));

    setText("#productEyebrow", productEyebrow(product));

    setText("#productName", text(product.name, "Produto"));

    const subtitle = [product.model, product.flow, product.color]
      .filter(Boolean)
      .join(" • ");

    setText("#productSubtitle", subtitle);

    renderBadges(product);
    renderPrices(product);
    renderGasOptions(product);

    /* DESCRIÇÃO */

    setText("#informationTitle", text(product.name, "Produto"));

    setText(
      "#productDescription",
      product.description ||
        product.short_description ||
        "Consulte informações deste produto.",
    );

    setText("#featureBrand", `✓ Marca: ${text(product.brand, "Consulte")}`);

    setText("#featureModel", `✓ Modelo: ${text(product.model, "Consulte")}`);

    const featureFlow = $("#featureFlow");

    if (featureFlow) {
      if (product.flow) {
        featureFlow.textContent = `✓ Vazão: ${product.flow}`;

        featureFlow.hidden = false;
      } else {
        featureFlow.hidden = true;
      }
    }

    const featureColor = $("#featureColor");

    if (featureColor) {
      if (product.color) {
        featureColor.textContent = `✓ Cor: ${product.color}`;

        featureColor.hidden = false;
      } else {
        featureColor.hidden = true;
      }
    }

    const featureGas = $("#featureGas");

    if (featureGas) {
      if (product.gas_gn || product.gas_glp) {
        featureGas.textContent = `✓ Gás: ${gasText(product)}`;

        featureGas.hidden = false;
      } else {
        featureGas.hidden = true;
      }
    }

    /* BENEFÍCIOS */

    setText("#benefitFlow", text(product.flow, "Consulte"));

    setText("#benefitGas", gasText(product));

    setText("#benefitSku", text(product.sku, "Consulte"));

    /* FICHA */

    setText("#specCategory", categoryLabel(product));

    setText("#specBrand", text(product.brand));

    setText("#specModel", text(product.model));

    setText("#specColor", text(product.color));

    setText("#specSku", text(product.sku));

    setText("#specFlow", text(product.flow));

    setText("#specGas", gasText(product));

    const availabilityLabels = {
      consult: "Consulte disponibilidade",
      available: "Disponível",
      immediate: "Disponibilidade imediata",
      out_of_stock: "Sem estoque",
    };

    const availability =
      availabilityLabels[product.availability] || "Consulte disponibilidade";

    setText("#featureAvailability", `✓ Disponibilidade: ${availability}`);

    setText("#specAvailability", availability);

    /*
     * Para peças e acessórios sem vazão,
     * o dimensionador não é necessário.
     */
    const help = $("#productHelp");

    if (help) {
      help.hidden = !product.flow;
    }
  }

  /* =========================================================
     MENSAGEM DE COMPRA
  ========================================================= */

  function purchaseMessage(product, forceInstallation = false) {
    const gas =
      selectedValue("gas") ||
      (product.gas_gn || product.gas_glp ? "Não informado" : "Não se aplica");

    const purchaseType = forceInstallation
      ? "equipamento + instalação"
      : selectedValue("purchaseType") || "equipamento";

    const price =
      purchaseType === "equipamento"
        ? money(referencePrice(product))
        : "a confirmar após avaliação";

    const details = [
      `Olá! Vim pelo site da Quality Therm e gostaria de informações para comprar o ${product.name}.`,
      "",
      `Categoria: ${text(product.category, "Não informada")}`,
      `Marca: ${text(product.brand, "Não informada")}`,
      `Modelo: ${text(product.model, "Não informado")}`,
    ];

    if (product.color) {
      details.push(`Cor: ${product.color}`);
    }

    if (product.flow) {
      details.push(`Vazão: ${product.flow}`);
    }

    if (product.gas_gn || product.gas_glp) {
      details.push(`Versão: ${gas}`);
    }

    const finalMessage =
      product.availability === "out_of_stock"
        ? "Vi que este produto está sem estoque. Gostaria de verificar a previsão de reposição ou opções similares com um vendedor."
        : "Gostaria de confirmar disponibilidade, entrega e condições para finalizar a compra.";

    details.push(
      `Opção: ${purchaseType}`,
      `Valor de referência: ${price}`,
      `Disponibilidade: ${
        {
          consult: "Consulte disponibilidade",
          available: "Disponível",
          immediate: "Disponibilidade imediata",
          out_of_stock: "Sem estoque",
        }[product.availability] || "Consulte disponibilidade"
      }`,
      "",
      finalMessage,
    );

    return details.join("\n");
  }

  /* =========================================================
     EVENTOS
  ========================================================= */

  function configureEvents(product) {
    $("#buyWhatsApp")?.addEventListener("click", () => {
      window.open(waUrl(purchaseMessage(product, false)), "_blank", "noopener");
    });

    $("#installationQuote")?.addEventListener("click", () => {
      window.open(waUrl(purchaseMessage(product, true)), "_blank", "noopener");
    });

    const generalMessage = `Olá! Vim pelo site da Quality Therm e gostaria de informações sobre o ${product.name}.`;

    [$("#headerWhatsapp"), $("#floatingWhatsapp")].forEach((element) => {
      if (!element) {
        return;
      }

      element.href = waUrl(generalMessage);

      element.target = "_blank";

      element.rel = "noopener";
    });

    $$('input[name="purchaseType"]').forEach((input) => {
      input.addEventListener("change", () => {
        $$(".purchase-card").forEach((card) => {
          const radio = card.querySelector("input");

          card.classList.toggle("selected", Boolean(radio?.checked));
        });
      });
    });
  }

  /* =========================================================
     MENU MOBILE
  ========================================================= */

  function configureMenu() {
    const menuBtn = $(".menu-toggle");

    const nav = $(".nav");

    menuBtn?.addEventListener("click", () => {
      if (!nav) {
        return;
      }

      const open = nav.classList.toggle("open");

      menuBtn.setAttribute("aria-expanded", String(open));
    });
  }

  /* =========================================================
     ANO
  ========================================================= */

  function configureYear() {
    const year = $("#year");

    if (year) {
      year.textContent = new Date().getFullYear();
    }
  }

  /* =========================================================
     ESTADO DA PÁGINA
  ========================================================= */

  function showProduct() {
    hide("#productLoading");
    hide("#productNotFound");

    [
      "#productContent",
      "#productBenefits",
      "#productInformation",
      "#productSpecs",
      "#productFaq",
    ].forEach(show);
  }

  function showNotFound() {
    hide("#productLoading");

    [
      "#productContent",
      "#productBenefits",
      "#productInformation",
      "#productSpecs",
      "#productFaq",
    ].forEach(hide);

    show("#productNotFound");
  }

  /* =========================================================
     INICIAR
  ========================================================= */

  async function init() {
    configureYear();
    configureMenu();

    const slug = getSlug();

    if (!slug) {
      showNotFound();
      return;
    }

    if (!db) {
      console.error("Supabase não foi inicializado.");

      showNotFound();
      return;
    }

    try {
      /*
       * Primeiro localizamos o produto ativo
       * usando o slug da URL.
       */
      const product = await getProduct(slug);

      if (!product) {
        showNotFound();
        return;
      }

      /*
       * Depois buscamos todas as imagens
       * adicionais vinculadas ao UUID dele.
       */
      const galleryImages = await getProductImages(product.id);

      renderProduct(product);

      renderGallery(product, galleryImages);

      configureEvents(product);

      showProduct();
    } catch (error) {
      console.error("Erro ao carregar página do produto:", error);

      showNotFound();
    }
  }

  init();
})();
