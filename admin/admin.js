document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  console.log("✅ QUALITY THERM ADMIN - PRODUTOS + GALERIA + WEBP");

  const db = window.initQualityThermSupabase
    ? window.initQualityThermSupabase()
    : window.supabaseClient;

  // =========================================================
  // CONFIGURAÇÕES
  // =========================================================

  const STORAGE_BUCKET = "product-images";

  // Arquivo ORIGINAL selecionado pelo usuário.
  // Depois ele será reduzido antes de chegar ao Storage.
  const MAX_SOURCE_IMAGE_SIZE = 15 * 1024 * 1024; // 15 MB

  // Dimensão máxima da imagem otimizada.
  const MAX_IMAGE_DIMENSION = 1600;

  // Qualidade WebP: 82%.
  const WEBP_QUALITY = 0.82;

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  // Fotos adicionais selecionadas, mas ainda não salvas.
  let galleryFiles = [];

  // Fotos existentes carregadas da tabela product_images.
  let existingGalleryImages = [];

  // Fotos existentes marcadas para exclusão.
  let galleryImagesToDelete = [];

  // =========================================================
  // ELEMENTOS DAS IMAGENS
  // =========================================================

  const productImageFile = document.getElementById("productImageFile");

  const productImageFileName = document.getElementById("productImageFileName");

  const productImagePreview = document.getElementById("productImagePreview");

  const productImagePreviewWrap = document.getElementById(
    "productImagePreviewWrap",
  );

  const removeProductImage = document.getElementById("removeProductImage");

  const productGalleryFiles = document.getElementById("productGalleryFiles");

  const productGalleryFileName = document.getElementById(
    "productGalleryFileName",
  );

  const productGalleryPreview = document.getElementById(
    "productGalleryPreview",
  );

  const productGalleryExisting = document.getElementById(
    "productGalleryExisting",
  );

  // =========================================================
  // UTILITÁRIOS
  // =========================================================

  function escaparHtml(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatarBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return "0 KB";
    }

    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function validarImagemOriginal(file) {
    if (!file) {
      throw new Error("Escolha uma imagem.");
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(
        `O arquivo "${file.name}" não é válido. Utilize JPG, PNG ou WebP.`,
      );
    }

    if (file.size > MAX_SOURCE_IMAGE_SIZE) {
      throw new Error(`A imagem "${file.name}" ultrapassa o limite de 15 MB.`);
    }

    return true;
  }

  function gerarNomeWebP(prefixo = "product") {
    return `${prefixo}-${Date.now()}-${crypto.randomUUID()}.webp`;
  }

  function criarCaminhoStorage(prefixo = "products") {
    return `${prefixo}/${gerarNomeWebP("image")}`;
  }

  // =========================================================
  // CARREGAR IMAGEM NO NAVEGADOR
  // =========================================================

  function carregarImagemLocal(file) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);

        reject(
          new Error(`Não foi possível processar a imagem "${file.name}".`),
        );
      };

      image.src = objectUrl;
    });
  }

  // =========================================================
  // OTIMIZAÇÃO: REDIMENSIONAR + CONVERTER PARA WEBP
  // =========================================================

  async function otimizarImagem(file) {
    validarImagemOriginal(file);

    const image = await carregarImagemLocal(file);

    const originalWidth = image.naturalWidth || image.width;

    const originalHeight = image.naturalHeight || image.height;

    if (!originalWidth || !originalHeight) {
      throw new Error(
        `Não foi possível identificar as dimensões de "${file.name}".`,
      );
    }

    let width = originalWidth;
    let height = originalHeight;

    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      const scale = Math.min(
        MAX_IMAGE_DIMENSION / width,
        MAX_IMAGE_DIMENSION / height,
      );

      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      alpha: true,
    });

    if (!context) {
      throw new Error("Seu navegador não conseguiu preparar a imagem.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error("Não foi possível converter a imagem para WebP."));
          }
        },
        "image/webp",
        WEBP_QUALITY,
      );
    });

    const optimizedFile = new File([blob], gerarNomeWebP("qualitytherm"), {
      type: "image/webp",
      lastModified: Date.now(),
    });

    console.log(
      `🖼️ ${file.name}: ${formatarBytes(file.size)} → ${formatarBytes(
        optimizedFile.size,
      )} | ${originalWidth}x${originalHeight} → ${width}x${height}`,
    );

    return optimizedFile;
  }

  // =========================================================
  // UPLOAD PARA O SUPABASE STORAGE
  // =========================================================

  async function enviarImagem(file, pasta = "products") {
    const optimizedFile = await otimizarImagem(file);

    const caminhoImagem = criarCaminhoStorage(pasta);

    console.log("📤 Enviando imagem otimizada:", caminhoImagem);

    const { data: uploadData, error: uploadError } = await db.storage
      .from(STORAGE_BUCKET)
      .upload(caminhoImagem, optimizedFile, {
        // Nome único permite cache longo.
        cacheControl: "31536000",
        upsert: false,
        contentType: "image/webp",
      });

    if (uploadError) {
      console.error("❌ Erro no upload:", uploadError);

      throw new Error(
        "Não foi possível enviar a imagem: " + uploadError.message,
      );
    }

    const { data: publicUrlData } = db.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(caminhoImagem);

    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      // Tenta limpar o arquivo se a URL falhar.
      await db.storage.from(STORAGE_BUCKET).remove([caminhoImagem]);

      throw new Error(
        "A imagem foi enviada, mas não foi possível gerar sua URL pública.",
      );
    }

    console.log("✅ Imagem otimizada enviada:", uploadData);

    return {
      publicUrl,
      path: caminhoImagem,
      originalSize: file.size,
      optimizedSize: optimizedFile.size,
    };
  }

  // =========================================================
  // PREVIEW DA IMAGEM PRINCIPAL
  // =========================================================

  productImageFile?.addEventListener("change", () => {
    const file = productImageFile.files?.[0];

    if (!file) {
      if (productImageFileName) {
        productImageFileName.textContent = "Nenhuma imagem selecionada";
      }

      return;
    }

    try {
      validarImagemOriginal(file);
    } catch (error) {
      alert(error.message);

      productImageFile.value = "";

      if (productImageFileName) {
        productImageFileName.textContent = "Nenhuma imagem selecionada";
      }

      return;
    }

    if (productImageFileName) {
      productImageFileName.textContent = `${file.name} (${formatarBytes(file.size)})`;
    }

    const objectUrl = URL.createObjectURL(file);

    if (productImagePreview) {
      productImagePreview.src = objectUrl;

      productImagePreview.hidden = false;

      productImagePreview.onload = () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    if (productImagePreviewWrap) {
      productImagePreviewWrap.hidden = false;
    }
  });

  // =========================================================
  // REMOVER SELEÇÃO DA IMAGEM PRINCIPAL
  // =========================================================

  removeProductImage?.addEventListener("click", () => {
    if (productImageFile) {
      productImageFile.value = "";
    }

    if (productImageFileName) {
      productImageFileName.textContent = "Nenhuma imagem selecionada";
    }

    if (productImagePreview) {
      productImagePreview.src = "";
      productImagePreview.hidden = true;
    }

    if (productImagePreviewWrap) {
      productImagePreviewWrap.hidden = true;
    }

    /*
     * IMPORTANTE:
     * Não apagamos productImage.value aqui.
     *
     * Se estivermos editando um produto, clicar
     * neste botão apenas cancela a nova seleção.
     * A imagem já salva continua preservada.
     */
  });

  // =========================================================
  // GALERIA - RENDERIZAR NOVAS FOTOS
  // =========================================================

  function renderizarGaleriaNova() {
    if (!productGalleryPreview) return;

    productGalleryPreview.innerHTML = "";

    if (!galleryFiles.length) {
      productGalleryPreview.hidden = true;

      if (productGalleryFileName) {
        productGalleryFileName.textContent =
          "Nenhuma foto adicional selecionada";
      }

      return;
    }

    productGalleryPreview.hidden = false;

    if (productGalleryFileName) {
      productGalleryFileName.textContent =
        galleryFiles.length === 1
          ? "1 foto adicional selecionada"
          : `${galleryFiles.length} fotos adicionais selecionadas`;
    }

    galleryFiles.forEach((file, index) => {
      const card = document.createElement("div");

      card.className = "admin-gallery-item";

      const image = document.createElement("img");

      const objectUrl = URL.createObjectURL(file);

      image.src = objectUrl;
      image.alt = `Nova foto ${index + 1}`;
      image.loading = "lazy";

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
      };

      const info = document.createElement("small");

      info.textContent = `${file.name} • ${formatarBytes(file.size)}`;

      const removeButton = document.createElement("button");

      removeButton.type = "button";
      removeButton.className = "admin-button";
      removeButton.textContent = "Remover";

      removeButton.addEventListener("click", () => {
        galleryFiles.splice(index, 1);

        renderizarGaleriaNova();
      });

      card.append(image, info, removeButton);

      productGalleryPreview.appendChild(card);
    });
  }

  // =========================================================
  // GALERIA - SELEÇÃO DE ARQUIVOS
  // =========================================================

  productGalleryFiles?.addEventListener("change", () => {
    const selectedFiles = Array.from(productGalleryFiles.files || []);

    if (!selectedFiles.length) {
      return;
    }

    try {
      selectedFiles.forEach(validarImagemOriginal);
    } catch (error) {
      alert(error.message);
      productGalleryFiles.value = "";
      return;
    }

    /*
     * Acrescenta novas fotos à seleção.
     * Isso permite clicar novamente em
     * "Adicionar fotos" sem perder as anteriores.
     */
    galleryFiles.push(...selectedFiles);

    productGalleryFiles.value = "";

    renderizarGaleriaNova();
  });

  // =========================================================
  // GALERIA - FOTOS JÁ SALVAS
  // =========================================================

  function renderizarGaleriaExistente() {
    if (!productGalleryExisting) {
      return;
    }

    productGalleryExisting.innerHTML = "";

    if (!existingGalleryImages.length) {
      productGalleryExisting.hidden = true;
      return;
    }

    productGalleryExisting.hidden = false;

    existingGalleryImages.forEach((galleryImage, index) => {
      const card = document.createElement("div");

      card.className = "admin-gallery-item";

      const image = document.createElement("img");

      image.src = galleryImage.image_url || "";
      image.alt = `Foto cadastrada ${index + 1}`;
      image.loading = "lazy";

      const info = document.createElement("small");

      info.textContent = `Foto ${index + 1}`;

      const removeButton = document.createElement("button");

      removeButton.type = "button";
      removeButton.className = "admin-button";
      removeButton.textContent = "Remover";

      removeButton.addEventListener("click", () => {
        const confirmed = confirm("Remover esta foto da galeria?");

        if (!confirmed) return;

        galleryImagesToDelete.push(galleryImage);

        existingGalleryImages = existingGalleryImages.filter(
          (item) => item.id !== galleryImage.id,
        );

        renderizarGaleriaExistente();
      });

      card.append(image, info, removeButton);

      productGalleryExisting.appendChild(card);
    });
  }

  // =========================================================
  // LIMPAR ESTADO DA GALERIA
  // =========================================================

  function limparGaleriaFormulario() {
    galleryFiles = [];
    existingGalleryImages = [];
    galleryImagesToDelete = [];

    if (productGalleryFiles) {
      productGalleryFiles.value = "";
    }

    if (productGalleryFileName) {
      productGalleryFileName.textContent = "Nenhuma foto adicional selecionada";
    }

    if (productGalleryPreview) {
      productGalleryPreview.innerHTML = "";
      productGalleryPreview.hidden = true;
    }

    if (productGalleryExisting) {
      productGalleryExisting.innerHTML = "";
      productGalleryExisting.hidden = true;
    }
  }

  // =========================================================
  // CARREGAR GALERIA DO PRODUTO
  // =========================================================

  async function carregarGaleriaProduto(productId) {
    existingGalleryImages = [];
    galleryImagesToDelete = [];

    if (!productId || !db) {
      renderizarGaleriaExistente();
      return;
    }

    const { data, error } = await db
      .from("product_images")
      .select("id, product_id, image_url, storage_path, sort_order, created_at")
      .eq("product_id", productId)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("Erro ao carregar galeria:", error);

      throw new Error("Não foi possível carregar a galeria deste produto.");
    }

    existingGalleryImages = data || [];

    renderizarGaleriaExistente();
  }

  // =========================================================
  // EXCLUIR FOTOS MARCADAS
  // =========================================================

  async function excluirFotosMarcadas() {
    if (!galleryImagesToDelete.length) {
      return;
    }

    for (const galleryImage of galleryImagesToDelete) {
      /*
       * Primeiro excluímos a linha.
       * Se der erro, não apagamos o arquivo.
       */
      const { error: rowError } = await db
        .from("product_images")
        .delete()
        .eq("id", galleryImage.id);

      if (rowError) {
        throw new Error(
          "Não foi possível remover uma foto da galeria: " + rowError.message,
        );
      }

      /*
       * Depois tentamos remover o arquivo físico.
       * Se falhar, o produto continua consistente;
       * apenas poderá ficar um arquivo órfão no Storage.
       */
      if (galleryImage.storage_path) {
        const { error: storageError } = await db.storage
          .from(STORAGE_BUCKET)
          .remove([galleryImage.storage_path]);

        if (storageError) {
          console.warn(
            "A linha foi removida, mas o arquivo não pôde ser excluído:",
            storageError,
          );
        }
      }
    }

    galleryImagesToDelete = [];
  }

  // =========================================================
  // UPLOAD DAS NOVAS FOTOS DA GALERIA
  // =========================================================

  async function salvarNovasFotosGaleria(productId) {
    if (!galleryFiles.length) {
      return [];
    }

    const uploadedItems = [];

    const startingOrder = existingGalleryImages.length;

    try {
      for (let index = 0; index < galleryFiles.length; index += 1) {
        const file = galleryFiles[index];

        const upload = await enviarImagem(file, "products/gallery");

        uploadedItems.push({
          upload,
          rowId: null,
        });

        const { data, error } = await db
          .from("product_images")
          .insert([
            {
              product_id: productId,
              image_url: upload.publicUrl,
              storage_path: upload.path,
              sort_order: startingOrder + index,
            },
          ])
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        uploadedItems[uploadedItems.length - 1].rowId = data.id;
      }

      return uploadedItems;
    } catch (error) {
      /*
       * Rollback das imagens desta tentativa.
       */
      for (const item of uploadedItems) {
        if (item.rowId) {
          await db.from("product_images").delete().eq("id", item.rowId);
        }

        if (item.upload?.path) {
          await db.storage.from(STORAGE_BUCKET).remove([item.upload.path]);
        }
      }

      throw new Error(
        "Não foi possível salvar a galeria: " + (error.message || error),
      );
    }
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

      if (modalId === "productModal") {
        const modalTitle = document.getElementById("productModalTitle");

        const productId = document.getElementById("productId");

        const existingImage = document.getElementById("productImage");

        if (modalTitle) {
          modalTitle.textContent = "Novo produto";
        }

        if (productId) {
          productId.value = "";
        }

        if (existingImage) {
          existingImage.value = "";
        }

        if (productImageFile) {
          productImageFile.value = "";
        }

        if (productImageFileName) {
          productImageFileName.textContent = "Nenhuma imagem selecionada";
        }

        if (productImagePreview) {
          productImagePreview.src = "";
          productImagePreview.hidden = true;
        }

        if (productImagePreviewWrap) {
          productImagePreviewWrap.hidden = true;
        }

        limparGaleriaFormulario();
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

    backdrop?.addEventListener("click", close);
  }

  // =========================================================
  // CONFIGURA MODAIS
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
    if (event.key !== "Escape") {
      return;
    }

    ["productModal", "reviewModal", "clientModal"].forEach((id) => {
      const modal = document.getElementById(id);

      if (modal) {
        modal.hidden = true;
      }
    });

    document.body.style.overflow = "";
  });

  // =========================================================
  // SALVAR PRODUTO
  // =========================================================

  const productForm = document.getElementById("productForm");

  productForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!db) {
      alert("Erro: Supabase não conectado.");
      return;
    }

    const formData = new FormData(productForm);

    const productId = formData.get("id");

    const isEditing = Boolean(productId);

    const imageFile = formData.get("image");

    const saveButton = productForm.querySelector('button[type="submit"]');

    const originalButtonText = saveButton?.textContent || "Salvar produto";

    let mainImageUploaded = null;

    let savedProductId = productId || null;

    // Indica se o INSERT/UPDATE do produto já foi concluído.
    // Evita apagar a imagem principal caso um erro aconteça
    // posteriormente durante o processamento da galeria.
    let productWasSaved = false;

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Preparando imagens...";
    }

    try {
      // ===============================================
      // 1. IMAGEM PRINCIPAL
      // ===============================================

      let imageUrl = formData.get("existingImage") || null;

      if (imageFile instanceof File && imageFile.size) {
        if (saveButton) {
          saveButton.textContent = "Otimizando imagem principal...";
        }

        mainImageUploaded = await enviarImagem(imageFile, "products/main");

        imageUrl = mainImageUploaded.publicUrl;
      } else if (!isEditing) {
        throw new Error("Escolha uma imagem principal para o produto.");
      }

      // ===============================================
      // 2. DADOS DO PRODUTO
      // ===============================================

      const productData = {
        name: formData.get("name"),

        category: formData.get("category"),

        subcategory: formData.get("subcategory") || null,

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

        availability: formData.get("availability") || "consult",

        description: formData.get("description") || null,

        short_description: formData.get("shortDescription") || null,

        image: imageUrl,

        gas_gn: formData.get("gasGN") === "on",

        gas_glp: formData.get("gasGLP") === "on",

        active: formData.get("active") === "on",

        featured: formData.get("featured") === "on",

        best_seller: formData.get("bestSeller") === "on",

        promotion: formData.get("promotion") === "on",
      };

      if (saveButton) {
        saveButton.textContent = "Salvando produto...";
      }

      // ===============================================
      // 3. INSERT / UPDATE
      // ===============================================

      let savedProduct;

      if (isEditing) {
        const { data, error } = await db
          .from("products")
          .update(productData)
          .eq("id", productId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        savedProduct = data;
      } else {
        const { data, error } = await db
          .from("products")
          .insert([productData])
          .select()
          .single();

        if (error) {
          throw error;
        }

        savedProduct = data;
      }

      savedProductId = savedProduct?.id || productId;

      // A partir daqui o produto já está salvo no banco.
      // Portanto, a imagem principal não deve mais ser
      // removida automaticamente em caso de erro na galeria.
      productWasSaved = true;

      if (!savedProductId) {
        throw new Error(
          "O produto foi salvo, mas não foi possível identificar seu ID.",
        );
      }

      // ===============================================
      // 4. REMOVE FOTOS MARCADAS
      // ===============================================

      if (galleryImagesToDelete.length) {
        if (saveButton) {
          saveButton.textContent = "Atualizando galeria...";
        }

        await excluirFotosMarcadas();
      }

      // ===============================================
      // 5. NOVAS FOTOS DA GALERIA
      // ===============================================

      if (galleryFiles.length) {
        if (saveButton) {
          saveButton.textContent = `Otimizando ${galleryFiles.length} foto(s)...`;
        }

        await salvarNovasFotosGaleria(savedProductId);
      }

      console.log("✅ Produto salvo:", savedProduct);

      alert(
        isEditing
          ? "Produto atualizado com sucesso!"
          : "Produto cadastrado com sucesso!",
      );

      const productModal = document.getElementById("productModal");

      if (productModal) {
        productModal.hidden = true;
      }

      document.body.style.overflow = "";

      productForm.reset();

      limparGaleriaFormulario();

      location.reload();
    } catch (error) {
      console.error("❌ Erro ao salvar produto:", error);

      /*
       * Se a imagem principal foi enviada,
       * mas o produto não conseguiu ser salvo,
       * removemos o novo arquivo.
       *
       * Em edição, não apagamos a imagem antiga.
       */
      if (mainImageUploaded?.path && !productWasSaved) {
        try {
          await db.storage
            .from(STORAGE_BUCKET)
            .remove([mainImageUploaded.path]);

          console.log("🧹 Nova imagem principal removida após falha.");
        } catch (removeError) {
          console.error("Não foi possível limpar a nova imagem:", removeError);
        }
      }

      alert("Erro ao salvar produto: " + (error.message || error));
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = originalButtonText;
      }
    }
  });

  // =========================================================
  // CARREGAR PRODUTOS
  // =========================================================

  async function carregarProdutos() {
    const tableBody = document.getElementById("productsTableBody");

    const emptyState = document.getElementById("productsEmpty");

    if (!tableBody || !db) {
      return;
    }

    try {
      const { data, error } = await db
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const products = data || [];

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

      if (!products.length) {
        tableBody.innerHTML = "";

        if (emptyState) {
          emptyState.hidden = false;
          emptyState.style.display = "";
        }

        return;
      }

      if (emptyState) {
        emptyState.hidden = true;
        emptyState.style.display = "none";
      }

      tableBody.innerHTML = products
        .map((product) => {
          const price = Number(product.price || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });

          return `
              <tr>
                <td>
                  <strong>${escaparHtml(product.name || "-")}</strong>
                  <br>
                  <small>${escaparHtml(product.model || "")}</small>
                </td>

                <td>${escaparHtml(product.category || "-")}</td>

                <td>${escaparHtml(product.brand || "-")}</td>

                <td>${escaparHtml(product.flow || "-")}</td>

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
                    data-product-id="${escaparHtml(product.id)}"
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

  // =========================================================
  // ABRIR PRODUTO PARA EDIÇÃO
  // =========================================================

  document
    .getElementById("productsTableBody")
    ?.addEventListener("click", async (event) => {
      const editButton = event.target.closest("[data-product-id]");

      if (!editButton) return;

      const productId = editButton.dataset.productId;

      try {
        const { data: product, error } = await db
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) {
          throw error;
        }

        // Limpa seleções anteriores.
        galleryFiles = [];
        galleryImagesToDelete = [];

        if (productGalleryFiles) {
          productGalleryFiles.value = "";
        }

        if (productGalleryPreview) {
          productGalleryPreview.innerHTML = "";
          productGalleryPreview.hidden = true;
        }

        if (productGalleryFileName) {
          productGalleryFileName.textContent =
            "Nenhuma foto adicional selecionada";
        }

        // ===============================================
        // CAMPOS
        // ===============================================

        document.getElementById("productId").value = product.id || "";

        document.getElementById("productCategory").value =
          product.category || "";

        document.getElementById("productSubcategory").value =
          product.subcategory || "";

        document.getElementById("productBrand").value = product.brand || "";

        document.getElementById("productModel").value = product.model || "";

        document.getElementById("productName").value = product.name || "";

        document.getElementById("productSku").value = product.sku || "";

        document.getElementById("productSlug").value = product.slug || "";

        document.getElementById("productFlow").value = product.flow || "";

        document.getElementById("productColor").value = product.color || "";

        document.getElementById("productPrice").value = product.price ?? "";

        document.getElementById("productCashPrice").value =
          product.cash_price ?? "";

        document.getElementById("productHomePriceType").value =
          product.home_price_type || "pix";

        document.getElementById("productInstallments").value =
          product.installments ?? "";

        document.getElementById("productInstallmentValue").value =
          product.installment_value ?? "";

        document.getElementById("productInstallmentText").value =
          product.installment_text || "";

        document.getElementById("productAvailability").value =
          product.availability || "consult";

        document.getElementById("productShortDescription").value =
          product.short_description || "";

        document.getElementById("productDescription").value =
          product.description || "";

        // ===============================================
        // CHECKBOXES
        // ===============================================

        document.getElementById("productGasGN").checked = Boolean(
          product.gas_gn,
        );

        document.getElementById("productGasGLP").checked = Boolean(
          product.gas_glp,
        );

        document.getElementById("productActive").checked = Boolean(
          product.active,
        );

        document.getElementById("productFeatured").checked = Boolean(
          product.featured,
        );

        document.getElementById("productBestSeller").checked = Boolean(
          product.best_seller,
        );

        document.getElementById("productPromotion").checked = Boolean(
          product.promotion,
        );

        // ===============================================
        // IMAGEM PRINCIPAL EXISTENTE
        // ===============================================

        const existingImage = document.getElementById("productImage");

        if (existingImage) {
          existingImage.value = product.image || "";
        }

        if (productImageFile) {
          productImageFile.value = "";
        }

        if (productImageFileName) {
          productImageFileName.textContent = "Nenhuma nova imagem selecionada";
        }

        if (product.image && productImagePreview) {
          productImagePreview.src = product.image;

          productImagePreview.hidden = false;

          if (productImagePreviewWrap) {
            productImagePreviewWrap.hidden = false;
          }
        } else {
          if (productImagePreview) {
            productImagePreview.src = "";
            productImagePreview.hidden = true;
          }

          if (productImagePreviewWrap) {
            productImagePreviewWrap.hidden = true;
          }
        }

        // ===============================================
        // GALERIA EXISTENTE
        // ===============================================

        await carregarGaleriaProduto(product.id);

        // ===============================================
        // MODAL
        // ===============================================

        const modalTitle = document.getElementById("productModalTitle");

        if (modalTitle) {
          modalTitle.textContent = "Editar produto";
        }

        const modal = document.getElementById("productModal");

        if (modal) {
          modal.hidden = false;
        }

        document.body.style.overflow = "hidden";
      } catch (error) {
        console.error("Erro ao carregar produto:", error);

        alert(
          "Não foi possível carregar este produto para edição: " +
            (error.message || error),
        );
      }
    });

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  carregarProdutos();
});
