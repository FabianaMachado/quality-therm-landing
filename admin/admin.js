document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  console.log("✅ QUALITY THERM ADMIN.JS - UPLOAD DE IMAGEM ATIVO");

  const db = window.initQualityThermSupabase
    ? window.initQualityThermSupabase()
    : window.supabaseClient;

  // =========================================================
  // CONFIGURAÇÕES
  // =========================================================

  const STORAGE_BUCKET = "product-images";

  // 800 KB
  const MAX_IMAGE_SIZE = 800 * 1024;

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  // =========================================================
  // PRÉ-VISUALIZAÇÃO DA IMAGEM DO PRODUTO
  // =========================================================

  const productImageFile = document.getElementById("productImageFile");

  const productImageFileName = document.getElementById("productImageFileName");

  if (productImageFile) {
    productImageFile.addEventListener("change", () => {
      const file = productImageFile.files?.[0];

      if (!file) {
        if (productImageFileName) {
          productImageFileName.textContent = "Nenhuma imagem selecionada";
        }

        return;
      }

      // Valida formato
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        alert("Formato inválido. Escolha uma imagem JPG, PNG ou WebP.");

        productImageFile.value = "";

        if (productImageFileName) {
          productImageFileName.textContent = "Nenhuma imagem selecionada";
        }

        return;
      }

      // Valida tamanho
      if (file.size > MAX_IMAGE_SIZE) {
        alert("A imagem deve ter no máximo 800 KB.");

        productImageFile.value = "";

        if (productImageFileName) {
          productImageFileName.textContent = "Nenhuma imagem selecionada";
        }

        return;
      }

      // Mostra nome do arquivo
      if (productImageFileName) {
        productImageFileName.textContent = file.name;
      }

      // Procura uma prévia já existente
      let preview = document.getElementById("productImagePreview");

      // Se não existir, cria automaticamente
      if (!preview) {
        preview = document.createElement("img");

        preview.id = "productImagePreview";

        preview.alt = "Pré-visualização do produto";

        preview.style.width = "160px";

        preview.style.height = "160px";

        preview.style.objectFit = "contain";

        preview.style.display = "block";

        preview.style.marginTop = "12px";

        preview.style.padding = "8px";

        preview.style.border = "1px solid #d8dee2";

        preview.style.borderRadius = "12px";

        preview.style.background = "#ffffff";

        productImageFileName.insertAdjacentElement("afterend", preview);
      }

      // Cria a prévia local
      const reader = new FileReader();

      reader.onload = (event) => {
        preview.src = event.target.result;

        preview.hidden = false;
      };

      reader.readAsDataURL(file);
    });
  }

  // =========================================================
  // FUNÇÃO GENÉRICA PARA MODAIS
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

      if (form) {
        form.reset();
      }

      // Limpa a pré-visualização da imagem
      if (modalId === "productModal") {
        const imagePreview = document.getElementById("productImagePreview");

        const imageFileName = document.getElementById("productImageFileName");

        if (imagePreview) {
          imagePreview.src = "";
          imagePreview.hidden = true;
        }

        if (imageFileName) {
          imageFileName.textContent = "Nenhuma imagem selecionada";
        }
      }
    }

    function close(e) {
      if (e) e.preventDefault();

      modal.hidden = true;

      document.body.style.overflow = "";
    }

    openBtns.forEach((btn) => {
      btn.addEventListener("click", open);
    });

    closeElements.forEach((el) => {
      el.addEventListener("click", close);
    });

    const backdrop = modal.querySelector(".admin-modal-backdrop");

    if (backdrop) {
      backdrop.addEventListener("click", close);
    }
  }

  // =========================================================
  // CONFIGURA OS MODAIS
  // =========================================================

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

  // =========================================================
  // FECHAR MODAL COM ESC
  // =========================================================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      ["productModal", "reviewModal", "clientModal"].forEach((id) => {
        const modal = document.getElementById(id);

        if (modal) {
          modal.hidden = true;
        }
      });

      document.body.style.overflow = "";
    }
  });

  // =========================================================
  // FUNÇÃO PARA CRIAR NOME SEGURO PARA A IMAGEM
  // =========================================================

  function criarNomeImagem(file) {
    const extensao = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const nomeUnico = `${Date.now()}-${crypto.randomUUID()}.${extensao}`;

    return `products/${nomeUnico}`;
  }

  // =========================================================
  // VALIDAR IMAGEM
  // =========================================================

  function validarImagem(file) {
    if (!file) {
      throw new Error("Escolha uma imagem para o produto.");
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Formato inválido. Utilize JPG, PNG ou WebP.");
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("A imagem deve ter no máximo 800 KB.");
    }

    return true;
  }

  // =========================================================
  // UPLOAD DA IMAGEM PARA O SUPABASE STORAGE
  // =========================================================

  async function enviarImagem(file) {
    validarImagem(file);

    const caminhoImagem = criarNomeImagem(file);

    console.log("📤 Enviando imagem:", caminhoImagem);

    const { data: uploadData, error: uploadError } = await db.storage
      .from(STORAGE_BUCKET)
      .upload(caminhoImagem, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("❌ Erro no upload:", uploadError);

      throw new Error(
        "Não foi possível enviar a imagem: " + uploadError.message,
      );
    }

    console.log("✅ Imagem enviada:", uploadData);

    // =======================================================
    // PEGA A URL PÚBLICA DA IMAGEM
    // =======================================================

    const { data: publicUrlData } = db.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(caminhoImagem);

    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      throw new Error(
        "A imagem foi enviada, mas não foi possível gerar a URL pública.",
      );
    }

    console.log("🌐 URL da imagem:", publicUrl);

    return {
      publicUrl,
      path: caminhoImagem,
    };
  }

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

    // =====================================================
    // PEGA O ARQUIVO ESCOLHIDO
    // =====================================================

    const imageFile = formData.get("image");

    let imagemEnviada = null;

    // =====================================================
    // BOTÃO SALVAR
    // =====================================================

    const saveButton = productForm.querySelector('button[type="submit"]');

    const originalButtonText = saveButton?.textContent || "Salvar produto";

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Enviando imagem...";
    }

    try {
      // ===================================================
      // 1. VALIDA E ENVIA A IMAGEM
      // ===================================================

      if (!(imageFile instanceof File) || !imageFile.size) {
        throw new Error("Escolha uma imagem para o produto.");
      }

      imagemEnviada = await enviarImagem(imageFile);

      if (saveButton) {
        saveButton.textContent = "Salvando produto...";
      }

      // ===================================================
      // 2. MONTA OS DADOS DO PRODUTO
      // ===================================================

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

        color: formData.get("color") || null,

        installments: formData.get("installments")
          ? parseInt(formData.get("installments"), 10)
          : null,

        installment_value: formData.get("installmentValue")
          ? parseFloat(
              String(formData.get("installmentValue")).replace(",", "."),
            )
          : null,

        installment_text: formData.get("installmentText") || null,

        home_price_type: formData.get("homePriceType") || "pix",

        description: formData.get("description") || null,

        short_description: formData.get("shortDescription") || null,

        // ===============================================
        // AGORA SALVAMOS A URL, NÃO O ARQUIVO
        // ===============================================

        image: imagemEnviada.publicUrl,

        gas_gn: formData.get("gasGN") === "on",

        gas_glp: formData.get("gasGLP") === "on",

        active: formData.get("active") === "on",

        featured: formData.get("featured") === "on",

        best_seller: formData.get("bestSeller") === "on",

        promotion: formData.get("promotion") === "on",
      };

      console.log("📦 Produto a cadastrar:", productData);

      // ===================================================
      // 3. SALVA O PRODUTO
      // ===================================================

      const { data, error } = await db
        .from("products")
        .insert([productData])
        .select();

      if (error) {
        throw error;
      }

      console.log("✅ Produto cadastrado:", data);

      alert("Produto cadastrado com sucesso!");

      const productModal = document.getElementById("productModal");

      if (productModal) {
        productModal.hidden = true;
      }

      document.body.style.overflow = "";

      productForm.reset();

      // Atualiza para mostrar o produto
      location.reload();
    } catch (err) {
      console.error("❌ Erro ao salvar produto:", err);

      // ===================================================
      // SE A IMAGEM SUBIU MAS O PRODUTO NÃO FOI SALVO,
      // REMOVE A IMAGEM PARA NÃO DEIXAR ARQUIVO ÓRFÃO.
      // ===================================================

      if (imagemEnviada?.path) {
        try {
          await db.storage.from(STORAGE_BUCKET).remove([imagemEnviada.path]);

          console.log("🧹 Imagem removida após falha no cadastro.");
        } catch (removeError) {
          console.error("Não foi possível remover a imagem:", removeError);
        }
      }

      alert("Erro ao salvar produto: " + (err.message || err));
    } finally {
      if (saveButton) {
        saveButton.disabled = false;

        saveButton.textContent = originalButtonText;
      }
    }
  });
  // =========================================================
  // CARREGAR PRODUTOS CADASTRADOS DO SUPABASE
  // =========================================================

  async function carregarProdutos() {
    const tableBody = document.getElementById("productsTableBody");
    const emptyState = document.getElementById("productsEmpty");

    // Esta função só roda na página produtos.html
    if (!tableBody || !db) return;

    try {
      const { data: products, error } = await db
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Atualiza os indicadores
      const totalProducts = document.getElementById("totalProducts");
      const activeProducts = document.getElementById("activeProducts");
      const featuredProducts = document.getElementById("featuredProducts");
      const inactiveProducts = document.getElementById("inactiveProducts");

      if (totalProducts) {
        totalProducts.textContent = products.length;
      }

      if (activeProducts) {
        activeProducts.textContent = products.filter(
          (product) => product.active,
        ).length;
      }

      if (featuredProducts) {
        featuredProducts.textContent = products.filter(
          (product) => product.featured,
        ).length;
      }

      if (inactiveProducts) {
        inactiveProducts.textContent = products.filter(
          (product) => !product.active,
        ).length;
      }

      // Nenhum produto cadastrado
      if (!products.length) {
        tableBody.innerHTML = "";

        if (emptyState) {
          emptyState.hidden = false;
        }

        return;
      }

      if (emptyState) {
        emptyState.hidden = true;
      }

      // Monta a tabela
      tableBody.innerHTML = products
        .map((product) => {
          const price = Number(product.price || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });

          return `
            <tr>
              <td>
                <strong>${product.name || "-"}</strong>
                <br>
                <small>${product.model || ""}</small>
              </td>

              <td>${product.category || "-"}</td>

              <td>${product.brand || "-"}</td>

              <td>${product.flow || "-"}</td>

              <td>${price}</td>

              <td>
                ${product.active ? "Ativo" : "Inativo"}
              </td>

              <td>
                ${product.featured ? "Sim" : "Não"}
              </td>

              <td>
                <button
                  type="button"
                  class="admin-button"
                  data-product-id="${product.id}"
                >
                  Editar
                </button>
              </td>
            </tr>
          `;
        })
        .join("");

      console.log("✅ Produtos carregados:", products);
    } catch (error) {
      console.error("❌ Erro ao carregar produtos:", error);

      tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            Não foi possível carregar os produtos.
          </td>
        </tr>
      `;
    }
  }

  carregarProdutos();
});
