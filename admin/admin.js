document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  console.log("✅ QUALITY THERM ADMIN - PRODUTOS + GALERIA + WEBP");

  const db = window.initQualityThermSupabase
    ? window.initQualityThermSupabase()
    : window.supabaseClient;

  // =========================================================
  // IDIOMA DO PAINEL ADMINISTRATIVO
  // =========================================================

  async function carregarIdiomaAdmin() {
    if (!db || !window.QT_ADMIN_I18N) {
      return "pt-BR";
    }

    try {
      const { data, error } = await db
        .from("site_settings")
        .select("admin_language")
        .eq("id", 1)
        .single();

      if (error) {
        throw error;
      }

      const language = data?.admin_language || "pt-BR";

      window.QT_ADMIN_I18N.setLanguage(language);

      console.log("🌐 Idioma do Admin:", language);

      return language;
    } catch (error) {
      console.error("Erro ao carregar idioma do Admin:", error);

      window.QT_ADMIN_I18N.setLanguage("pt-BR");

      return "pt-BR";
    }
  }

  carregarIdiomaAdmin();

  // Re-renderiza as avaliações caso o idioma mude dinamicamente
  document.addEventListener("qt:adminlanguagechange", () => {
    if (typeof renderizarAvaliacoes === "function") {
      renderizarAvaliacoes();
    }
  });

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

        show_all: formData.get("showAll") === "on",

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

    const productsPreview = document.getElementById("productsPreview");

    const dashboardProductsLimit = document.getElementById(
      "dashboardProductsLimit",
    );

    // O Supabase é necessário tanto na página Produtos
    // quanto no Dashboard.
    if (!db) {
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

      // =====================================================
      // DASHBOARD - CONTADORES
      // =====================================================

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

      // =====================================================
      // DASHBOARD - ÚLTIMOS CADASTRADOS
      // =====================================================
      function renderizarProdutosDashboard() {
        if (!productsPreview) {
          return;
        }

        const i18n = window.QT_ADMIN_I18N;

        const t = (key, variables = {}) => {
          if (!i18n) {
            return key;
          }

          return i18n.t(key, variables);
        };

        // =====================================================
        // NENHUM PRODUTO
        // =====================================================

        if (!products.length) {
          productsPreview.innerHTML = `
      <div class="admin-empty">
        <strong>
          ${t("dashboard.noProducts")}
        </strong>

        <span>
          ${t("dashboard.noProductsDescription")}
        </span>
      </div>
    `;

          return;
        }

        // =====================================================
        // QUANTIDADE DE PRODUTOS
        // =====================================================

        let limit = Number(dashboardProductsLimit?.value || 5);

        const allowedLimits = [5, 10, 20, 50, 100];

        if (!allowedLimits.includes(limit)) {
          limit = 5;
        }

        const recentProducts = products.slice(0, limit);

        // =====================================================
        // IDIOMA
        // =====================================================

        const currentLanguage = i18n?.getLanguage?.() || "pt-BR";

        const brandModelText = {
          "pt-BR": "Marca / Modelo",
          en: "Brand / Model",
          es: "Marca / Modelo",
        };

        const brandModel =
          brandModelText[currentLanguage] || brandModelText["pt-BR"];

        // =====================================================
        // TABELA
        // Mantém a estrutura original do Dashboard
        // =====================================================

        productsPreview.innerHTML = `
    <div class="admin-dashboard-table-wrap">

      <table class="admin-dashboard-table">

        <thead>

          <tr>
            <th>${t("common.image")}</th>
            <th>${t("products.product")}</th>
            <th>${t("products.category")}</th>
            <th>${brandModel}</th>
            <th>${t("products.price")}</th>
            <th>${t("common.status")}</th>
            <th>${t("common.home")}</th>
          </tr>

        </thead>

        <tbody>

          ${recentProducts
            .map((product) => {
              // ===========================================
              // PREÇO
              // ===========================================

              const price = i18n?.formatCurrency
                ? i18n.formatCurrency(Number(product.price || 0))
                : Number(product.price || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });

              // ===========================================
              // DADOS
              // ===========================================

              const productName = escaparHtml(product.name || "-");

              const productCategory = escaparHtml(product.category || "-");

              const productBrand = escaparHtml(product.brand || "-");

              const productModel = escaparHtml(product.model || "");

              const productImage = escaparHtml(product.image || "");

              // ===========================================
              // STATUS
              // ===========================================

              const statusClass = product.active
                ? "admin-status-active"
                : "admin-status-inactive";

              const statusText = product.active
                ? t("common.active")
                : t("common.inactive");

              // ===========================================
              // HOME
              // ===========================================

              const homeClass = product.featured
                ? "admin-dashboard-home-yes"
                : "admin-dashboard-home-no";

              const homeText = product.featured
                ? t("common.yes")
                : t("common.no");

              // ===========================================
              // LINHA DO PRODUTO
              // ===========================================

              return `
                <tr>

                  <td>

                    ${
                      productImage
                        ? `
                          <img
                            src="${productImage}"
                            alt="${productName}"
                            class="admin-dashboard-product-thumb"
                            loading="lazy"
                          />
                        `
                        : `
                          <div class="admin-dashboard-product-thumb admin-dashboard-product-thumb-empty">
                            —
                          </div>
                        `
                    }

                  </td>

                  <td>

                    <strong>
                      ${productName}
                    </strong>

                  </td>

                  <td>
                    ${productCategory}
                  </td>

                  <td>

                    <strong>
                      ${productBrand}
                    </strong>

                    ${
                      productModel
                        ? `
                          <small class="admin-dashboard-product-model">
                            ${productModel}
                          </small>
                        `
                        : ""
                    }

                  </td>

                  <td>

                    <strong class="admin-dashboard-product-price">
                      ${price}
                    </strong>

                  </td>

                  <td>

                    <span
                      class="admin-status ${statusClass}"
                    >
                      ${statusText}
                    </span>

                  </td>

                  <td>

                    <span class="${homeClass}">
                      ${homeText}
                    </span>

                  </td>

                </tr>
              `;
            })
            .join("")}

        </tbody>

      </table>

    </div>

    <div class="admin-dashboard-products-footer">

      <span>
        ${t("dashboard.showing", {
          shown: recentProducts.length,
          total: products.length,
        })}
      </span>

    </div>
  `;
      }
      // Renderização inicial.
      renderizarProdutosDashboard();

      // Quando o usuário mudar:
      // 5 / 10 / 20 / 50 / 100
      dashboardProductsLimit?.addEventListener(
        "change",
        renderizarProdutosDashboard,
      );

      // =====================================================
      // PÁGINA PRODUTOS - TABELA
      // =====================================================

      // No Dashboard não existe productsTableBody.
      // Os contadores e os últimos cadastrados já foram
      // carregados, então podemos encerrar aqui.
      if (!tableBody) {
        console.log("✅ Dashboard atualizado:", products);

        return;
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
              <strong>
                ${escaparHtml(product.name || "-")}
              </strong>

              <br>

              <small>
                ${escaparHtml(product.model || "")}
              </small>
            </td>

            <td>
              ${escaparHtml(product.category || "-")}
            </td>

            <td>
              ${escaparHtml(product.brand || "-")}
            </td>

            <td>
              ${escaparHtml(product.flow || "-")}
            </td>

            <td>
              ${price}
            </td>

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

      if (tableBody) {
        tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            Não foi possível carregar os produtos.
          </td>
        </tr>
      `;
      }

      if (productsPreview) {
        productsPreview.innerHTML = `
        <div class="admin-empty">

          <strong>
            Não foi possível carregar os produtos.
          </strong>

          <span>
            Tente atualizar a página.
          </span>

        </div>
      `;
      }
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

        document.getElementById("productShowAll").checked = Boolean(
          product.show_all,
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
  // AVALIAÇÕES
  // =========================================================

  const reviewForm = document.getElementById("reviewForm");
  const reviewsTableBody = document.getElementById("reviewsTableBody");
  const reviewsEmpty = document.getElementById("reviewsEmpty");
  const reviewSearch = document.getElementById("reviewSearch");

  let reviewsCache = [];

  // =========================================================
  // CALENDÁRIO DAS AVALIAÇÕES
  // =========================================================

  let reviewDatePicker = null;

  const reviewDateInput = document.getElementById("reviewDate");

  if (reviewDateInput && window.flatpickr) {
    reviewDatePicker = flatpickr(reviewDateInput, {
      locale: "pt",
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      allowInput: true,
      maxDate: "today",
      monthSelectorType: "dropdown",
      disableMobile: true,
    });
  }

  // =========================================================
  // ABRIR MODAL DE NOVA AVALIAÇÃO
  // =========================================================

  window.openReviewModal = function () {
    const modal = document.getElementById("reviewModal");

    if (!modal) {
      return;
    }

    reviewForm?.reset();

    const reviewId = document.getElementById("reviewId");
    const modalTitle = document.getElementById("reviewModalTitle");
    const reviewDate = document.getElementById("reviewDate");
    const reviewActive = document.getElementById("reviewActive");

    if (reviewId) {
      reviewId.value = "";
    }

    if (modalTitle) {
      modalTitle.textContent = "Nova avaliação";
    }

    if (reviewDatePicker) {
      reviewDatePicker.setDate(new Date(), true);
    } else if (reviewDate) {
      reviewDate.value = new Date().toISOString().split("T")[0];
    }

    if (reviewActive) {
      reviewActive.checked = true;
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };

  // =========================================================
  // FECHAR MODAL DE AVALIAÇÃO
  // =========================================================

  function fecharModalAvaliacao() {
    const modal = document.getElementById("reviewModal");

    if (modal) {
      modal.hidden = true;
    }

    document.body.style.overflow = "";
  }

  document
    .getElementById("reviewModalClose")
    ?.addEventListener("click", fecharModalAvaliacao);

  document
    .getElementById("reviewCancelButton")
    ?.addEventListener("click", fecharModalAvaliacao);

  document
    .getElementById("reviewModalBackdrop")
    ?.addEventListener("click", fecharModalAvaliacao);

  // =========================================================
  // SALVAR AVALIAÇÃO
  // =========================================================

  reviewForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!db) {
      alert("Erro: Supabase não conectado.");
      return;
    }

    const formData = new FormData(reviewForm);

    const reviewId = formData.get("id");

    const reviewData = {
      customer_name: formData.get("customerName"),
      rating: parseInt(formData.get("rating"), 10),
      source: formData.get("source") || "Google",
      review_date: formData.get("date"),
      comment: formData.get("comment"),
      review_url: formData.get("reviewUrl") || null,
      active: formData.get("active") === "on",
      featured: formData.get("featured") === "on",
      updated_at: new Date().toISOString(),
    };

    const saveButton = reviewForm.querySelector('button[type="submit"]');

    const originalText = saveButton?.textContent || "Salvar avaliação";

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Salvando...";
    }

    try {
      if (reviewId) {
        const { error } = await db
          .from("reviews")
          .update(reviewData)
          .eq("id", reviewId);

        if (error) {
          throw error;
        }

        alert("Avaliação atualizada com sucesso!");
      } else {
        const { error } = await db.from("reviews").insert([reviewData]);

        if (error) {
          throw error;
        }

        alert("Avaliação cadastrada com sucesso!");
      }

      reviewForm.reset();

      fecharModalAvaliacao();

      await carregarAvaliacoes();
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);

      alert("Não foi possível salvar a avaliação: " + (error.message || error));
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = originalText;
      }
    }
  });

  // =========================================================
  // CARREGAR AVALIAÇÕES
  // =========================================================

  async function carregarAvaliacoes() {
    if (!reviewsTableBody || !db) {
      return;
    }

    try {
      const { data, error } = await db
        .from("reviews")
        .select("*")
        .order("review_date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      reviewsCache = data || [];

      atualizarIndicadoresAvaliacoes();

      renderizarAvaliacoes();
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);

      reviewsTableBody.innerHTML = `
        <tr>
          <td colspan="7">
            Não foi possível carregar as avaliações.
          </td>
        </tr>
      `;
    }
  }

  // =========================================================
  // INDICADORES DAS AVALIAÇÕES
  // =========================================================

  function atualizarIndicadoresAvaliacoes() {
    const totalReviews = document.getElementById("totalReviews");
    const activeReviews = document.getElementById("activeReviews");
    const featuredReviews = document.getElementById("featuredReviews");
    const averageReviews = document.getElementById("averageReviews");

    if (totalReviews) {
      totalReviews.textContent = reviewsCache.length;
    }

    const activeCount = reviewsCache.filter((review) => review.active).length;

    if (activeReviews) {
      activeReviews.textContent = activeCount;
    }

    const featuredCount = reviewsCache.filter(
      (review) => review.featured,
    ).length;

    if (featuredReviews) {
      featuredReviews.textContent = featuredCount;
    }

    const ratings = reviewsCache
      .map((review) => Number(review.rating))
      .filter((rating) => Number.isFinite(rating));

    const average =
      ratings.length > 0
        ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
        : 0;

    if (averageReviews) {
      averageReviews.textContent = average.toFixed(1).replace(".", ",");
    }
  }

  // =========================================================
  // RENDERIZAR AVALIAÇÕES
  // =========================================================

  function renderizarAvaliacoes() {
    if (!reviewsTableBody) {
      return;
    }

    const i18n = window.QT_ADMIN_I18N;
    const t = (key) => (i18n ? i18n.t(key) : key);

    const searchTerm = String(reviewSearch?.value || "")
      .trim()
      .toLowerCase();

    const filteredReviews = reviewsCache.filter((review) => {
      if (!searchTerm) {
        return true;
      }

      const searchableText = [
        review.customer_name,
        review.comment,
        review.source,
        review.active ? "aprovada ativo" : "pendente inativo",
        review.featured ? "home destaque" : "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });

    if (!filteredReviews.length) {
      reviewsTableBody.innerHTML = "";

      if (reviewsEmpty) {
        reviewsEmpty.hidden = false;
      }

      return;
    }

    if (reviewsEmpty) {
      reviewsEmpty.hidden = true;
    }

    reviewsTableBody.innerHTML = filteredReviews
      .map((review) => {
        const rating = Math.max(1, Math.min(5, Number(review.rating || 0)));
        const stars = "★".repeat(rating);

        const date = review.review_date
          ? new Date(`${review.review_date}T12:00:00`).toLocaleDateString(
              i18n ? i18n.getLocale() : "pt-BR",
            )
          : "-";

        // Textos dinâmicos baseados no idioma ativo
        const statusText = review.active
          ? t("common.approved")
          : t("common.pending");
        const featuredText = review.featured ? t("common.yes") : t("common.no");
        const editText = t("common.edit");

        return `
          <tr>
            <td>
              <strong>
                ${escaparHtml(review.customer_name || "-")}
              </strong>
              <br>
              <small>
                ${escaparHtml(review.comment || "")}
              </small>
            </td>
            <td>
              ${stars}
            </td>
            <td>
              ${escaparHtml(review.source || "-")}
            </td>
            <td>
              ${date}
            </td>
            <td>
              ${statusText}
            </td>
            <td>
              ${featuredText}
            </td>
            <td>
              <button
                type="button"
                class="admin-button"
                data-review-edit="${escaparHtml(review.id)}"
              >
                ${editText}
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  // =========================================================
  // PESQUISAR AVALIAÇÕES
  // =========================================================

  reviewSearch?.addEventListener("input", () => {
    renderizarAvaliacoes();
  });

  // =========================================================
  // EDITAR AVALIAÇÃO
  // =========================================================

  reviewsTableBody?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-review-edit]");

    if (!editButton) {
      return;
    }

    const reviewId = editButton.dataset.reviewEdit;

    const review = reviewsCache.find(
      (item) => String(item.id) === String(reviewId),
    );

    if (!review) {
      alert("Não foi possível localizar esta avaliação.");
      return;
    }

    document.getElementById("reviewId").value = review.id || "";

    document.getElementById("reviewCustomerName").value =
      review.customer_name || "";

    document.getElementById("reviewRating").value = String(review.rating || 5);

    document.getElementById("reviewSource").value = review.source || "Google";

    if (reviewDatePicker) {
      reviewDatePicker.setDate(review.review_date || "", true);
    } else {
      document.getElementById("reviewDate").value = review.review_date || "";
    }

    document.getElementById("reviewComment").value = review.comment || "";

    document.getElementById("reviewUrl").value = review.review_url || "";

    document.getElementById("reviewActive").checked = Boolean(review.active);

    document.getElementById("reviewFeatured").checked = Boolean(
      review.featured,
    );

    const modalTitle = document.getElementById("reviewModalTitle");

    if (modalTitle) {
      modalTitle.textContent = "Editar avaliação";
    }

    const modal = document.getElementById("reviewModal");

    if (modal) {
      modal.hidden = false;
    }

    document.body.style.overflow = "hidden";
  });

  // =========================================================
  // CLIENTES ATENDIDOS
  // =========================================================

  const clientForm = document.getElementById("clientForm");
  const clientsTableBody = document.getElementById("clientsTableBody");
  const clientsEmpty = document.getElementById("clientsEmpty");
  const clientSearch = document.getElementById("clientSearch");

  const clientLogoFile = document.getElementById("clientLogoFile");
  const clientLogo = document.getElementById("clientLogo");
  const clientLogoPreview = document.getElementById("clientLogoPreview");
  const clientLogoPreviewWrap = document.getElementById(
    "clientLogoPreviewWrap",
  );
  const removeClientLogo = document.getElementById("removeClientLogo");

  let clientsCache = [];
  let currentClientLogoStoragePath = "";
  let removeCurrentClientLogo = false;

  // =========================================================
  // PREVIEW DO LOGO
  // =========================================================

  clientLogoFile?.addEventListener("change", () => {
    const file = clientLogoFile.files?.[0];

    if (!file) {
      return;
    }

    try {
      validarImagemOriginal(file);
    } catch (error) {
      alert(error.message);
      clientLogoFile.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (clientLogoPreview) {
      clientLogoPreview.src = objectUrl;

      clientLogoPreview.onload = () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    if (clientLogoPreviewWrap) {
      clientLogoPreviewWrap.style.display = "flex";
    }

    removeCurrentClientLogo = false;
  });

  // =========================================================
  // REMOVER LOGO
  // =========================================================

  removeClientLogo?.addEventListener("click", () => {
    if (clientLogoFile) {
      clientLogoFile.value = "";
    }

    if (clientLogoPreview) {
      clientLogoPreview.src = "";
    }

    if (clientLogoPreviewWrap) {
      clientLogoPreviewWrap.style.display = "none";
    }

    if (clientLogo) {
      clientLogo.value = "";
    }

    removeCurrentClientLogo = true;
  });

  // =========================================================
  // PREPARAR NOVO CLIENTE
  // =========================================================

  function prepararNovoCliente() {
    if (!clientForm) {
      return;
    }

    clientForm.reset();

    const clientId = document.getElementById("clientId");
    const modalTitle = document.getElementById("clientModalTitle");

    if (clientId) {
      clientId.value = "";
    }

    if (clientLogo) {
      clientLogo.value = "";
    }

    if (clientLogoFile) {
      clientLogoFile.value = "";
    }

    if (clientLogoPreview) {
      clientLogoPreview.src = "";
    }

    if (clientLogoPreviewWrap) {
      clientLogoPreviewWrap.style.display = "none";
    }

    currentClientLogoStoragePath = "";
    removeCurrentClientLogo = false;

    const clientActive = document.getElementById("clientActive");

    if (clientActive) {
      clientActive.checked = true;
    }

    if (modalTitle) {
      modalTitle.textContent = "Novo cliente";
    }
  }

  document
    .getElementById("newClientButton")
    ?.addEventListener("click", prepararNovoCliente);

  document
    .getElementById("newClientButtonSecondary")
    ?.addEventListener("click", prepararNovoCliente);

  // =========================================================
  // SALVAR CLIENTE
  // =========================================================

  clientForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!db) {
      alert("Erro: Supabase não conectado.");
      return;
    }

    const formData = new FormData(clientForm);

    const clientId = formData.get("id");
    const isEditing = Boolean(clientId);

    const selectedLogo = clientLogoFile?.files?.[0] || null;

    const saveButton = clientForm.querySelector('button[type="submit"]');
    const originalText = saveButton?.textContent || "Salvar cliente";

    let newLogoUpload = null;

    try {
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = selectedLogo
          ? "Preparando logo..."
          : "Salvando...";
      }

      let logoUrl = clientLogo?.value || null;
      let logoStoragePath = currentClientLogoStoragePath || null;

      // NOVO LOGO
      if (selectedLogo) {
        newLogoUpload = await enviarImagem(selectedLogo, "clients/logos");

        logoUrl = newLogoUpload.publicUrl;
        logoStoragePath = newLogoUpload.path;
      }

      // LOGO REMOVIDO MANUALMENTE
      if (removeCurrentClientLogo && !selectedLogo) {
        logoUrl = null;
        logoStoragePath = null;
      }

      const clientData = {
        name: formData.get("name"),
        type: formData.get("type"),
        logo: logoUrl,
        logo_storage_path: logoStoragePath,
        url: formData.get("url") || null,
        description: formData.get("description") || null,
        active: formData.get("active") === "on",
        featured: formData.get("featured") === "on",
        updated_at: new Date().toISOString(),
      };

      let savedClient;

      if (isEditing) {
        const { data, error } = await db
          .from("clients")
          .update(clientData)
          .eq("id", clientId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        savedClient = data;
      } else {
        const { data, error } = await db
          .from("clients")
          .insert([clientData])
          .select()
          .single();

        if (error) {
          throw error;
        }

        savedClient = data;
      }

      // Se substituiu ou removeu o logo antigo,
      // apaga o arquivo antigo somente depois do banco salvar.
      if (
        isEditing &&
        currentClientLogoStoragePath &&
        (selectedLogo || removeCurrentClientLogo) &&
        currentClientLogoStoragePath !== savedClient.logo_storage_path
      ) {
        const { error: removeError } = await db.storage
          .from(STORAGE_BUCKET)
          .remove([currentClientLogoStoragePath]);

        if (removeError) {
          console.warn(
            "Cliente salvo, mas o logo antigo não pôde ser removido:",
            removeError,
          );
        }
      }

      alert(
        isEditing
          ? "Cliente atualizado com sucesso!"
          : "Cliente cadastrado com sucesso!",
      );

      const modal = document.getElementById("clientModal");

      if (modal) {
        modal.hidden = true;
      }

      document.body.style.overflow = "";

      prepararNovoCliente();

      await carregarClientes();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);

      // Se o novo logo foi enviado, mas o banco falhou,
      // remove o arquivo recém-enviado.
      if (newLogoUpload?.path) {
        try {
          await db.storage.from(STORAGE_BUCKET).remove([newLogoUpload.path]);
        } catch (cleanupError) {
          console.error(
            "Não foi possível limpar o logo após a falha:",
            cleanupError,
          );
        }
      }

      alert("Não foi possível salvar o cliente: " + (error.message || error));
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = originalText;
      }
    }
  });

  // =========================================================
  // CARREGAR CLIENTES
  // =========================================================

  async function carregarClientes() {
    if (!clientsTableBody || !db) {
      return;
    }

    try {
      const { data, error } = await db
        .from("clients")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      clientsCache = data || [];

      atualizarIndicadoresClientes();
      renderizarClientes();
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);

      clientsTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            Não foi possível carregar os clientes.
          </td>
        </tr>
      `;
    }
  }

  // =========================================================
  // INDICADORES DOS CLIENTES
  // =========================================================

  function atualizarIndicadoresClientes() {
    const totalClients = document.getElementById("totalClients");
    const activeClients = document.getElementById("activeClients");
    const featuredClients = document.getElementById("featuredClients");
    const inactiveClients = document.getElementById("inactiveClients");

    const activeCount = clientsCache.filter((client) => client.active).length;

    const featuredCount = clientsCache.filter(
      (client) => client.featured,
    ).length;

    if (totalClients) {
      totalClients.textContent = clientsCache.length;
    }

    if (activeClients) {
      activeClients.textContent = activeCount;
    }

    if (featuredClients) {
      featuredClients.textContent = featuredCount;
    }

    if (inactiveClients) {
      inactiveClients.textContent = clientsCache.length - activeCount;
    }
  }

  // =========================================================
  // RENDERIZAR CLIENTES
  // =========================================================

  function renderizarClientes() {
    if (!clientsTableBody) {
      return;
    }

    const searchTerm = String(clientSearch?.value || "")
      .trim()
      .toLowerCase();

    const filteredClients = clientsCache.filter((client) => {
      if (!searchTerm) {
        return true;
      }

      return [client.name, client.type, client.description]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);
    });

    if (!filteredClients.length) {
      clientsTableBody.innerHTML = "";

      if (clientsEmpty) {
        clientsEmpty.hidden = false;
      }

      return;
    }

    if (clientsEmpty) {
      clientsEmpty.hidden = true;
    }

    clientsTableBody.innerHTML = filteredClients
      .map((client) => {
        return `
          <tr>

            <td>
              <strong>
                ${escaparHtml(client.name || "-")}
              </strong>
            </td>

            <td>
              ${escaparHtml(client.type || "-")}
            </td>

            <td>
              ${client.active ? "Ativo" : "Inativo"}
            </td>

            <td>
              ${client.featured ? "Sim" : "Não"}
            </td>

            <td>
              <button
                type="button"
                class="admin-button"
                data-client-edit="${escaparHtml(client.id)}"
              >
                Editar
              </button>
            </td>

          </tr>
        `;
      })
      .join("");
  }

  clientSearch?.addEventListener("input", renderizarClientes);

  // =========================================================
  // EDITAR CLIENTE
  // =========================================================

  clientsTableBody?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-client-edit]");

    if (!editButton) {
      return;
    }

    const client = clientsCache.find(
      (item) => String(item.id) === String(editButton.dataset.clientEdit),
    );

    if (!client) {
      alert("Não foi possível localizar este cliente.");
      return;
    }

    document.getElementById("clientId").value = client.id || "";
    document.getElementById("clientName").value = client.name || "";
    document.getElementById("clientType").value = client.type || "";
    document.getElementById("clientUrl").value = client.url || "";

    document.getElementById("clientDescription").value =
      client.description || "";

    document.getElementById("clientActive").checked = Boolean(client.active);

    document.getElementById("clientFeatured").checked = Boolean(
      client.featured,
    );

    if (clientLogo) {
      clientLogo.value = client.logo || "";
    }

    currentClientLogoStoragePath = client.logo_storage_path || "";

    removeCurrentClientLogo = false;

    if (clientLogoFile) {
      clientLogoFile.value = "";
    }

    if (client.logo && clientLogoPreview) {
      clientLogoPreview.src = client.logo;

      if (clientLogoPreviewWrap) {
        clientLogoPreviewWrap.style.display = "flex";
      }
    } else {
      if (clientLogoPreview) {
        clientLogoPreview.src = "";
      }

      if (clientLogoPreviewWrap) {
        clientLogoPreviewWrap.style.display = "none";
      }
    }

    const modalTitle = document.getElementById("clientModalTitle");

    if (modalTitle) {
      modalTitle.textContent = "Editar cliente";
    }

    const modal = document.getElementById("clientModal");

    if (modal) {
      modal.hidden = false;
    }

    document.body.style.overflow = "hidden";
  });

  // =========================================================
  // CONFIGURAÇÕES DO SITE
  // =========================================================

  const companySettingsForm = document.getElementById("companySettingsForm");

  const digitalSettingsForm = document.getElementById("digitalSettingsForm");

  const appearanceSettingsForm = document.getElementById(
    "appearanceSettingsForm",
  );

  const storeSettingsForm = document.getElementById("storeSettingsForm");

  const languageSettingsForm = document.getElementById("languageSettingsForm");

  // =========================================================
  // LOGO DA EMPRESA
  // =========================================================

  const companyLogoFile = document.getElementById("companyLogoFile");
  const companyLogo = document.getElementById("companyLogo");
  const companyLogoFileName = document.getElementById("companyLogoFileName");
  const companyLogoPreview = document.getElementById("companyLogoPreview");
  const companyLogoPreviewWrap = document.getElementById(
    "companyLogoPreviewWrap",
  );
  const removeCompanyLogo = document.getElementById("removeCompanyLogo");

  let siteSettingsId = 1;

  let currentCompanyLogoStoragePath = "";
  let removeCurrentCompanyLogo = false;

  // =========================================================
  // PREVIEW DO LOGO DA EMPRESA
  // =========================================================

  companyLogoFile?.addEventListener("change", () => {
    const file = companyLogoFile.files?.[0];

    if (!file) {
      return;
    }

    try {
      validarImagemOriginal(file);
    } catch (error) {
      alert(error.message);

      companyLogoFile.value = "";

      if (companyLogoFileName) {
        companyLogoFileName.textContent = "Nenhuma imagem selecionada";
      }

      return;
    }

    if (companyLogoFileName) {
      companyLogoFileName.textContent = `${file.name} (${formatarBytes(file.size)})`;
    }

    const objectUrl = URL.createObjectURL(file);

    if (companyLogoPreview) {
      companyLogoPreview.src = objectUrl;

      companyLogoPreview.onload = () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    if (companyLogoPreviewWrap) {
      companyLogoPreviewWrap.hidden = false;
      companyLogoPreviewWrap.style.display = "flex";
    }

    removeCurrentCompanyLogo = false;
  });

  // =========================================================
  // REMOVER LOGO DA EMPRESA
  // =========================================================

  removeCompanyLogo?.addEventListener("click", () => {
    if (companyLogoFile) {
      companyLogoFile.value = "";
    }

    if (companyLogo) {
      companyLogo.value = "";
    }

    if (companyLogoFileName) {
      companyLogoFileName.textContent = "Nenhuma imagem selecionada";
    }

    if (companyLogoPreview) {
      companyLogoPreview.src = "";
    }

    if (companyLogoPreviewWrap) {
      companyLogoPreviewWrap.hidden = true;
      companyLogoPreviewWrap.style.display = "none";
    }

    removeCurrentCompanyLogo = true;
  });

  // =========================================================
  // AUXILIARES DAS CONFIGURAÇÕES
  // =========================================================

  function definirValor(id, valor = "") {
    const element = document.getElementById(id);

    if (element) {
      element.value = valor ?? "";
    }
  }

  function definirCheckbox(id, valor = false) {
    const element = document.getElementById(id);

    if (element) {
      element.checked = Boolean(valor);
    }
  }

  function obterValor(id) {
    const element = document.getElementById(id);

    return element ? String(element.value || "").trim() : "";
  }

  function obterCheckbox(id) {
    const element = document.getElementById(id);

    return element ? element.checked : false;
  }

  // =========================================================
  // CARREGAR CONFIGURAÇÕES DO SUPABASE
  // =========================================================

  async function carregarConfiguracoes() {
    const configuracoesPage =
      companySettingsForm ||
      digitalSettingsForm ||
      appearanceSettingsForm ||
      storeSettingsForm ||
      languageSettingsForm;

    if (!configuracoesPage || !db) {
      return;
    }

    try {
      const { data, error } = await db
        .from("site_settings")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        console.warn("Nenhuma configuração encontrada em site_settings.");
        return;
      }

      siteSettingsId = data.id || 1;

      // -------------------------------------------------------
      // DADOS DA EMPRESA
      // -------------------------------------------------------

      definirValor("companyName", data.company_name);
      definirValor("companyShortName", data.company_short_name);

      definirValor("companyWhatsapp", data.whatsapp);
      definirValor("companyPhone", data.phone);
      definirValor("companyEmail", data.email);

      definirValor("companyCnpj", data.cnpj);
      definirValor("companyZipCode", data.address_zip_code);

      definirValor("companyStreet", data.address_street);
      definirValor("companyNumber", data.address_number);
      definirValor("companyComplement", data.address_complement);
      definirValor("companyNeighborhood", data.address_neighborhood);
      definirValor("companyCity", data.address_city);
      definirValor("companyState", data.address_state);

      definirCheckbox("showCnpj", data.show_cnpj);
      definirCheckbox("showAddress", data.show_address);

      // -------------------------------------------------------
      // PRESENÇA DIGITAL
      // -------------------------------------------------------

      definirValor("companyLogo", data.logo_url);

      currentCompanyLogoStoragePath = data.logo_storage_path || "";

      removeCurrentCompanyLogo = false;

      if (data.logo_url) {
        if (companyLogoPreview) {
          companyLogoPreview.src = data.logo_url;
        }

        if (companyLogoPreviewWrap) {
          companyLogoPreviewWrap.hidden = false;
          companyLogoPreviewWrap.style.display = "flex";
        }

        if (companyLogoFileName) {
          companyLogoFileName.textContent = "Logo atual";
        }
      } else {
        if (companyLogoPreview) {
          companyLogoPreview.src = "";
        }

        if (companyLogoPreviewWrap) {
          companyLogoPreviewWrap.hidden = true;
          companyLogoPreviewWrap.style.display = "none";
        }

        if (companyLogoFileName) {
          companyLogoFileName.textContent = "Nenhuma imagem selecionada";
        }
      }

      definirValor("googleReviewUrl", data.google_review_url);
      definirValor("instagramUrl", data.instagram_url);
      definirValor("facebookUrl", data.facebook_url);

      // -------------------------------------------------------
      // APARÊNCIA
      // -------------------------------------------------------

      definirValor("primaryColor", data.primary_color);
      definirValor("darkColor", data.dark_color);
      definirValor("whatsappButtonText", data.whatsapp_button_text);

      // -------------------------------------------------------
      // LOJA
      // -------------------------------------------------------

      definirValor("menuStoreLabel", data.menu_store_label);
      definirValor("homeStoreEyebrow", data.home_store_eyebrow);
      definirValor("homeStoreTitle", data.home_store_title);
      definirValor("homeStoreDescription", data.home_store_description);
      definirValor("homeStoreButtonText", data.home_store_button_text);

      // -------------------------------------------------------
      // IDIOMAS
      // -------------------------------------------------------

      definirValor("siteLanguage", data.site_language || "pt-BR");
      definirValor("adminLanguage", data.admin_language || "pt-BR");

      console.log("✅ Configurações carregadas:", data);
    } catch (error) {
      console.error("❌ Erro ao carregar configurações:", error);

      alert(
        "Não foi possível carregar as configurações: " +
          (error.message || error),
      );
    }
  }

  // =========================================================
  // FUNÇÃO CENTRAL PARA SALVAR CONFIGURAÇÕES
  // =========================================================

  async function salvarConfiguracoes(dados, botao, mensagem) {
    if (!db) {
      alert("Erro: Supabase não conectado.");
      return;
    }

    const textoOriginal = botao?.textContent || "Salvar";

    if (botao) {
      botao.disabled = true;
      botao.textContent = "Salvando...";
    }

    try {
      dados.updated_at = new Date().toISOString();

      const { error } = await db
        .from("site_settings")
        .update(dados)
        .eq("id", siteSettingsId);

      if (error) {
        throw error;
      }

      alert(mensagem);
    } catch (error) {
      console.error("❌ Erro ao salvar configurações:", error);

      alert(
        "Não foi possível salvar as configurações: " + (error.message || error),
      );
    } finally {
      if (botao) {
        botao.disabled = false;
        botao.textContent = textoOriginal;
      }
    }
  }

  // =========================================================
  // SALVAR DADOS DA EMPRESA
  // =========================================================

  companySettingsForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!db) {
      alert("Erro: Supabase não conectado.");
      return;
    }

    const saveButton = companySettingsForm.querySelector(
      'button[type="submit"]',
    );

    const originalButtonText =
      saveButton?.textContent || "Salvar dados da empresa";

    const selectedLogo = companyLogoFile?.files?.[0] || null;

    let newLogoUpload = null;

    const oldLogoStoragePath = currentCompanyLogoStoragePath;

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = selectedLogo
        ? "Preparando logo..."
        : "Salvando...";
    }

    try {
      // =====================================================
      // 1. DEFINE O LOGO QUE SERÁ SALVO
      // =====================================================

      let logoUrl = companyLogo?.value || null;
      let logoStoragePath = currentCompanyLogoStoragePath || null;

      // Usuário selecionou um novo logo.
      if (selectedLogo) {
        validarImagemOriginal(selectedLogo);

        if (saveButton) {
          saveButton.textContent = "Otimizando e enviando logo...";
        }

        newLogoUpload = await enviarImagem(selectedLogo, "company/logo");

        logoUrl = newLogoUpload.publicUrl;
        logoStoragePath = newLogoUpload.path;
      }

      // Usuário clicou em remover e não escolheu outro.
      if (removeCurrentCompanyLogo && !selectedLogo) {
        logoUrl = null;
        logoStoragePath = null;
      }

      // =====================================================
      // 2. DADOS DA EMPRESA
      // =====================================================

      const dados = {
        company_name: obterValor("companyName"),
        company_short_name: obterValor("companyShortName"),

        whatsapp: obterValor("companyWhatsapp"),
        phone: obterValor("companyPhone"),
        email: obterValor("companyEmail"),

        cnpj: obterValor("companyCnpj") || null,

        address_zip_code: obterValor("companyZipCode") || null,

        address_street: obterValor("companyStreet") || null,

        address_number: obterValor("companyNumber") || null,

        address_complement: obterValor("companyComplement") || null,

        address_neighborhood: obterValor("companyNeighborhood") || null,

        address_city: obterValor("companyCity") || null,

        address_state: obterValor("companyState") || null,

        show_cnpj: obterCheckbox("showCnpj"),
        show_address: obterCheckbox("showAddress"),

        logo_url: logoUrl,
        logo_storage_path: logoStoragePath,

        updated_at: new Date().toISOString(),
      };

      // =====================================================
      // 3. SALVA NO SUPABASE
      // =====================================================

      if (saveButton) {
        saveButton.textContent = "Salvando dados...";
      }

      const { error } = await db
        .from("site_settings")
        .update(dados)
        .eq("id", siteSettingsId);

      if (error) {
        throw error;
      }

      // =====================================================
      // 4. APAGA O LOGO ANTIGO DO STORAGE
      // =====================================================

      const shouldDeleteOldLogo =
        oldLogoStoragePath &&
        (removeCurrentCompanyLogo ||
          (newLogoUpload?.path && newLogoUpload.path !== oldLogoStoragePath));

      if (shouldDeleteOldLogo) {
        const { error: removeError } = await db.storage
          .from(STORAGE_BUCKET)
          .remove([oldLogoStoragePath]);

        if (removeError) {
          console.warn(
            "Dados salvos, mas o logo antigo não pôde ser removido:",
            removeError,
          );
        }
      }

      // =====================================================
      // 5. ATUALIZA O ESTADO LOCAL
      // =====================================================

      currentCompanyLogoStoragePath = logoStoragePath || "";

      removeCurrentCompanyLogo = false;

      if (companyLogo) {
        companyLogo.value = logoUrl || "";
      }

      if (companyLogoFile) {
        companyLogoFile.value = "";
      }

      if (logoUrl) {
        if (companyLogoPreview) {
          companyLogoPreview.src = logoUrl;
        }

        if (companyLogoPreviewWrap) {
          companyLogoPreviewWrap.hidden = false;
          companyLogoPreviewWrap.style.display = "flex";
        }

        if (companyLogoFileName) {
          companyLogoFileName.textContent = "Logo atual";
        }
      } else {
        if (companyLogoPreview) {
          companyLogoPreview.src = "";
        }

        if (companyLogoPreviewWrap) {
          companyLogoPreviewWrap.hidden = true;
          companyLogoPreviewWrap.style.display = "none";
        }

        if (companyLogoFileName) {
          companyLogoFileName.textContent = "Nenhuma imagem selecionada";
        }
      }

      alert("Dados da empresa salvos com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao salvar dados da empresa:", error);

      // Se enviamos um novo arquivo, mas o banco falhou,
      // apagamos esse arquivo para não deixá-lo órfão.
      if (newLogoUpload?.path) {
        try {
          await db.storage.from(STORAGE_BUCKET).remove([newLogoUpload.path]);
        } catch (cleanupError) {
          console.warn(
            "Não foi possível limpar o novo logo após a falha:",
            cleanupError,
          );
        }
      }

      alert(
        "Não foi possível salvar os dados da empresa: " +
          (error.message || error),
      );
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = originalButtonText;
      }
    }
  });

  // =========================================================
  // SALVAR PRESENÇA DIGITAL
  // =========================================================

  digitalSettingsForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const saveButton = digitalSettingsForm.querySelector(
      'button[type="submit"]',
    );

    const dados = {
      google_review_url: obterValor("googleReviewUrl"),
      instagram_url: obterValor("instagramUrl"),
      facebook_url: obterValor("facebookUrl"),
    };

    await salvarConfiguracoes(
      dados,
      saveButton,
      "Presença digital salva com sucesso!",
    );
  });

  // =========================================================
  // SALVAR APARÊNCIA
  // =========================================================

  appearanceSettingsForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const saveButton = appearanceSettingsForm.querySelector(
      'button[type="submit"]',
    );

    const dados = {
      primary_color: obterValor("primaryColor") || null,
      dark_color: obterValor("darkColor") || null,
      whatsapp_button_text: obterValor("whatsappButtonText") || "WhatsApp",
    };

    await salvarConfiguracoes(
      dados,
      saveButton,
      "Aparência salva com sucesso!",
    );
  });

  // =========================================================
  // SALVAR CONFIGURAÇÕES DA LOJA
  // =========================================================

  storeSettingsForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const saveButton = storeSettingsForm.querySelector('button[type="submit"]');

    const dados = {
      menu_store_label: obterValor("menuStoreLabel") || "Loja",
      home_store_eyebrow: obterValor("homeStoreEyebrow") || "Loja",
      home_store_title: obterValor("homeStoreTitle") || "Produtos em destaque.",
      home_store_description: obterValor("homeStoreDescription") || null,
      home_store_button_text:
        obterValor("homeStoreButtonText") || "Ver todos os produtos",
    };

    await salvarConfiguracoes(
      dados,
      saveButton,
      "Configurações da loja salvas com sucesso!",
    );
  });

  // =========================================================
  // SALVAR IDIOMAS
  // =========================================================

  languageSettingsForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const saveButton = languageSettingsForm.querySelector(
      'button[type="submit"]',
    );

    const dados = {
      site_language: obterValor("siteLanguage") || "pt-BR",
      admin_language: obterValor("adminLanguage") || "pt-BR",
    };

    await salvarConfiguracoes(dados, saveButton, "Idiomas salvos com sucesso!");
  });

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  carregarProdutos();
  carregarAvaliacoes();
  carregarClientes();
  carregarConfiguracoes();
});
