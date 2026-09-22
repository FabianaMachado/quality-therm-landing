/* =========================================================
   QUALITY THERM ADMIN — SISTEMA DE IDIOMAS
   Português / English / Español
========================================================= */

(() => {
  "use strict";

  const DEFAULT_LANGUAGE = "pt-BR";
  let currentLanguage = DEFAULT_LANGUAGE;

  const translations = {
    /* =====================================================
       PORTUGUÊS
    ===================================================== */

    "pt-BR": {
      common: {
        save: "Salvar",
        saving: "Salvando...",
        cancel: "Cancelar",
        edit: "Editar",
        remove: "Remover",
        delete: "Excluir",
        close: "Fechar",
        yes: "Sim",
        no: "Não",
        active: "Ativo",
        inactive: "Inativo",
        pending: "Pendente",
        approved: "Aprovada",
        loading: "Carregando...",
        search: "Pesquisar",
        actions: "Ações",
        image: "Imagem",
        status: "Status",
        home: "Home",
        noPhoto: "Sem foto",
        select: "Selecione",
        optional: "opcional",
      },

      nav: {
        dashboard: "Dashboard",
        products: "Produtos",
        reviews: "Avaliações",
        clients: "Clientes",
        settings: "Configurações",
        logout: "Sair",
      },

      dashboard: {
        title: "Dashboard",
        subtitle: "Visão geral do catálogo",

        adminPanel: "Painel Administrativo",
        clientsServed: "Clientes atendidos",
        viewSite: "Ver site",
        storeAdministration: "Administração da loja",

        panel: "Painel",
        overview: "Visão geral",
        newProduct: "+ Novo produto",

        registeredProducts: "Produtos cadastrados",
        storeProductTotal: "Total de produtos",

        activeProducts: "Produtos ativos",
        visibleInCatalog: "Visíveis no catálogo",

        homeFeatured: "Destaques na Home",
        mainProducts: "Produtos principais",

        inactiveProducts: "Produtos inativos",
        hiddenFromStore: "Ocultos da loja",

        quickAccess: "Acesso rápido",
        manageSite: "Gerencie seu site",

        addProduct: "Adicionar produto",
        addProductDescription:
          "Cadastre aquecedores, acessórios, duchas e peças.",

        reviewsDescription: "Aprove e escolha as avaliações exibidas no site.",

        clientsDescription: "Gerencie condomínios, lojas e empresas atendidas.",

        settingsDescription:
          "Altere dados da empresa, contatos e identidade visual.",

        viewCatalog: "Ver catálogo",

        catalogDescription:
          "Confira como os produtos aparecem para os clientes.",

        siteDescription: "Abra a Home pública da empresa.",

        latest: "Últimos cadastrados",

        display: "Exibir",
        productsLower: "produtos",
        viewAll: "Ver todos",

        loadingProducts: "Carregando produtos...",
        waitMoment: "Aguarde um instante.",

        recentReviews: "Avaliações recentes",
        manage: "Gerenciar",

        noReviews: "Nenhuma avaliação recebida.",

        reviewsWillAppear: "As avaliações dos clientes aparecerão aqui.",

        showing: "Exibindo {shown} de {total} produto(s)",

        noProducts: "Nenhum produto cadastrado ainda.",

        noProductsDescription: "Os produtos cadastrados aparecerão aqui.",
      },

      products: {
        title: "Produtos",
        catalog: "Catálogo",
        management: "Gerenciamento",

        newProduct: "+ Novo produto",
        add: "+ Adicionar",

        editProduct: "Editar produto",
        saveProduct: "Salvar produto",

        product: "Produto",
        productName: "Nome do produto",

        category: "Categoria",
        subcategory: "Subcategoria",

        brand: "Marca",
        model: "Modelo",

        sku: "SKU",
        slug: "URL / Slug",

        flow: "Vazão",
        color: "Cor",

        price: "Preço",
        cashPrice: "Preço no PIX",

        homePrice: "Preço exibido na Home",

        installments: "Nº de parcelas",
        installmentValue: "Valor da parcela",
        installmentText: "Informação do parcelamento",

        description: "Descrição completa",
        shortDescription: "Descrição curta",

        gas: "Tipo de gás",
        gn: "Gás Natural - GN",
        glp: "GLP",

        availability: "Disponibilidade",

        active: "Produto ativo",

        showAll: 'Aparecer em "Todos os produtos"',

        featured: "Destaque na Home",
        bestSeller: "Mais vendido",
        promotion: "Promoção",

        visibility: "Visibilidade do produto",
        badges: "Selos do produto",

        mainImage: "Imagem principal do produto",
        gallery: "Galeria do produto",

        chooseMainImage: "Escolher imagem principal",

        addPhotos: "Adicionar fotos",
        removeImage: "Remover imagem",

        noImageSelected: "Nenhuma imagem selecionada",

        noNewImageSelected: "Nenhuma nova imagem selecionada",

        noGallerySelected: "Nenhuma foto adicional selecionada",

        preparingImages: "Preparando imagens...",

        optimizingMainImage: "Otimizando imagem principal...",

        savingProduct: "Salvando produto...",

        updatingGallery: "Atualizando galeria...",

        createdSuccess: "Produto cadastrado com sucesso!",

        updatedSuccess: "Produto atualizado com sucesso!",

        loadError: "Não foi possível carregar os produtos.",

        loadEditError: "Não foi possível carregar este produto para edição.",

        all: "Todos",
        heaters: "Aquecedores",
        accessories: "Acessórios",
        showers: "Duchas",
        parts: "Peças",
        others: "Outros",

        searchPlaceholder:
          "Pesquisar produto, marca, modelo, SKU ou categoria...",

        colorPlaceholder: "Ex.: Branco",

        installmentTextPlaceholder: "Ex.: sem juros no cartão de crédito",

        shortDescriptionPlaceholder:
          "Descrição resumida para os cards do site.",

        descriptionPlaceholder: "Descrição completa do produto.",

        notFound: "Nenhum produto encontrado.",

        notFoundHelp: "Cadastre um novo produto ou altere os filtros.",

        consultAvailability: "Consulte disponibilidade",

        available: "Disponível",

        immediateAvailability: "Disponibilidade imediata",

        outOfStock: "Sem estoque",

        visibilityHelp: "Escolha onde este produto será exibido no site.",

        activeHelp:
          "Mantém o produto disponível no site e na categoria correspondente.",

        showAllHelp:
          "Além da categoria, o produto também aparecerá na aba Todos.",

        featuredHelp: "Exibe o produto entre os 4 destaques da página inicial.",

        badgesHelp: "Estas opções identificam produtos especiais.",

        bestSellerHelp: "Exibe o selo de produto mais vendido.",

        promotionHelp: "Exibe o selo de promoção no produto.",
      },

      reviews: {
        title: "Avaliações",
        newReview: "Nova avaliação",
        editReview: "Editar avaliação",
        saveReview: "Salvar avaliação",

        customer: "Cliente",
        rating: "Nota",
        source: "Origem",
        date: "Data",
        comment: "Comentário",
        url: "Link da avaliação",

        active: "Avaliação aprovada",
        featured: "Exibir na Home",

        total: "Total de avaliações",
        approved: "Avaliações aprovadas",
        featuredCount: "Destaques na Home",
        average: "Média das avaliações",

        createdSuccess: "Avaliação cadastrada com sucesso!",
        updatedSuccess: "Avaliação atualizada com sucesso!",
        loadError: "Não foi possível carregar as avaliações.",
        locateError: "Não foi possível localizar esta avaliação.",

        reputation: "Reputação",
        totalReceived: "Total recebido",
        approvedReviews: "Avaliações aprovadas",
        displayedHome: "Exibidas na Home",
        socialProof: "Provas sociais no site",
        averageRating: "Nota média",

        management: "Gerenciamento",
        receivedReviews: "Avaliações recebidas",
        add: "+ Adicionar",

        searchPlaceholder: "Pesquisar cliente, comentário, origem ou status...",

        noneFound: "Nenhuma avaliação encontrada.",

        emptyHelp: "As avaliações dos clientes aparecerão aqui para análise.",

        review: "Avaliação",
        customerName: "Nome do cliente",
        customerPlaceholder: "Ex.: Maria Silva",

        fiveStars: "5 estrelas",
        fourStars: "4 estrelas",
        threeStars: "3 estrelas",
        twoStars: "2 estrelas",
        oneStar: "1 estrela",

        other: "Outro",

        commentPlaceholder: "Digite a avaliação do cliente...",
      },

      clients: {
        title: "Clientes atendidos",
        newClient: "Novo cliente",
        editClient: "Editar cliente",
        saveClient: "Salvar cliente",

        name: "Nome",
        type: "Tipo",
        logo: "Logo",
        website: "Site",
        description: "Descrição",

        active: "Cliente ativo",
        featured: "Exibir na Home",

        createdSuccess: "Cliente cadastrado com sucesso!",
        updatedSuccess: "Cliente atualizado com sucesso!",
        loadError: "Não foi possível carregar os clientes.",

        servedClients: "Clientes atendidos",
        pageTitle: "Quem já contou com a Quality Therm",

        registeredClients: "Clientes cadastrados",
        totalRegistered: "Total cadastrado",

        activeClients: "Ativos",
        availableForDisplay: "Disponíveis para exibição",

        displayedHome: "Exibidos na Home",
        visibleOnSite: "Visíveis no site",

        inactiveClients: "Inativos",
        hiddenFromSite: "Ocultos do site",

        management: "Gerenciamento",
        managementTitle: "Clientes, empresas e condomínios",

        add: "+ Adicionar",

        searchPlaceholder: "Pesquisar por nome ou tipo...",

        client: "Cliente",

        noneRegistered: "Nenhum cliente cadastrado.",

        emptyHelp:
          "Adicione condomínios, lojas, empresas ou administradoras que já contaram com a Quality Therm.",

        servedClient: "Cliente atendido",

        namePlaceholder: "Ex.: Condomínio Residencial Jardim",

        typeCondominium: "Condomínio",
        typeStore: "Loja",
        typeCompany: "Empresa",
        typeAdministrator: "Administradora",
        typeBuilder: "Construtora",
        typeOther: "Outro",

        chooseImage: "Escolher imagem do computador",

        logoHelp:
          "Formatos aceitos: PNG, JPG ou WebP. A imagem será otimizada automaticamente. Prefira logos com fundo transparente.",

        observation: "Observação",

        descriptionPlaceholder:
          "Ex.: condomínio atendido pela equipe técnica da Quality Therm.",
      },

      settings: {
        title: "Configurações",

        company: "Dados da empresa",
        digital: "Presença digital",
        appearance: "Aparência",
        store: "Loja",
        languages: "Idiomas",

        companyName: "Nome da empresa",
        shortName: "Nome curto",
        whatsapp: "WhatsApp",
        phone: "Telefone",
        email: "E-mail",
        cnpj: "CNPJ",

        address: "Endereço",
        zipCode: "CEP",
        street: "Rua",
        number: "Número",
        complement: "Complemento",
        neighborhood: "Bairro",
        city: "Cidade",
        state: "Estado",

        showCnpj: "Exibir CNPJ no site",
        showAddress: "Exibir endereço no site",

        logo: "Logo da empresa",

        googleReviews: "Google Avaliações",
        instagram: "Instagram",
        facebook: "Facebook",

        primaryColor: "Cor principal",
        darkColor: "Cor escura",

        whatsappButton: "Texto do botão WhatsApp",

        siteLanguage: "Idioma do site",

        adminLanguage: "Idioma do painel administrativo",

        portuguese: "Português (Brasil)",
        english: "English",
        spanish: "Español",

        saveCompany: "Salvar dados da empresa",

        saveDigital: "Salvar presença digital",

        saveAppearance: "Salvar aparência",

        saveStore: "Salvar loja",

        saveLanguages: "Salvar idiomas",

        savedSuccess: "Configurações salvas com sucesso!",

        companyLabel: "Empresa",
        mainInformation: "Informações principais",
        siteVisibility: "Visibilidade no site",
        showCnpjHelp: "Mostrar o CNPJ no site público.",
        showAddressHelp: "Mostrar o endereço completo no site público.",
        chooseLogo: "Escolher logo",
        noImageSelected: "Nenhuma imagem selecionada",
        removeLogo: "Remover logo",
        socialNetworks: "Google e redes sociais",
        languageLabel: "Idioma",
        systemLanguage: "Idioma do sistema",
        languageHelp:
          "O idioma do site e o idioma do painel podem ser configurados separadamente.",
        visualIdentity: "Identidade visual",
        storeContent: "Conteúdo da seção de produtos",
        menuName: "Nome no menu",
        sectionEyebrow: "Chamada da seção",
        sectionTitle: "Título da seção",
        description: "Descrição",
        buttonText: "Texto do botão",
      },
    },

    /* =====================================================
       ENGLISH
    ===================================================== */

    en: {
      common: {
        save: "Save",
        saving: "Saving...",
        cancel: "Cancel",
        edit: "Edit",
        remove: "Remove",
        delete: "Delete",
        close: "Close",
        yes: "Yes",
        no: "No",
        active: "Active",
        inactive: "Inactive",
        pending: "Pending",
        approved: "Approved",
        loading: "Loading...",
        search: "Search",
        actions: "Actions",
        image: "Image",
        status: "Status",
        home: "Home",
        noPhoto: "No image",
        select: "Select",
        optional: "optional",
      },

      nav: {
        dashboard: "Dashboard",
        products: "Products",
        reviews: "Reviews",
        clients: "Clients",
        settings: "Settings",
        logout: "Log out",
      },

      dashboard: {
        title: "Dashboard",
        subtitle: "Catalog overview",

        adminPanel: "Admin Panel",
        clientsServed: "Clients",
        viewSite: "View website",
        storeAdministration: "Store administration",

        panel: "Dashboard",
        overview: "Overview",
        newProduct: "+ New product",

        registeredProducts: "Registered products",

        storeProductTotal: "Total products",

        activeProducts: "Active products",

        visibleInCatalog: "Visible in catalog",

        homeFeatured: "Featured on homepage",

        mainProducts: "Main products",

        inactiveProducts: "Inactive products",

        hiddenFromStore: "Hidden from store",

        quickAccess: "Quick access",

        manageSite: "Manage your website",

        addProduct: "Add product",

        addProductDescription:
          "Add water heaters, accessories, showers and parts.",

        reviewsDescription:
          "Approve and choose the reviews displayed on the website.",

        clientsDescription:
          "Manage condominiums, stores and companies you have served.",

        settingsDescription:
          "Change company information, contacts and visual identity.",

        viewCatalog: "View catalog",

        catalogDescription: "See how products appear to your customers.",

        siteDescription: "Open the company's public homepage.",

        latest: "Recently added",

        display: "Show",
        productsLower: "products",
        viewAll: "View all",

        loadingProducts: "Loading products...",

        waitMoment: "Please wait a moment.",

        recentReviews: "Recent reviews",

        manage: "Manage",

        noReviews: "No reviews received.",

        reviewsWillAppear: "Customer reviews will appear here.",

        showing: "Showing {shown} of {total} product(s)",

        noProducts: "No products have been added yet.",

        noProductsDescription: "Products you add will appear here.",
      },

      products: {
        title: "Products",
        catalog: "Catalog",
        management: "Management",

        newProduct: "+ New product",
        add: "+ Add",

        editProduct: "Edit product",
        saveProduct: "Save product",

        product: "Product",
        productName: "Product name",

        category: "Category",
        subcategory: "Subcategory",

        brand: "Brand",
        model: "Model",

        sku: "SKU",
        slug: "URL / Slug",

        flow: "Flow rate",
        color: "Color",

        price: "Price",
        cashPrice: "PIX price",

        homePrice: "Price displayed on homepage",

        installments: "Number of installments",

        installmentValue: "Installment amount",

        installmentText: "Installment information",

        description: "Full description",

        shortDescription: "Short description",

        gas: "Gas type",
        gn: "Natural Gas - NG",
        glp: "LPG",

        availability: "Availability",

        active: "Active product",

        showAll: 'Show in "All products"',

        featured: "Featured on homepage",

        bestSeller: "Best seller",

        promotion: "Promotion",

        visibility: "Product visibility",

        badges: "Product badges",

        mainImage: "Main product image",

        gallery: "Product gallery",

        chooseMainImage: "Choose main image",

        addPhotos: "Add photos",

        removeImage: "Remove image",

        noImageSelected: "No image selected",

        noNewImageSelected: "No new image selected",

        noGallerySelected: "No additional photos selected",

        preparingImages: "Preparing images...",

        optimizingMainImage: "Optimizing main image...",

        savingProduct: "Saving product...",

        updatingGallery: "Updating gallery...",

        createdSuccess: "Product added successfully!",

        updatedSuccess: "Product updated successfully!",

        loadError: "Products could not be loaded.",

        loadEditError: "This product could not be loaded for editing.",

        all: "All",
        heaters: "Water heaters",
        accessories: "Accessories",
        showers: "Showers",
        parts: "Parts",
        others: "Others",

        searchPlaceholder: "Search product, brand, model, SKU or category...",

        colorPlaceholder: "Example: White",

        installmentTextPlaceholder:
          "Example: interest-free credit card installments",

        shortDescriptionPlaceholder:
          "Short description for website product cards.",

        descriptionPlaceholder: "Full product description.",

        notFound: "No products found.",

        notFoundHelp: "Add a new product or change the filters.",

        consultAvailability: "Check availability",

        available: "Available",

        immediateAvailability: "Available immediately",

        outOfStock: "Out of stock",

        visibilityHelp:
          "Choose where this product will be displayed on the website.",

        activeHelp:
          "Keeps the product available on the website and in its corresponding category.",

        showAllHelp:
          'In addition to its category, the product will also appear under "All".',

        featuredHelp:
          "Displays the product among the 4 featured products on the homepage.",

        badgesHelp: "These options identify special products.",

        bestSellerHelp: "Displays the best seller badge on the product.",

        promotionHelp: "Displays the promotion badge on the product.",
      },

      reviews: {
        title: "Reviews",
        newReview: "New review",
        editReview: "Edit review",
        saveReview: "Save review",

        customer: "Customer",
        rating: "Rating",
        source: "Source",
        date: "Date",
        comment: "Comment",
        url: "Review link",

        active: "Approved review",
        featured: "Show on homepage",

        total: "Total reviews",
        approved: "Approved reviews",
        featuredCount: "Homepage featured",
        average: "Average rating",

        createdSuccess: "Review added successfully!",
        updatedSuccess: "Review updated successfully!",
        loadError: "Reviews could not be loaded.",
        locateError: "This review could not be found.",

        reputation: "Reputation",
        totalReceived: "Total received",
        approvedReviews: "Approved reviews",
        displayedHome: "Displayed on homepage",
        socialProof: "Social proof on website",
        averageRating: "Average rating",

        management: "Management",
        receivedReviews: "Received reviews",
        add: "+ Add",

        searchPlaceholder: "Search customer, comment, source or status...",

        noneFound: "No reviews found.",

        emptyHelp: "Customer reviews will appear here for analysis.",

        review: "Review",
        customerName: "Customer name",
        customerPlaceholder: "Example: Maria Silva",

        fiveStars: "5 stars",
        fourStars: "4 stars",
        threeStars: "3 stars",
        twoStars: "2 stars",
        oneStar: "1 star",

        other: "Other",

        commentPlaceholder: "Enter the customer's review...",
      },
      clients: {
        title: "Clients",
        newClient: "New client",
        editClient: "Edit client",
        saveClient: "Save client",

        name: "Name",
        type: "Type",
        logo: "Logo",
        website: "Website",
        description: "Description",

        active: "Active client",
        featured: "Show on homepage",

        createdSuccess: "Client added successfully!",
        updatedSuccess: "Client updated successfully!",
        loadError: "Clients could not be loaded.",

        servedClients: "Clients served",
        pageTitle: "Who has already trusted Quality Therm",

        registeredClients: "Registered clients",
        totalRegistered: "Total registered",

        activeClients: "Active",
        availableForDisplay: "Available for display",

        displayedHome: "Displayed on homepage",
        visibleOnSite: "Visible on website",

        inactiveClients: "Inactive",
        hiddenFromSite: "Hidden from website",

        management: "Management",
        managementTitle: "Clients, companies and condominiums",

        add: "+ Add",

        searchPlaceholder: "Search by name or type...",

        client: "Client",

        noneRegistered: "No clients registered.",

        emptyHelp:
          "Add condominiums, stores, companies or property managers that have already worked with Quality Therm.",

        servedClient: "Client served",

        namePlaceholder: "Example: Jardim Residential Condominium",

        typeCondominium: "Condominium",
        typeStore: "Store",
        typeCompany: "Company",
        typeAdministrator: "Property manager",
        typeBuilder: "Construction company",
        typeOther: "Other",

        chooseImage: "Choose image from computer",

        logoHelp:
          "Accepted formats: PNG, JPG or WebP. The image will be optimized automatically. Prefer logos with a transparent background.",

        observation: "Notes",

        descriptionPlaceholder:
          "Example: condominium served by the Quality Therm technical team.",
      },

      settings: {
        title: "Settings",

        company: "Company information",

        digital: "Digital presence",

        appearance: "Appearance",

        store: "Store",

        languages: "Languages",

        companyName: "Company name",

        shortName: "Short name",

        whatsapp: "WhatsApp",

        phone: "Phone",

        email: "Email",

        cnpj: "CNPJ",

        address: "Address",

        zipCode: "ZIP code",

        street: "Street",

        number: "Number",

        complement: "Additional address information",

        neighborhood: "Neighborhood",

        city: "City",

        state: "State",

        showCnpj: "Show CNPJ on website",

        showAddress: "Show address on website",

        logo: "Company logo",

        googleReviews: "Google Reviews",

        instagram: "Instagram",

        facebook: "Facebook",

        primaryColor: "Primary color",

        darkColor: "Dark color",

        whatsappButton: "WhatsApp button text",

        siteLanguage: "Website language",

        adminLanguage: "Admin panel language",

        portuguese: "Português (Brasil)",

        english: "English",

        spanish: "Español",

        saveCompany: "Save company information",

        saveDigital: "Save digital presence",

        saveAppearance: "Save appearance",

        saveStore: "Save store",

        saveLanguages: "Save languages",

        savedSuccess: "Settings saved successfully!",

        companyLabel: "Company",
        mainInformation: "Main information",
        siteVisibility: "Website visibility",
        showCnpjHelp: "Show the CNPJ on the public website.",
        showAddressHelp: "Show the full address on the public website.",
        chooseLogo: "Choose logo",
        noImageSelected: "No image selected",
        removeLogo: "Remove logo",
        socialNetworks: "Google and social networks",
        languageLabel: "Language",
        systemLanguage: "System language",
        languageHelp:
          "The website and admin panel languages can be configured separately.",
        visualIdentity: "Visual identity",
        storeContent: "Product section content",
        menuName: "Menu name",
        sectionEyebrow: "Section label",
        sectionTitle: "Section title",
        description: "Description",
        buttonText: "Button text",
      },
    },

    /* =====================================================
       ESPAÑOL
    ===================================================== */

    es: {
      common: {
        save: "Guardar",
        saving: "Guardando...",
        cancel: "Cancelar",
        edit: "Editar",
        remove: "Eliminar",
        delete: "Eliminar",
        close: "Cerrar",
        yes: "Sí",
        no: "No",
        active: "Activo",
        inactive: "Inactivo",
        pending: "Pendiente",
        approved: "Aprobada",
        loading: "Cargando...",
        search: "Buscar",
        actions: "Acciones",
        image: "Imagen",
        status: "Estado",
        home: "Inicio",
        noPhoto: "Sin imagen",
        select: "Seleccione",
        optional: "opcional",
      },

      nav: {
        dashboard: "Panel",
        products: "Productos",
        reviews: "Reseñas",
        clients: "Clientes",
        settings: "Configuración",
        logout: "Salir",
      },

      dashboard: {
        title: "Panel",

        subtitle: "Vista general del catálogo",

        adminPanel: "Panel Administrativo",

        clientsServed: "Clientes atendidos",

        viewSite: "Ver sitio",

        storeAdministration: "Administración de la tienda",

        panel: "Panel",

        overview: "Vista general",

        newProduct: "+ Nuevo producto",

        registeredProducts: "Productos registrados",

        storeProductTotal: "Total de productos",

        activeProducts: "Productos activos",

        visibleInCatalog: "Visibles en el catálogo",

        homeFeatured: "Destacados en inicio",

        mainProducts: "Productos principales",

        inactiveProducts: "Productos inactivos",

        hiddenFromStore: "Ocultos de la tienda",

        quickAccess: "Acceso rápido",

        manageSite: "Administra tu sitio",

        addProduct: "Añadir producto",

        addProductDescription:
          "Registra calentadores, accesorios, duchas y piezas.",

        reviewsDescription:
          "Aprueba y elige las reseñas que se muestran en el sitio.",

        clientsDescription:
          "Administra condominios, tiendas y empresas atendidas.",

        settingsDescription:
          "Modifica los datos de la empresa, contactos e identidad visual.",

        viewCatalog: "Ver catálogo",

        catalogDescription:
          "Comprueba cómo aparecen los productos para los clientes.",

        siteDescription: "Abre la página principal pública de la empresa.",

        latest: "Últimos registrados",

        display: "Mostrar",

        productsLower: "productos",

        viewAll: "Ver todos",

        loadingProducts: "Cargando productos...",

        waitMoment: "Espera un momento.",

        recentReviews: "Reseñas recientes",

        manage: "Administrar",

        noReviews: "No se han recibido reseñas.",

        reviewsWillAppear: "Las reseñas de los clientes aparecerán aquí.",

        showing: "Mostrando {shown} de {total} producto(s)",

        noProducts: "Todavía no hay productos registrados.",

        noProductsDescription: "Los productos registrados aparecerán aquí.",
      },

      products: {
        title: "Productos",
        catalog: "Catálogo",
        management: "Gestión",

        newProduct: "+ Nuevo producto",

        add: "+ Añadir",

        editProduct: "Editar producto",

        saveProduct: "Guardar producto",

        product: "Producto",

        productName: "Nombre del producto",

        category: "Categoría",

        subcategory: "Subcategoría",

        brand: "Marca",

        model: "Modelo",

        sku: "SKU",

        slug: "URL / Slug",

        flow: "Caudal",

        color: "Color",

        price: "Precio",

        cashPrice: "Precio PIX",

        homePrice: "Precio mostrado en inicio",

        installments: "Nº de cuotas",

        installmentValue: "Valor de la cuota",

        installmentText: "Información de cuotas",

        description: "Descripción completa",

        shortDescription: "Descripción corta",

        gas: "Tipo de gas",

        gn: "Gas Natural - GN",

        glp: "GLP",

        availability: "Disponibilidad",

        active: "Producto activo",

        showAll: 'Mostrar en "Todos los productos"',

        featured: "Destacado en inicio",

        bestSeller: "Más vendido",

        promotion: "Promoción",

        visibility: "Visibilidad del producto",

        badges: "Etiquetas del producto",

        mainImage: "Imagen principal del producto",

        gallery: "Galería del producto",

        chooseMainImage: "Elegir imagen principal",

        addPhotos: "Añadir fotos",

        removeImage: "Eliminar imagen",

        noImageSelected: "Ninguna imagen seleccionada",

        noNewImageSelected: "Ninguna imagen nueva seleccionada",

        noGallerySelected: "Ninguna foto adicional seleccionada",

        preparingImages: "Preparando imágenes...",

        optimizingMainImage: "Optimizando imagen principal...",

        savingProduct: "Guardando producto...",

        updatingGallery: "Actualizando galería...",

        createdSuccess: "¡Producto registrado correctamente!",

        updatedSuccess: "¡Producto actualizado correctamente!",

        loadError: "No fue posible cargar los productos.",

        loadEditError: "No fue posible cargar este producto para editarlo.",

        all: "Todos",

        heaters: "Calentadores",

        accessories: "Accesorios",

        showers: "Duchas",

        parts: "Piezas",

        others: "Otros",

        searchPlaceholder: "Buscar producto, marca, modelo, SKU o categoría...",

        colorPlaceholder: "Ej.: Blanco",

        installmentTextPlaceholder: "Ej.: sin intereses con tarjeta de crédito",

        shortDescriptionPlaceholder:
          "Descripción resumida para las tarjetas del sitio.",

        descriptionPlaceholder: "Descripción completa del producto.",

        notFound: "No se encontraron productos.",

        notFoundHelp: "Añade un nuevo producto o cambia los filtros.",

        consultAvailability: "Consultar disponibilidad",

        available: "Disponible",

        immediateAvailability: "Disponibilidad inmediata",

        outOfStock: "Sin stock",

        visibilityHelp: "Elige dónde se mostrará este producto en el sitio.",

        activeHelp:
          "Mantiene el producto disponible en el sitio y en su categoría correspondiente.",

        showAllHelp:
          'Además de su categoría, el producto también aparecerá en "Todos".',

        featuredHelp:
          "Muestra el producto entre los 4 destacados de la página de inicio.",

        badgesHelp: "Estas opciones identifican productos especiales.",

        bestSellerHelp: "Muestra la etiqueta de producto más vendido.",

        promotionHelp: "Muestra la etiqueta de promoción en el producto.",
      },

      reviews: {
        title: "Reseñas",
        newReview: "Nueva reseña",
        editReview: "Editar reseña",
        saveReview: "Guardar reseña",

        customer: "Cliente",
        rating: "Calificación",
        source: "Origen",
        date: "Fecha",
        comment: "Comentario",
        url: "Enlace de la reseña",

        active: "Reseña aprobada",
        featured: "Mostrar en inicio",

        total: "Total de reseñas",
        approved: "Reseñas aprobadas",
        featuredCount: "Destacadas en inicio",
        average: "Promedio de reseñas",

        createdSuccess: "¡Reseña registrada correctamente!",
        updatedSuccess: "¡Reseña actualizada correctamente!",
        loadError: "No fue posible cargar las reseñas.",
        locateError: "No fue posible encontrar esta reseña.",

        reputation: "Reputación",
        totalReceived: "Total recibido",
        approvedReviews: "Reseñas aprobadas",
        displayedHome: "Mostradas en inicio",
        socialProof: "Pruebas sociales en el sitio",
        averageRating: "Calificación media",

        management: "Gestión",
        receivedReviews: "Reseñas recibidas",
        add: "+ Añadir",

        searchPlaceholder: "Buscar cliente, comentario, origen o estado...",

        noneFound: "No se encontraron reseñas.",

        emptyHelp:
          "Las reseñas de los clientes aparecerán aquí para su análisis.",

        review: "Reseña",
        customerName: "Nombre del cliente",
        customerPlaceholder: "Ej.: Maria Silva",

        fiveStars: "5 estrellas",
        fourStars: "4 estrellas",
        threeStars: "3 estrellas",
        twoStars: "2 estrellas",
        oneStar: "1 estrella",

        other: "Otro",

        commentPlaceholder: "Escriba la reseña del cliente...",
      },

      clients: {
        title: "Clientes",
        newClient: "Nuevo cliente",
        editClient: "Editar cliente",
        saveClient: "Guardar cliente",

        name: "Nombre",
        type: "Tipo",
        logo: "Logo",
        website: "Sitio web",
        description: "Descripción",

        active: "Cliente activo",
        featured: "Mostrar en inicio",

        createdSuccess: "¡Cliente registrado correctamente!",
        updatedSuccess: "¡Cliente actualizado correctamente!",
        loadError: "No fue posible cargar los clientes.",

        servedClients: "Clientes atendidos",
        pageTitle: "Quienes ya confiaron en Quality Therm",

        registeredClients: "Clientes registrados",
        totalRegistered: "Total registrado",

        activeClients: "Activos",
        availableForDisplay: "Disponibles para mostrar",

        displayedHome: "Mostrados en inicio",
        visibleOnSite: "Visibles en el sitio",

        inactiveClients: "Inactivos",
        hiddenFromSite: "Ocultos del sitio",

        management: "Gestión",
        managementTitle: "Clientes, empresas y condominios",

        add: "+ Añadir",

        searchPlaceholder: "Buscar por nombre o tipo...",

        client: "Cliente",

        noneRegistered: "No hay clientes registrados.",

        emptyHelp:
          "Añade condominios, tiendas, empresas o administradoras que ya hayan contado con Quality Therm.",

        servedClient: "Cliente atendido",

        namePlaceholder: "Ej.: Condominio Residencial Jardim",

        typeCondominium: "Condominio",
        typeStore: "Tienda",
        typeCompany: "Empresa",
        typeAdministrator: "Administradora",
        typeBuilder: "Constructora",
        typeOther: "Otro",

        chooseImage: "Elegir imagen del ordenador",

        logoHelp:
          "Formatos aceptados: PNG, JPG o WebP. La imagen se optimizará automáticamente. Prefiere logos con fondo transparente.",

        observation: "Observación",

        descriptionPlaceholder:
          "Ej.: condominio atendido por el equipo técnico de Quality Therm.",
      },

      settings: {
        title: "Configuración",

        company: "Datos de la empresa",

        digital: "Presencia digital",

        appearance: "Apariencia",

        store: "Tienda",

        languages: "Idiomas",

        companyName: "Nombre de la empresa",

        shortName: "Nombre corto",

        whatsapp: "WhatsApp",

        phone: "Teléfono",

        email: "Correo electrónico",

        cnpj: "CNPJ",

        address: "Dirección",

        zipCode: "Código postal",

        street: "Calle",

        number: "Número",

        complement: "Complemento",

        neighborhood: "Barrio",

        city: "Ciudad",

        state: "Estado",

        showCnpj: "Mostrar CNPJ en el sitio",

        showAddress: "Mostrar dirección en el sitio",

        logo: "Logo de la empresa",

        googleReviews: "Reseñas de Google",

        instagram: "Instagram",

        facebook: "Facebook",

        primaryColor: "Color principal",

        darkColor: "Color oscuro",

        whatsappButton: "Texto del botón de WhatsApp",

        siteLanguage: "Idioma del sitio",

        adminLanguage: "Idioma del panel administrativo",

        portuguese: "Português (Brasil)",

        english: "English",

        spanish: "Español",

        saveCompany: "Guardar datos de la empresa",

        saveDigital: "Guardar presencia digital",

        saveAppearance: "Guardar apariencia",

        saveStore: "Guardar tienda",

        saveLanguages: "Guardar idiomas",

        savedSuccess: "¡Configuración guardada correctamente!",

        companyLabel: "Empresa",
        mainInformation: "Información principal",
        siteVisibility: "Visibilidad en el sitio",
        showCnpjHelp: "Mostrar el CNPJ en el sitio público.",
        showAddressHelp: "Mostrar la dirección completa en el sitio público.",
        chooseLogo: "Elegir logo",
        noImageSelected: "Ninguna imagen seleccionada",
        removeLogo: "Eliminar logo",
        socialNetworks: "Google y redes sociales",
        languageLabel: "Idioma",
        systemLanguage: "Idioma del sistema",
        languageHelp:
          "El idioma del sitio y el idioma del panel administrativo se pueden configurar por separado.",
        visualIdentity: "Identidad visual",
        storeContent: "Contenido de la sección de productos",
        menuName: "Nombre en el menú",
        sectionEyebrow: "Llamada de la sección",
        sectionTitle: "Título de la sección",
        description: "Descripción",
        buttonText: "Texto del botón",
      },
    },
  };

  /* =========================================================
     NORMALIZAÇÃO DO IDIOMA
  ========================================================= */

  function normalizeLanguage(language) {
    const value = String(language || DEFAULT_LANGUAGE)
      .trim()
      .toLowerCase();

    if (value === "en" || value.startsWith("en-")) {
      return "en";
    }

    if (value === "es" || value.startsWith("es-")) {
      return "es";
    }

    return "pt-BR";
  }

  /* =========================================================
     BUSCAR VALOR POR CAMINHO
  ========================================================= */

  function getByPath(object, path) {
    return String(path || "")
      .split(".")
      .reduce((current, key) => current?.[key], object);
  }

  /* =========================================================
     VARIÁVEIS DENTRO DAS TRADUÇÕES
  ========================================================= */

  function interpolate(text, variables = {}) {
    return String(text).replace(/\{(\w+)\}/g, (match, key) =>
      Object.prototype.hasOwnProperty.call(variables, key)
        ? variables[key]
        : match,
    );
  }

  /* =========================================================
     FUNÇÃO DE TRADUÇÃO
  ========================================================= */

  function t(key, variables = {}, language = currentLanguage) {
    const normalized = normalizeLanguage(language);

    let value = getByPath(translations[normalized], key);

    if (value === undefined) {
      value = getByPath(translations[DEFAULT_LANGUAGE], key);
    }

    if (value === undefined) {
      return key;
    }

    return interpolate(value, variables);
  }

  /* =========================================================
     TRADUZIR ELEMENTOS DO HTML
  ========================================================= */

  function translateElements(root = document) {
    if (!root) {
      return;
    }

    root.querySelectorAll("[data-admin-i18n]").forEach((element) => {
      const key = element.dataset.adminI18n;

      if (!key) {
        return;
      }

      element.textContent = t(key);
    });

    root
      .querySelectorAll("[data-admin-i18n-placeholder]")
      .forEach((element) => {
        const key = element.dataset.adminI18nPlaceholder;

        if (!key) {
          return;
        }

        element.placeholder = t(key);
      });

    root.querySelectorAll("[data-admin-i18n-title]").forEach((element) => {
      const key = element.dataset.adminI18nTitle;

      if (!key) {
        return;
      }

      const translated = t(key);

      element.title = translated;

      if (element.hasAttribute("aria-label")) {
        element.setAttribute("aria-label", translated);
      }
    });
  }

  /* =========================================================
     ALTERAR IDIOMA
  ========================================================= */

  function setLanguage(language, options = {}) {
    currentLanguage = normalizeLanguage(language);

    document.documentElement.lang = currentLanguage;

    if (options.translate !== false) {
      translateElements(options.root || document);
    }

    document.dispatchEvent(
      new CustomEvent("qt:adminlanguagechange", {
        detail: {
          language: currentLanguage,
        },
      }),
    );

    return currentLanguage;
  }

  function getLanguage() {
    return currentLanguage;
  }

  /* =========================================================
     LOCALE
  ========================================================= */

  function getLocale() {
    if (currentLanguage === "en") {
      return "en-US";
    }

    if (currentLanguage === "es") {
      return "es-ES";
    }

    return "pt-BR";
  }

  /* =========================================================
     FORMATAÇÃO DE MOEDA
  ========================================================= */

  function formatCurrency(value) {
    const number = Number(value) || 0;

    return new Intl.NumberFormat(getLocale(), {
      style: "currency",
      currency: "BRL",
    }).format(number);
  }

  /* =========================================================
     FORMATAÇÃO DE DATA
  ========================================================= */

  function formatDate(value) {
    if (!value) {
      return "";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(getLocale()).format(date);
  }

  /* =========================================================
     API GLOBAL
  ========================================================= */

  window.QT_ADMIN_I18N = {
    translations,
    normalizeLanguage,
    t,
    setLanguage,
    getLanguage,
    getLocale,
    formatCurrency,
    formatDate,
    translate: translateElements,
  };

  /* =========================================================
     INICIALIZAÇÃO AUTOMÁTICA VIA SUPABASE EM TODAS AS PÁGINAS
  ========================================================= */
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const db = window.initQualityThermSupabase
        ? window.initQualityThermSupabase()
        : window.supabaseClient;

      if (db) {
        const { data, error } = await db
          .from("site_settings")
          .select("admin_language")
          .eq("id", 1)
          .maybeSingle();

        if (!error && data?.admin_language) {
          setLanguage(data.admin_language);
          console.log(
            "🌐 Idioma do Admin carregado do Supabase:",
            data.admin_language,
          );
        } else {
          translateElements(document);
        }
      } else {
        translateElements(document);
      }
    } catch (error) {
      console.error("Erro ao carregar idioma do Supabase no Admin:", error);
      translateElements(document);
    }
  });
})();
