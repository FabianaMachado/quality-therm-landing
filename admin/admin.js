(() => {
  "use strict";

  /* =========================================================
     SELETORES
  ========================================================= */

  const $ = (selector, context = document) => context.querySelector(selector);

  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];

  /* =========================================================
     STORAGE KEYS (Fallback / Legado)
  ========================================================= */

  const REVIEWS_KEY = "qt_admin_reviews";
  const CLIENTS_KEY = "qt_admin_clients";

  /* =========================================================
     FUNÇÕES DE SUPABASE / DADOS
  ========================================================= */

  async function getProducts() {
    if (
      window.QualityThermDB &&
      typeof window.QualityThermDB.getProducts === "function"
    ) {
      return await window.QualityThermDB.getProducts();
    }
    return [];
  }

  async function saveProductToDB(productData) {
    if (
      window.QualityThermDB &&
      typeof window.QualityThermDB.saveProduct === "function"
    ) {
      return await window.QualityThermDB.saveProduct(productData);
    }
    return false;
  }

  async function deleteProductFromDB(id) {
    if (
      window.QualityThermDB &&
      typeof window.QualityThermDB.deleteProduct === "function"
    ) {
      return await window.QualityThermDB.deleteProduct(id);
    }
    return false;
  }

  // Armazenamento local temporário para Reviews e Clientes (se não migrados ainda)
  function getStorage(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function saveStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getReviews() {
    return getStorage(REVIEWS_KEY);
  }

  function saveReviews(reviews) {
    saveStorage(REVIEWS_KEY, reviews);
  }

  function getClients() {
    return getStorage(CLIENTS_KEY);
  }

  function saveClients(clients) {
    saveStorage(CLIENTS_KEY, clients);
  }

  /* =========================================================
     UTILITÁRIOS
  ========================================================= */

  function generateId() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    return String(Date.now() + Math.random());
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function slugify(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(date) {
    if (!date) return "—";
    const parts = String(date).split("-");
    if (parts.length !== 3) return date;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function todayIso() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function stars(rating) {
    const value = Math.max(1, Math.min(5, Number(rating || 0)));
    return "★".repeat(value) + "☆".repeat(5 - value);
  }

  /* =========================================================
     NORMALIZAR AVALIAÇÕES
  ========================================================= */

  function normalizeReview(review) {
    let status = review.status || "";
    if (!status) {
      status = review.active ? "approved" : "pending";
    }
    return {
      ...review,
      status,
      active: status === "approved",
      featured: Boolean(review.featured),
    };
  }

  function getNormalizedReviews() {
    return getReviews().map(normalizeReview);
  }

  /* =========================================================
     DASHBOARD
  ========================================================= */

  async function renderDashboard() {
    const products = await getProducts();
    const reviews = getNormalizedReviews();

    const totalProducts = products.length;
    const activeProducts = products.filter((product) => product.active).length;
    const featuredProducts = products.filter(
      (product) => product.active && product.featured,
    ).length;
    const inactiveProducts = products.filter(
      (product) => !product.active,
    ).length;

    const totalReviews = reviews.length;
    const pendingReviews = reviews.filter(
      (review) => review.status === "pending",
    ).length;

    if ($("#totalProducts")) $("#totalProducts").textContent = totalProducts;
    if ($("#activeProducts")) $("#activeProducts").textContent = activeProducts;
    if ($("#featuredProducts"))
      $("#featuredProducts").textContent = featuredProducts;
    if ($("#inactiveProducts"))
      $("#inactiveProducts").textContent = inactiveProducts;
    if ($("#dashboardTotalReviews"))
      $("#dashboardTotalReviews").textContent = totalReviews;
    if ($("#dashboardPendingReviews"))
      $("#dashboardPendingReviews").textContent = pendingReviews;

    renderProductsPreview(products);
    renderReviewsPreview(reviews);
  }

  /* =========================================================
     DASHBOARD - PRODUTOS
  ========================================================= */

  function renderProductsPreview(products) {
    const container = $("#productsPreview");
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="admin-empty">
          <strong>Nenhum produto cadastrado.</strong>
          <span>Cadastre seu primeiro produto.</span>
        </div>
      `;
      return;
    }

    const latest = [...products]
      .sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt || 0) -
          new Date(a.created_at || a.createdAt || 0),
      )
      .slice(0, 5);

    container.innerHTML = latest
      .map(
        (product) => `
          <div class="admin-product-row">
            <div class="admin-product-info">
              <div class="admin-product-thumb">
                ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />` : ""}
              </div>
              <div>
                <strong>${escapeHtml(product.name)}</strong>
                <small>${escapeHtml(product.category || "Aquecedores")} • ${escapeHtml(product.brand || "")}</small>
              </div>
            </div>
            <div class="admin-product-price">${formatCurrency(product.price)}</div>
            <span class="admin-status ${product.active ? "admin-status-active" : "admin-status-inactive"}">
              ${product.active ? "Ativo" : "Inativo"}
            </span>
            <a href="produtos.html" class="admin-icon-button">Gerenciar</a>
          </div>
        `,
      )
      .join("");
  }

  /* =========================================================
     DASHBOARD - AVALIAÇÕES
  ========================================================= */

  function renderReviewsPreview(reviews) {
    const container = $("#reviewsPreview");
    if (!container) return;

    if (reviews.length === 0) {
      container.innerHTML = `
        <div class="admin-empty">
          <strong>Nenhuma avaliação recebida.</strong>
          <span>As avaliações dos clientes aparecerão aqui.</span>
        </div>
      `;
      return;
    }

    const latest = [...reviews]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date || 0) -
          new Date(a.createdAt || a.date || 0),
      )
      .slice(0, 5);

    container.innerHTML = latest
      .map(
        (review) => `
          <div class="admin-product-row">
            <div>
              <strong>${escapeHtml(review.customerName)}</strong>
              <small style="display:block; margin-top:4px; color:#75848c;">
                ${escapeHtml(String(review.comment || "").slice(0, 80))}
              </small>
            </div>
            <div style="color:#d67d2f; white-space:nowrap;">${stars(review.rating)}</div>
            ${reviewStatusBadge(review)}
            <a href="avaliacoes.html" class="admin-icon-button">Gerenciar</a>
          </div>
        `,
      )
      .join("");
  }

  /* =========================================================
     PRODUTOS - ELEMENTOS
  ========================================================= */

  const productsTableBody = $("#productsTableBody");
  const productsEmpty = $("#productsEmpty");
  const productSearch = $("#productSearch");
  const productCategoryFilters = $$(".admin-category-filter");
  let activeProductCategory = "todos";

  const productModal = $("#productModal");
  const productForm = $("#productForm");
  const productModalTitle = $("#productModalTitle");

  const productImageFile = $("#productImageFile");
  const productImage = $("#productImage");
  const productImagePreview = $("#productImagePreview");
  const productImagePreviewWrap = $("#productImagePreviewWrap");
  const productImageFileName = $("#productImageFileName");

  function showProductImagePreview(image) {
    if (!productImagePreview || !productImagePreviewWrap) return;
    if (!image) {
      productImagePreview.src = "";
      productImagePreviewWrap.hidden = true;
      if (productImageFileName)
        productImageFileName.textContent = "Nenhuma imagem selecionada";
      return;
    }
    productImagePreview.src = image;
    productImagePreviewWrap.hidden = false;
  }

  productImageFile?.addEventListener("change", () => {
    const file = productImageFile.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Escolha uma imagem JPG, PNG ou WebP.");
      productImageFile.value = "";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = String(reader.result || "");
      if (productImage) productImage.value = result;
      if (productImageFileName) productImageFileName.textContent = file.name;
      showProductImagePreview(result);
    });
    reader.readAsDataURL(file);
  });

  $("#removeProductImage")?.addEventListener("click", () => {
    if (productImage) productImage.value = "";
    if (productImageFile) productImageFile.value = "";
    showProductImagePreview("");
  });

  const newProductButtons = [
    $("#newProductButton"),
    $("#newProductButtonSecondary"),
  ].filter(Boolean);
  const productCloseButtons = [
    $("#productModalClose"),
    $("#productModalBackdrop"),
    $("#productCancelButton"),
  ].filter(Boolean);

  function openProductModal(product = null) {
    if (!productModal) return;
    productModal.hidden = false;
    document.body.style.overflow = "hidden";

    if (product) {
      productModalTitle.textContent = "Editar produto";
      fillProductForm(product);
    } else {
      productModalTitle.textContent = "Novo produto";
      productForm.reset();
      $("#productId").value = "";
      $("#productCategory").value = "Aquecedores";
      $("#productActive").checked = true;
      $("#productFeatured").checked = false;
      $("#productBestSeller").checked = false;
      $("#productPromotion").checked = false;

      if (productImage) productImage.value = "";
      if (productImageFile) productImageFile.value = "";
      showProductImagePreview("");

      nameInput?.removeAttribute("data-manual");
      slugInput?.removeAttribute("data-manual");
    }

    setTimeout(() => {
      $("#productBrand")?.focus();
    }, 50);
  }

  function closeProductModal() {
    if (!productModal) return;
    productModal.hidden = true;
    document.body.style.overflow = "";
  }

  newProductButtons.forEach((btn) =>
    btn.addEventListener("click", () => openProductModal()),
  );
  productCloseButtons.forEach((btn) =>
    btn.addEventListener("click", closeProductModal),
  );

  const brandInput = $("#productBrand");
  const modelInput = $("#productModel");
  const nameInput = $("#productName");
  const slugInput = $("#productSlug");

  function updateAutoProductFields() {
    const brand = brandInput?.value.trim() || "";
    const model = modelInput?.value.trim() || "";

    if (nameInput && !nameInput.dataset.manual) {
      nameInput.value = `${brand} ${model}`.trim();
    }
    if (slugInput && !slugInput.dataset.manual) {
      slugInput.value = slugify(`${brand}-${model}`);
    }
  }

  brandInput?.addEventListener("input", updateAutoProductFields);
  modelInput?.addEventListener("input", updateAutoProductFields);
  nameInput?.addEventListener("input", () => {
    nameInput.dataset.manual = "true";
  });
  slugInput?.addEventListener("input", () => {
    slugInput.dataset.manual = "true";
  });

  function fillProductForm(product) {
    $("#productId").value = product.id || "";
    $("#productCategory").value = product.category || "Aquecedores";
    $("#productSubcategory").value = product.subcategory || "";
    $("#productBrand").value = product.brand || "";
    $("#productModel").value = product.model || "";
    $("#productName").value = product.name || "";
    $("#productSku").value = product.sku || "";
    $("#productSlug").value = product.slug || "";
    $("#productFlow").value = product.flow || "";
    $("#productPrice").value = product.price ?? "";
    $("#productCashPrice").value =
      product.cash_price ?? product.cashPrice ?? "";
    $("#productShortDescription").value =
      product.short_description || product.shortDescription || "";
    $("#productDescription").value = product.description || "";

    $("#productGasGN").checked = Boolean(product.gas_gn ?? product.gasGN);
    $("#productGasGLP").checked = Boolean(product.gas_glp ?? product.gasGLP);
    $("#productActive").checked = Boolean(product.active);
    $("#productFeatured").checked = Boolean(product.featured);
    $("#productBestSeller").checked = Boolean(
      product.best_seller ?? product.bestSeller,
    );
    $("#productPromotion").checked = Boolean(product.promotion);

    if (productImage) productImage.value = product.image || "";
    if (productImageFile) productImageFile.value = "";
    if (productImageFileName) {
      productImageFileName.textContent = product.image
        ? "Imagem cadastrada"
        : "Nenhuma imagem selecionada";
    }
    showProductImagePreview(product.image || "");

    if (nameInput) nameInput.dataset.manual = "true";
    if (slugInput) slugInput.dataset.manual = "true";
  }

  /* =========================================================
     SALVAR PRODUTO NO SUPABASE
  ========================================================= */

  productForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(productForm);
    const id = String(data.get("id") || "").trim();

    const productData = {
      name: String(data.get("name") || "").trim(),
      category: String(data.get("category") || "Aquecedores").trim(),
      subcategory: String(data.get("subcategory") || "").trim(),
      brand: String(data.get("brand") || "").trim(),
      model: String(data.get("model") || "").trim(),
      sku: String(data.get("sku") || "").trim(),
      slug: slugify(data.get("slug") || ""),
      flow: String(data.get("flow") || "").trim(),
      price: Number(data.get("price") || 0),
      cash_price: Number(data.get("cashPrice") || 0),
      image: String(data.get("image") || "").trim(),
      short_description: String(data.get("shortDescription") || "").trim(),
      description: String(data.get("description") || "").trim(),
      gas_gn: data.get("gasGN") === "on",
      gas_glp: data.get("gasGLP") === "on",
      active: data.get("active") === "on",
      featured: data.get("featured") === "on",
      best_seller: data.get("bestSeller") === "on",
      promotion: data.get("promotion") === "on",
    };

    if (id) {
      productData.id = id;
    }

    if (!productData.name || !productData.category) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const success = await saveProductToDB(productData);
    if (success) {
      closeProductModal();
      await renderProductsTable();
      await renderDashboard();
    }
  });

  /* =========================================================
     TABELA DE PRODUTOS
  ========================================================= */

  async function renderProductsTable() {
    if (!productsTableBody) return;

    const products = await getProducts();
    const term = String(productSearch?.value || "")
      .toLowerCase()
      .trim();

    const filtered = products.filter((product) => {
      const searchable = `
        ${product.name || ""}
        ${product.category || ""}
        ${product.subcategory || ""}
        ${product.brand || ""}
        ${product.model || ""}
        ${product.sku || ""}
        ${product.slug || ""}
      `.toLowerCase();

      const matchesSearch = searchable.includes(term);
      const matchesCategory =
        activeProductCategory === "todos" ||
        product.category === activeProductCategory;

      return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
      productsTableBody.innerHTML = "";
      if (productsEmpty) productsEmpty.hidden = false;
      return;
    }

    if (productsEmpty) productsEmpty.hidden = true;

    productsTableBody.innerHTML = filtered
      .map(
        (product) => `
          <tr>
            <td>
              <div class="admin-product-info">
                <div class="admin-product-thumb">
                  ${
                    product.image
                      ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />`
                      : `<span style="font-size:10px; color:#89969c;">SEM FOTO</span>`
                  }
                </div>
                <div>
                  <strong>${escapeHtml(product.name)}</strong>
                  <small>${escapeHtml(product.sku || "Sem SKU")}</small>
                </div>
              </div>
            </td>
            <td>
              <strong>${escapeHtml(product.category || "Aquecedores")}</strong>
              ${product.subcategory ? `<br /><small style="color:#75848c;">${escapeHtml(product.subcategory)}</small>` : ""}
            </td>
            <td>${escapeHtml(product.brand || "—")}</td>
            <td>${escapeHtml(product.flow || "—")}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>
              <span class="admin-status ${product.active ? "admin-status-active" : "admin-status-inactive"}">
                ${product.active ? "Ativo" : "Inativo"}
              </span>
            </td>
            <td>${product.featured ? "★ Sim" : "—"}</td>
            <td>
              <div class="admin-actions">
                <button type="button" class="admin-icon-button js-edit-product" data-id="${escapeHtml(product.id)}">Editar</button>
                <button type="button" class="admin-icon-button danger js-delete-product" data-id="${escapeHtml(product.id)}">Excluir</button>
              </div>
            </td>
          </tr>
        `,
      )
      .join("");

    bindProductActions();
  }

  productSearch?.addEventListener("input", renderProductsTable);

  productCategoryFilters.forEach((button) => {
    button.addEventListener("click", () => {
      productCategoryFilters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeProductCategory = button.dataset.category || "todos";
      renderProductsTable();
    });
  });

  async function bindProductActions() {
    const products = await getProducts();

    $$(".js-edit-product").forEach((button) => {
      button.addEventListener("click", () => {
        const product = products.find((item) => item.id === button.dataset.id);
        if (product) openProductModal(product);
      });
    });

    $$(".js-delete-product").forEach((button) => {
      button.addEventListener("click", async () => {
        const product = products.find((item) => item.id === button.dataset.id);
        if (!product) return;

        if (!confirm(`Excluir "${product.name}"?`)) return;

        const success = await deleteProductFromDB(product.id);
        if (success) {
          await renderProductsTable();
          await renderDashboard();
        }
      });
    });
  }

  /* =========================================================
     AVALIAÇÕES & CLIENTES (Mantidas no Storage por enquanto)
  ========================================================= */

  const reviewsTableBody = $("#reviewsTableBody");
  const reviewsEmpty = $("#reviewsEmpty");
  const reviewSearch = $("#reviewSearch");
  const reviewModal = $("#reviewModal");
  const reviewForm = $("#reviewForm");
  const reviewModalTitle = $("#reviewModalTitle");

  function reviewStatusBadge(review) {
    if (review.status === "approved") {
      return `<span class="admin-status admin-status-active">Aprovada</span>`;
    }
    if (review.status === "inactive") {
      return `<span class="admin-status admin-status-inactive">Inativa</span>`;
    }
    return `<span class="admin-status" style="background:#fff4df; color:#b66a16;">Pendente</span>`;
  }

  function renderReviewStats() {
    const reviews = getNormalizedReviews();
    const total = reviews.length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    const featured = reviews.filter(
      (r) => r.status === "approved" && r.featured,
    ).length;
    const average =
      total > 0
        ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / total
        : 0;

    if ($("#totalReviews")) $("#totalReviews").textContent = total;
    if ($("#activeReviews")) $("#activeReviews").textContent = approved;
    if ($("#featuredReviews")) $("#featuredReviews").textContent = featured;
    if ($("#averageReviews"))
      $("#averageReviews").textContent = average.toFixed(1).replace(".", ",");
  }

  function renderReviewsTable() {
    if (!reviewsTableBody) return;
    const reviews = getNormalizedReviews();
    const term = String(reviewSearch?.value || "")
      .toLowerCase()
      .trim();

    const filtered = reviews.filter((review) => {
      const searchable = `
        ${review.customerName}
        ${review.comment}
        ${review.source}
        ${review.status}
      `.toLowerCase();
      return searchable.includes(term);
    });

    if (filtered.length === 0) {
      reviewsTableBody.innerHTML = "";
      if (reviewsEmpty) reviewsEmpty.hidden = false;
      renderReviewStats();
      return;
    }

    if (reviewsEmpty) reviewsEmpty.hidden = true;

    reviewsTableBody.innerHTML = filtered
      .map(
        (review) => `
          <tr>
            <td>
              <strong>${escapeHtml(review.customerName)}</strong>
            </td>
            <td style="color:#d67d2f; white-space:nowrap;">${stars(review.rating)}</td>
            <td>${escapeHtml(review.source || "Site")}</td>
            <td>${escapeHtml(formatDate(review.date))}</td>
            <td>${reviewStatusBadge(review)}</td>
            <td>
              <div class="admin-actions">
                <button type="button" class="admin-icon-button danger js-delete-review" data-id="${escapeHtml(review.id)}">Excluir</button>
              </div>
            </td>
          </tr>
        `,
      )
      .join("");

    renderReviewStats();
  }

  reviewSearch?.addEventListener("input", renderReviewsTable);

  /* =========================================================
     INICIALIZAÇÃO DO PAINEL
  ========================================================= */

  async function initAdmin() {
    await renderDashboard();
    await renderProductsTable();
    renderReviewStats();
    renderReviewsTable();
  }

  document.addEventListener("DOMContentLoaded", initAdmin);
})();
