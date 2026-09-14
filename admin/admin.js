document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  console.log("✅ QUALITY THERM ADMIN.JS - UNIFICADO E CORRIGIDO");

  const db = window.initQualityThermSupabase
    ? window.initQualityThermSupabase()
    : window.supabaseClient;

  // =========================================================
  // FUNÇÃO GENÉRICA PARA MODAIS (Abre e Fecha com segurança)
  // =========================================================
  function setupModal(modalId, openBtnIds, closeBtnIds) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const openBtns = openBtnIds
      .flatMap((id) => [
        document.getElementById(id),
        ...document.querySelectorAll(`.${id}`),
      ])
      .filter(Boolean);

    const closeElements = closeBtnIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    function open(e) {
      if (e) e.preventDefault();
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      const form = modal.querySelector("form");
      if (form) form.reset();
    }

    function close(e) {
      if (e) e.preventDefault();
      modal.hidden = true;
      document.body.style.overflow = "";
    }

    openBtns.forEach((btn) => btn.addEventListener("click", open));
    closeElements.forEach((el) => el.addEventListener("click", close));

    // Fechar clicando no fundo escuro (backdrop)
    const backdrop = modal.querySelector(".admin-modal-backdrop");
    if (backdrop) backdrop.addEventListener("click", close);
  }

  // Configura os modais das 3 páginas
  setupModal(
    "productModal",
    ["newProductButton", "newProductButtonSecondary"],
    ["productModalClose", "productCancelButton"],
  );
  setupModal(
    "reviewModal",
    ["newReviewButton", "newReviewButtonSecondary"],
    ["reviewModalClose", "reviewCancelButton"],
  );
  setupModal(
    "clientModal",
    ["newClientButton", "newClientButtonSecondary"],
    ["clientModalClose", "clientCancelButton"],
  );

  // Fechar com ESC
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      ["productModal", "reviewModal", "clientModal"].forEach((id) => {
        const m = document.getElementById(id);
        if (m) m.hidden = true;
      });
      document.body.style.overflow = "";
    }
  });

  // =========================================================
  // SALVAR PRODUTO NO SUPABASE
  // =========================================================
  const productForm = document.getElementById("productForm");
  productForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!db) {
      alert("Erro: Supabase não conectado.");
      return;
    }

    const formData = new FormData(productForm);
    const productData = {
      name: formData.get("name"),
      category: formData.get("category"),
      brand: formData.get("brand"),
      model: formData.get("model") || null,
      price: parseFloat(formData.get("price") || 0),
      cash_price: parseFloat(formData.get("cashPrice") || 0),
      sku: formData.get("sku") || null,
      slug: formData.get("slug"),
      flow: formData.get("flow") || null,
      description: formData.get("description") || null,
      short_description: formData.get("shortDescription") || null,
      image: formData.get("image") || null,
      gas_gn: formData.get("gasGN") === "on",
      gas_glp: formData.get("gasGLP") === "on",
      active: formData.get("active") === "on",
      featured: formData.get("featured") === "on",
      best_seller: formData.get("bestSeller") === "on",
      promotion: formData.get("promotion") === "on",
    };

    try {
      const { error } = await db.from("products").insert([productData]);
      if (error) throw error;

      alert("Produto cadastrado com sucesso!");
      document.getElementById("productModal").hidden = true;
      document.body.style.overflow = "";
      productForm.reset();
      location.reload(); // Atualiza a página para mostrar o produto
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar produto: " + (err.message || err));
    }
  });
});
