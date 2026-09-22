(() => {
  "use strict";

  const DEFAULT_LANGUAGE = "pt-BR";

  const translations = {
    "pt-BR": {
      common: {
        select: "Selecione",
        optional: "opcional",
        name: "Nome",
        model: "Modelo",
        brand: "Marca do aquecedor",
        gas: "Tipo de gás",
        zipCode: "CEP do atendimento",
        whatsapp: "WhatsApp",
        phone: "Telefone",
        email: "E-mail",
        address: "Endereço",
        customerService: "Atendimento",
        cnpj: "CNPJ",
        backToTop: "Voltar ao topo ↑",
        closeForm: "Fechar formulário",
        otherBrand: "Outra marca",
        dontKnow: "Não sei informar",
      },

      nav: {
        openMenu: "Abrir menu",
        mainNavigation: "Navegação principal",
        buy: "Loja",
        services: "Serviços",
        sizing: "Dimensionador",
        condominiums: "Condomínios",
        reviews: "Avaliações",
        contact: "Contato",
      },

      catalog: {
        eyebrow: "Catálogo",
        title: "Encontre o produto ideal para sua necessidade.",
        description:
          "Explore aquecedores, acessórios, duchas e peças cadastrados no painel administrativo.",
        searchPlaceholder:
          "Buscar por produto, marca, modelo, SKU ou categoria...",
        all: "Todos",
        heaters: "Aquecedores",
        accessories: "Acessórios",
        showers: "Duchas",
        parts: "Peças",
        products: "Produtos",
        allProducts: "Todos os produtos",
        loading: "Carregando produtos...",
        emptyTitle: "Nenhum produto encontrado.",
        emptyText: "Tente outra categoria ou termo de busca.",
      },

      hero: {
        eyebrow: "São Paulo • Atendimento especializado",
        title: "Venda, instalação e manutenção de",
        titleHighlight: "aquecedores a gás",
        lead: "Escolha o equipamento certo, solicite assistência ou agende sua manutenção com atendimento direto pelo WhatsApp.",
        buy: "Comprar aquecedor",
        assistance: "Solicitar assistência",

        trustBrands: "✓ Rinnai, Komeco e Rheem",
        trustInstallation: "✓ Venda + instalação",
        trustMaintenance: "✓ Manutenção preventiva",

        help: "Como podemos ajudar?",
        quick: "Resolva em poucos cliques",

        wantBuy: "Quero comprar",
        findFlow: "Descubra a vazão indicada",

        alreadyHave: "Já tenho aquecedor",
        repair: "Manutenção, conserto ou instalação",

        condominium: "Condomínio",
        scheduled: "Atendimento programado",
      },

      quickServices: {
        label: "Serviços rápidos",

        buy: "🔥 Comprar",
        buyText: "Aquecedor novo",

        repair: "🔧 Conserto",
        repairText: "Falhas e códigos de erro",

        maintenance: "🧰 Manutenção",
        maintenanceText: "Preventiva anual",

        installation: "🏠 Instalação",
        installationText: "Troca ou nova instalação",
      },

      sizing: {
        eyebrow: "Dimensionador simples",
        title: "Não sabe qual aquecedor escolher?",

        description:
          "Responda algumas perguntas e receba uma faixa inicial de vazão. O resultado é orientativo e deve ser confirmado após análise das condições hidráulicas, gás e instalação.",

        note: "💡 Uma boa escolha evita comprar um equipamento subdimensionado ou pagar por uma capacidade que você não precisa.",

        showers: "Quantos chuveiros podem ser usados ao mesmo tempo?",

        oneShower: "1 chuveiro",
        twoShowers: "2 chuveiros",
        threeShowers: "3 chuveiros",
        fourShowers: "4 ou mais",

        flow: "Vazão aproximada de cada ducha",

        economic: "Econômica • ~8 L/min",
        conventional: "Convencional • ~10 L/min",
        comfort: "Conforto • ~12 L/min",
        highFlow: "Alta vazão • ~15 L/min",

        gas: "Tipo de gás",
        naturalGas: "Gás Natural (GN)",
        dontKnow: "Não sei",

        calculate: "Calcular faixa indicada",
      },

      products: {
        empty: "Nenhum produto foi marcado como destaque no painel.",
      },

      services: {
        eyebrow: "Serviços",
        title: "Já possui um aquecedor?",

        description:
          "Atendimento para manutenção, conserto, instalação e substituição de equipamentos.",

        preventiveTitle: "Manutenção preventiva",
        preventiveText:
          "Inspeção, limpeza, testes de funcionamento, verificação de vazamentos e regulagem quando necessária.",
        schedule: "Agendar →",

        assistanceTitle: "Assistência / conserto",
        assistanceText:
          "Aquecedor não acende, desliga, não aquece, apresenta ruído, vazamento ou código de erro.",
        requestService: "Solicitar atendimento →",

        installationTitle: "Instalação e substituição",
        installationText:
          "Instalação de equipamento novo ou substituição, com avaliação das condições existentes.",
        requestQuote: "Solicitar orçamento →",
      },

      preventive: {
        eyebrow: "Manutenção preventiva",

        title: "Há quanto tempo seu aquecedor não passa por uma manutenção?",

        description:
          "A manutenção preventiva ajuda a identificar problemas, verificar componentes e manter o equipamento funcionando corretamente.",

        button: "Agendar manutenção",
      },

      condominiums: {
        eyebrow: "Condomínios",

        title:
          "Atendimento programado para moradores, síndicos e administradoras.",

        description:
          "Quando existe demanda concentrada, podemos organizar os contatos e avaliar condições para uma agenda programada de atendimento.",

        resident: "Sou morador",
        residentText: "Quero atendimento para meu apartamento",

        manager: "Sou síndico / administradora",
        managerText: "Quero falar sobre atendimento programado",
      },

      reviews: {
        eyebrow: "Avaliações de clientes",

        title: "A experiência de quem já contou com a Quality Therm.",

        noFeatured: "Nenhuma avaliação em destaque",

        comingSoon: "Avaliações em breve.",

        comingSoonText:
          "As avaliações selecionadas no painel administrativo aparecerão aqui.",
      },

      contact: {
        eyebrow: "Fale com a Quality Therm",

        title:
          "Quer comprar, instalar ou resolver um problema no seu aquecedor?",

        description:
          "Entre em contato com nossa equipe para receber orientação sobre produtos e serviços.",

        whatsapp: "Abrir WhatsApp",
        call: "Ligar agora",
      },

      assistance: {
        eyebrow: "Assistência técnica",

        title: "Conte rapidamente o que está acontecendo.",

        description:
          "Preencha os dados abaixo. Ao continuar, abriremos o WhatsApp com as informações do atendimento preenchidas.",

        namePlaceholder: "Digite seu nome",

        brand: "Marca do aquecedor",
        selectBrand: "Selecione a marca",

        modelPlaceholder: "Ex.: E21 — se souber",

        problem: "O que está acontecendo?",

        problemPlaceholder:
          "Ex.: não aquece, desliga durante o banho, apresenta código 11...",

        zipCode: "CEP do local do atendimento",

        privacy:
          "Seus dados serão utilizados apenas para dar continuidade à sua solicitação de atendimento.",

        submit: "Solicitar assistência pelo WhatsApp",
      },

      maintenance: {
        title: "Vamos preparar seu atendimento.",

        description:
          "Informe alguns dados do equipamento para agilizar o agendamento.",

        lastMaintenance: "Última manutenção",

        lessSixMonths: "Menos de 6 meses",
        sixTwelveMonths: "Entre 6 e 12 meses",
        oneTwoYears: "Entre 1 e 2 anos",
        moreTwoYears: "Mais de 2 anos",
        never: "Nunca foi realizada",

        zipCode: "CEP do atendimento",

        privacy:
          "Seus dados serão utilizados apenas para dar continuidade à solicitação de atendimento.",

        submit: "Agendar manutenção pelo WhatsApp",
      },

      installation: {
        eyebrow: "Instalação e substituição",

        title: "Conte um pouco sobre a instalação.",

        description:
          "Essas informações ajudam nossa equipe a entender sua necessidade antes do orçamento.",

        need: "O que você precisa?",

        newInstallation: "Instalação de aquecedor novo",

        replacement: "Substituição de aquecedor existente",

        needToBuy: "Ainda preciso comprar o aquecedor",

        dontKnowOption: "Não sei qual opção preciso",

        equipmentBrand: "Marca do equipamento",

        gas: "Tipo de gás",

        naturalGas: "GN - Gás Natural",

        zipCode: "CEP do local da instalação",

        observations: "Observações",

        observationsPlaceholder:
          "Ex.: já existe aquecedor instalado, preciso retirar o antigo...",

        privacy:
          "Seus dados serão utilizados apenas para dar continuidade à solicitação de orçamento.",

        submit: "Solicitar orçamento pelo WhatsApp",
      },

      publicReview: {
        close: "Fechar avaliação",

        eyebrow: "Avalie seu atendimento",

        title: "Como foi sua experiência com a Quality Therm?",

        description:
          "Sua opinião nos ajuda a melhorar nosso atendimento e também ajuda outros clientes.",

        name: "Seu nome",
        rating: "Sua nota",

        starsChoice: "Escolha de 1 a 5 estrelas",

        comment: "Conte como foi seu atendimento",

        commentPlaceholder:
          "Ex.: atendimento rápido, técnico atencioso, serviço realizado conforme combinado...",

        privacy: "Sua avaliação poderá ser utilizada no site da Quality Therm.",

        submit: "Enviar avaliação",

        thankYou: "Obrigada pela sua avaliação!",

        success: "Sua opinião foi registrada com sucesso.",

        copy: "Copiar meu comentário",

        google: "Publicar também no Google",
      },

      footer: {
        description: "Venda, instalação, manutenção e assistência técnica.",

        service: "Atendimento",
        phone: "Telefone:",
        address: "Endereço",
        backToTop: "Voltar ao topo ↑",
      },
    },

    en: {
      common: {
        select: "Select",
        optional: "optional",
        name: "Name",
        model: "Model",
        brand: "Water heater brand",
        gas: "Gas type",
        zipCode: "Service ZIP code",
        whatsapp: "WhatsApp",
        phone: "Phone",
        email: "Email",
        address: "Address",
        customerService: "Customer service",
        cnpj: "CNPJ",
        backToTop: "Back to top ↑",
        closeForm: "Close form",
        otherBrand: "Other brand",
        dontKnow: "I don't know",
      },

      nav: {
        openMenu: "Open menu",
        mainNavigation: "Main navigation",
        buy: "Store",
        services: "Services",
        sizing: "Heater sizing",
        condominiums: "Condominiums",
        reviews: "Reviews",
        contact: "Contact",
      },

      catalog: {
        eyebrow: "Catalog",
        title: "Find the ideal product for your needs.",
        description:
          "Explore water heaters, accessories, showers and parts registered in the administrative panel.",
        searchPlaceholder:
          "Search by product, brand, model, SKU or category...",
        all: "All",
        heaters: "Water heaters",
        accessories: "Accessories",
        showers: "Showers",
        parts: "Parts",
        products: "Products",
        allProducts: "All products",
        loading: "Loading products...",
        emptyTitle: "No products found.",
        emptyText: "Try another category or search term.",
      },

      hero: {
        eyebrow: "São Paulo • Specialized service",
        title: "Sales, installation and maintenance of",
        titleHighlight: "gas water heaters",
        lead: "Choose the right equipment, request technical assistance or schedule maintenance directly through WhatsApp.",
        buy: "Buy a water heater",
        assistance: "Request assistance",

        trustBrands: "✓ Rinnai, Komeco and Rheem",
        trustInstallation: "✓ Sales + installation",
        trustMaintenance: "✓ Preventive maintenance",

        help: "How can we help?",
        quick: "Get help in just a few clicks",

        wantBuy: "I want to buy",
        findFlow: "Find the recommended capacity",

        alreadyHave: "I already have a heater",
        repair: "Maintenance, repair or installation",

        condominium: "Condominium",
        scheduled: "Scheduled service",
      },

      quickServices: {
        label: "Quick services",

        buy: "🔥 Buy",
        buyText: "New water heater",

        repair: "🔧 Repair",
        repairText: "Failures and error codes",

        maintenance: "🧰 Maintenance",
        maintenanceText: "Annual preventive service",

        installation: "🏠 Installation",
        installationText: "Replacement or new installation",
      },

      sizing: {
        eyebrow: "Simple sizing calculator",
        title: "Not sure which water heater to choose?",

        description:
          "Answer a few questions to receive an initial recommended flow range. The result is for guidance and should be confirmed after reviewing hydraulic conditions, gas supply and installation.",

        note: "💡 Choosing the right size helps prevent buying an undersized unit or paying for capacity you do not need.",

        showers: "How many showers may be used at the same time?",

        oneShower: "1 shower",
        twoShowers: "2 showers",
        threeShowers: "3 showers",
        fourShowers: "4 or more",

        flow: "Approximate flow rate of each shower",

        economic: "Economy • ~8 L/min",
        conventional: "Standard • ~10 L/min",
        comfort: "Comfort • ~12 L/min",
        highFlow: "High flow • ~15 L/min",

        gas: "Gas type",
        naturalGas: "Natural Gas (NG)",
        dontKnow: "I don't know",

        calculate: "Calculate recommended range",
      },

      products: {
        empty: "No product has been selected as featured in the admin panel.",
      },

      services: {
        eyebrow: "Services",
        title: "Already have a water heater?",

        description:
          "Service for maintenance, repairs, installation and equipment replacement.",

        preventiveTitle: "Preventive maintenance",
        preventiveText:
          "Inspection, cleaning, operating tests, leak checks and adjustments when required.",
        schedule: "Schedule →",

        assistanceTitle: "Technical assistance / repair",
        assistanceText:
          "Water heater does not ignite, shuts off, does not heat, makes unusual noises, leaks or displays an error code.",
        requestService: "Request service →",

        installationTitle: "Installation and replacement",
        installationText:
          "Installation of new equipment or replacement of an existing unit, including an assessment of current conditions.",
        requestQuote: "Request a quote →",
      },

      preventive: {
        eyebrow: "Preventive maintenance",

        title: "How long has it been since your water heater was serviced?",

        description:
          "Preventive maintenance helps identify problems, inspect components and keep the equipment operating properly.",

        button: "Schedule maintenance",
      },

      condominiums: {
        eyebrow: "Condominiums",

        title:
          "Scheduled service for residents, property managers and management companies.",

        description:
          "When there is concentrated demand, we can organize requests and assess options for a scheduled service plan.",

        resident: "I am a resident",
        residentText: "I need service for my apartment",

        manager: "I am a property manager / management company",

        managerText: "I want to discuss scheduled service",
      },

      reviews: {
        eyebrow: "Customer reviews",

        title: "Experiences from customers who have chosen Quality Therm.",

        noFeatured: "No featured reviews",

        comingSoon: "Reviews coming soon.",

        comingSoonText: "Reviews selected in the admin panel will appear here.",
      },

      contact: {
        eyebrow: "Contact Quality Therm",

        title:
          "Looking to buy, install or solve a problem with your water heater?",

        description: "Contact our team for guidance on products and services.",

        whatsapp: "Open WhatsApp",
        call: "Call now",
      },

      assistance: {
        eyebrow: "Technical assistance",

        title: "Tell us briefly what is happening.",

        description:
          "Fill in the information below. When you continue, WhatsApp will open with your service information already filled in.",

        namePlaceholder: "Enter your name",

        brand: "Water heater brand",
        selectBrand: "Select the brand",

        modelPlaceholder: "Example: E21 — if known",

        problem: "What is happening?",

        problemPlaceholder:
          "Example: does not heat, shuts off during a shower, displays error code 11...",

        zipCode: "Service location ZIP code",

        privacy:
          "Your information will only be used to continue your service request.",

        submit: "Request assistance via WhatsApp",
      },

      maintenance: {
        title: "Let's prepare your service request.",

        description:
          "Provide a few details about the equipment to help us schedule your service.",

        lastMaintenance: "Last maintenance",

        lessSixMonths: "Less than 6 months ago",
        sixTwelveMonths: "Between 6 and 12 months ago",
        oneTwoYears: "Between 1 and 2 years ago",
        moreTwoYears: "More than 2 years ago",
        never: "Never serviced",

        zipCode: "Service ZIP code",

        privacy:
          "Your information will only be used to continue your service request.",

        submit: "Schedule maintenance via WhatsApp",
      },

      installation: {
        eyebrow: "Installation and replacement",

        title: "Tell us a little about the installation.",

        description:
          "This information helps our team understand your needs before preparing a quote.",

        need: "What do you need?",

        newInstallation: "Installation of a new water heater",

        replacement: "Replacement of an existing water heater",

        needToBuy: "I still need to purchase the water heater",

        dontKnowOption: "I'm not sure which option I need",

        equipmentBrand: "Equipment brand",

        gas: "Gas type",

        naturalGas: "NG - Natural Gas",

        zipCode: "Installation location ZIP code",

        observations: "Notes",

        observationsPlaceholder:
          "Example: there is already a heater installed and the old unit needs to be removed...",

        privacy:
          "Your information will only be used to continue your quote request.",

        submit: "Request a quote via WhatsApp",
      },

      publicReview: {
        close: "Close review",

        eyebrow: "Rate your service",

        title: "How was your experience with Quality Therm?",

        description:
          "Your feedback helps us improve our service and also helps other customers.",

        name: "Your name",
        rating: "Your rating",

        starsChoice: "Choose from 1 to 5 stars",

        comment: "Tell us about your service experience",

        commentPlaceholder:
          "Example: fast service, attentive technician, work completed as agreed...",

        privacy: "Your review may be published on the Quality Therm website.",

        submit: "Submit review",

        thankYou: "Thank you for your review!",

        success: "Your feedback was successfully submitted.",

        copy: "Copy my comment",

        google: "Also publish on Google",
      },

      footer: {
        description:
          "Sales, installation, maintenance and technical assistance.",

        service: "Customer service",
        phone: "Phone:",
        address: "Address",
        backToTop: "Back to top ↑",
      },
    },

    es: {
      common: {
        select: "Seleccione",
        optional: "opcional",
        name: "Nombre",
        model: "Modelo",
        brand: "Marca del calentador",
        gas: "Tipo de gas",
        zipCode: "Código postal de atención",
        whatsapp: "WhatsApp",
        phone: "Teléfono",
        email: "Correo electrónico",
        address: "Dirección",
        customerService: "Atención",
        cnpj: "CNPJ",
        backToTop: "Volver arriba ↑",
        closeForm: "Cerrar formulario",
        otherBrand: "Otra marca",
        dontKnow: "No sé informar",
      },

      nav: {
        openMenu: "Abrir menú",
        mainNavigation: "Navegación principal",
        buy: "Tienda",
        services: "Servicios",
        sizing: "Dimensionador",
        condominiums: "Condominios",
        reviews: "Reseñas",
        contact: "Contacto",
      },

      catalog: {
        eyebrow: "Catálogo",
        title: "Encuentra el producto ideal para tus necesidades.",
        description:
          "Explora calentadores, accesorios, duchas y piezas registrados en el panel administrativo.",
        searchPlaceholder:
          "Buscar por producto, marca, modelo, SKU o categoría...",
        all: "Todos",
        heaters: "Calentadores",
        accessories: "Accesorios",
        showers: "Duchas",
        parts: "Piezas",
        products: "Productos",
        allProducts: "Todos los productos",
        loading: "Cargando productos...",
        emptyTitle: "No se encontraron productos.",
        emptyText: "Prueba otra categoría o término de búsqueda.",
      },

      hero: {
        eyebrow: "São Paulo • Atención especializada",
        title: "Venta, instalación y mantenimiento de",
        titleHighlight: "calentadores de agua a gas",
        lead: "Elija el equipo adecuado, solicite asistencia técnica o programe el mantenimiento directamente por WhatsApp.",
        buy: "Comprar calentador",
        assistance: "Solicitar asistencia",

        trustBrands: "✓ Rinnai, Komeco y Rheem",
        trustInstallation: "✓ Venta + instalación",
        trustMaintenance: "✓ Mantenimiento preventivo",

        help: "¿Cómo podemos ayudar?",
        quick: "Resuélvalo en pocos clics",

        wantBuy: "Quiero comprar",
        findFlow: "Descubra la capacidad recomendada",

        alreadyHave: "Ya tengo calentador",
        repair: "Mantenimiento, reparación o instalación",

        condominium: "Condominio",
        scheduled: "Atención programada",
      },

      quickServices: {
        label: "Servicios rápidos",

        buy: "🔥 Comprar",
        buyText: "Calentador nuevo",

        repair: "🔧 Reparación",
        repairText: "Fallas y códigos de error",

        maintenance: "🧰 Mantenimiento",
        maintenanceText: "Preventivo anual",

        installation: "🏠 Instalación",
        installationText: "Cambio o nueva instalación",
      },

      sizing: {
        eyebrow: "Dimensionador sencillo",

        title: "¿No sabe qué calentador elegir?",

        description:
          "Responda algunas preguntas y reciba un rango inicial de caudal recomendado. El resultado es orientativo y debe confirmarse después de analizar las condiciones hidráulicas, el gas y la instalación.",

        note: "💡 Una buena elección evita comprar un equipo con capacidad insuficiente o pagar por una capacidad que no necesita.",

        showers: "¿Cuántas duchas pueden utilizarse al mismo tiempo?",

        oneShower: "1 ducha",
        twoShowers: "2 duchas",
        threeShowers: "3 duchas",
        fourShowers: "4 o más",

        flow: "Caudal aproximado de cada ducha",

        economic: "Económica • ~8 L/min",
        conventional: "Convencional • ~10 L/min",
        comfort: "Confort • ~12 L/min",
        highFlow: "Alto caudal • ~15 L/min",

        gas: "Tipo de gas",
        naturalGas: "Gas Natural (GN)",
        dontKnow: "No sé",

        calculate: "Calcular rango recomendado",
      },

      products: {
        empty: "Ningún producto fue seleccionado como destacado en el panel.",
      },

      services: {
        eyebrow: "Servicios",

        title: "¿Ya tiene un calentador?",

        description:
          "Atención para mantenimiento, reparación, instalación y sustitución de equipos.",

        preventiveTitle: "Mantenimiento preventivo",

        preventiveText:
          "Inspección, limpieza, pruebas de funcionamiento, verificación de fugas y regulación cuando sea necesaria.",

        schedule: "Programar →",

        assistanceTitle: "Asistencia / reparación",

        assistanceText:
          "El calentador no enciende, se apaga, no calienta, presenta ruidos, fugas o códigos de error.",

        requestService: "Solicitar atención →",

        installationTitle: "Instalación y sustitución",

        installationText:
          "Instalación de un equipo nuevo o sustitución del existente, con evaluación de las condiciones actuales.",

        requestQuote: "Solicitar presupuesto →",
      },

      preventive: {
        eyebrow: "Mantenimiento preventivo",

        title: "¿Cuánto tiempo hace que su calentador no recibe mantenimiento?",

        description:
          "El mantenimiento preventivo ayuda a identificar problemas, verificar componentes y mantener el equipo funcionando correctamente.",

        button: "Programar mantenimiento",
      },

      condominiums: {
        eyebrow: "Condominios",

        title:
          "Atención programada para residentes, administradores y empresas administradoras.",

        description:
          "Cuando existe una demanda concentrada, podemos organizar los contactos y evaluar las condiciones para una agenda programada de atención.",

        resident: "Soy residente",

        residentText: "Quiero atención para mi apartamento",

        manager: "Soy administrador / empresa administradora",

        managerText: "Quiero hablar sobre atención programada",
      },

      reviews: {
        eyebrow: "Opiniones de clientes",

        title: "La experiencia de quienes ya contaron con Quality Therm.",

        noFeatured: "Ninguna opinión destacada",

        comingSoon: "Opiniones próximamente.",

        comingSoonText:
          "Las opiniones seleccionadas en el panel administrativo aparecerán aquí.",
      },

      contact: {
        eyebrow: "Hable con Quality Therm",

        title:
          "¿Quiere comprar, instalar o solucionar un problema con su calentador?",

        description:
          "Póngase en contacto con nuestro equipo para recibir orientación sobre productos y servicios.",

        whatsapp: "Abrir WhatsApp",
        call: "Llamar ahora",
      },

      assistance: {
        eyebrow: "Asistencia técnica",

        title: "Cuéntenos brevemente qué está sucediendo.",

        description:
          "Complete los datos a continuación. Al continuar, abriremos WhatsApp con la información de atención ya completada.",

        namePlaceholder: "Escriba su nombre",

        brand: "Marca del calentador",

        selectBrand: "Seleccione la marca",

        modelPlaceholder: "Ej.: E21 — si lo sabe",

        problem: "¿Qué está sucediendo?",

        problemPlaceholder:
          "Ej.: no calienta, se apaga durante la ducha, presenta código 11...",

        zipCode: "Código postal del lugar de atención",

        privacy:
          "Sus datos se utilizarán únicamente para dar continuidad a su solicitud de atención.",

        submit: "Solicitar asistencia por WhatsApp",
      },

      maintenance: {
        title: "Preparemos su atención.",

        description:
          "Indique algunos datos del equipo para agilizar la programación.",

        lastMaintenance: "Último mantenimiento",

        lessSixMonths: "Hace menos de 6 meses",

        sixTwelveMonths: "Entre 6 y 12 meses",

        oneTwoYears: "Entre 1 y 2 años",

        moreTwoYears: "Hace más de 2 años",

        never: "Nunca se realizó",

        zipCode: "Código postal de atención",

        privacy:
          "Sus datos se utilizarán únicamente para dar continuidad a la solicitud de atención.",

        submit: "Programar mantenimiento por WhatsApp",
      },

      installation: {
        eyebrow: "Instalación y sustitución",

        title: "Cuéntenos un poco sobre la instalación.",

        description:
          "Esta información ayuda a nuestro equipo a comprender su necesidad antes de preparar el presupuesto.",

        need: "¿Qué necesita?",

        newInstallation: "Instalación de un calentador nuevo",

        replacement: "Sustitución de un calentador existente",

        needToBuy: "Todavía necesito comprar el calentador",

        dontKnowOption: "No sé qué opción necesito",

        equipmentBrand: "Marca del equipo",

        gas: "Tipo de gas",

        naturalGas: "GN - Gas Natural",

        zipCode: "Código postal del lugar de instalación",

        observations: "Observaciones",

        observationsPlaceholder:
          "Ej.: ya existe un calentador instalado y necesito retirar el antiguo...",

        privacy:
          "Sus datos se utilizarán únicamente para dar continuidad a la solicitud de presupuesto.",

        submit: "Solicitar presupuesto por WhatsApp",
      },

      publicReview: {
        close: "Cerrar opinión",

        eyebrow: "Evalúe su atención",

        title: "¿Cómo fue su experiencia con Quality Therm?",

        description:
          "Su opinión nos ayuda a mejorar nuestra atención y también ayuda a otros clientes.",

        name: "Su nombre",

        rating: "Su puntuación",

        starsChoice: "Elija de 1 a 5 estrellas",

        comment: "Cuéntenos cómo fue su atención",

        commentPlaceholder:
          "Ej.: atención rápida, técnico atento, servicio realizado según lo acordado...",

        privacy:
          "Su opinión podrá publicarse en el sitio web de Quality Therm.",

        submit: "Enviar opinión",

        thankYou: "¡Gracias por su opinión!",

        success: "Su opinión fue registrada correctamente.",

        copy: "Copiar mi comentario",

        google: "Publicar también en Google",
      },

      footer: {
        description: "Venta, instalación, mantenimiento y asistencia técnica.",

        service: "Atención",

        phone: "Teléfono:",

        address: "Dirección",

        backToTop: "Volver arriba ↑",
      },
    },
  };

  let currentLanguage = DEFAULT_LANGUAGE;
  let observer = null;
  let observerScheduled = false;

  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();

  function normalizeLanguage(language) {
    const value = String(language || DEFAULT_LANGUAGE)
      .trim()
      .toLowerCase();

    if (value.startsWith("en")) return "en";
    if (value.startsWith("es")) return "es";

    return "pt-BR";
  }

  function hasLanguage(language) {
    return Boolean(translations[normalizeLanguage(language)]);
  }

  function getByPath(object, path) {
    return String(path || "")
      .split(".")
      .reduce((current, key) => {
        if (
          current === null ||
          current === undefined ||
          typeof current !== "object"
        ) {
          return undefined;
        }

        return current[key];
      }, object);
  }

  function translate(key, language = currentLanguage) {
    const normalized = normalizeLanguage(language);

    const translated = getByPath(translations[normalized], key);

    if (translated !== undefined && translated !== null) {
      return translated;
    }

    const fallback = getByPath(translations[DEFAULT_LANGUAGE], key);

    if (fallback !== undefined && fallback !== null) {
      return fallback;
    }

    return key;
  }

  function interpolate(text, variables = {}) {
    let result = String(text ?? "");

    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(
        new RegExp(`\\{${key}\\}`, "g"),
        String(value ?? ""),
      );
    });

    return result;
  }

  function t(key, language = currentLanguage, variables = {}) {
    return interpolate(translate(key, language), variables);
  }

  function flattenDictionary(object, prefix = "", result = {}) {
    Object.entries(object || {}).forEach(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        flattenDictionary(value, path, result);
      } else if (typeof value === "string") {
        result[path] = value;
      }
    });

    return result;
  }

  function buildSourceMap() {
    const flat = flattenDictionary(translations[DEFAULT_LANGUAGE]);

    const map = new Map();

    Object.entries(flat).forEach(([key, value]) => {
      const normalized = String(value).trim();

      if (normalized && !map.has(normalized)) {
        map.set(normalized, key);
      }
    });

    return map;
  }

  function translateKnownText(text, language = currentLanguage) {
    const raw = String(text ?? "");
    const trimmed = raw.trim();

    if (!trimmed) {
      return raw;
    }

    const key = buildSourceMap().get(trimmed);

    if (!key) {
      return raw;
    }

    const translated = t(key, language);

    const leading = raw.match(/^\s*/)?.[0] || "";

    const trailing = raw.match(/\s*$/)?.[0] || "";

    return `${leading}${translated}${trailing}`;
  }

  function rememberAttribute(element, attribute) {
    let values = originalAttributes.get(element);

    if (!values) {
      values = {};
      originalAttributes.set(element, values);
    }

    if (!(attribute in values)) {
      values[attribute] = element.getAttribute(attribute);
    }

    return values[attribute];
  }

  function applyExplicitTranslations(root, language) {
    root.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;

      if (key) {
        element.textContent = t(key, language);
      }
    });

    const attributes = [
      ["data-i18n-placeholder", "placeholder", "i18nPlaceholder"],
      ["data-i18n-title", "title", "i18nTitle"],
      ["data-i18n-aria-label", "aria-label", "i18nAriaLabel"],
    ];

    attributes.forEach(([selector, attribute, datasetKey]) => {
      root.querySelectorAll(`[${selector}]`).forEach((element) => {
        const key = element.dataset[datasetKey];

        if (key) {
          element.setAttribute(attribute, t(key, language));
        }
      });
    });
  }

  function applyAutomaticTextTranslations(root, language) {
    const sourceMap = buildSourceMap();

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;

        if (!parent) {
          return NodeFilter.FILTER_REJECT;
        }

        if (
          ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(parent.tagName)
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        if (
          parent.closest(
            [
              "[data-no-i18n]",
              "[data-user-content]",
              "[data-product-content]",
            ].join(", "),
          )
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return node.nodeValue?.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });

    const nodes = [];

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach((node) => {
      if (!originalText.has(node)) {
        originalText.set(node, node.nodeValue);
      }

      const source = originalText.get(node);

      const trimmed = String(source || "").trim();

      const key = sourceMap.get(trimmed);

      if (!key) {
        if (language === DEFAULT_LANGUAGE) {
          node.nodeValue = source;
        }

        return;
      }

      const translated = t(key, language);

      const leading = String(source).match(/^\s*/)?.[0] || "";

      const trailing = String(source).match(/\s*$/)?.[0] || "";

      node.nodeValue = `${leading}${translated}${trailing}`;
    });

    const attributeMap = [
      ["placeholder", "data-i18n-placeholder"],
      ["title", "data-i18n-title"],
      ["aria-label", "data-i18n-aria-label"],
    ];

    root.querySelectorAll("*").forEach((element) => {
      attributeMap.forEach(([attribute, explicitAttribute]) => {
        if (
          !element.hasAttribute(attribute) ||
          element.hasAttribute(explicitAttribute)
        ) {
          return;
        }

        const source = rememberAttribute(element, attribute);

        const key = sourceMap.get(String(source || "").trim());

        if (key) {
          element.setAttribute(attribute, t(key, language));
        } else if (language === DEFAULT_LANGUAGE && source !== null) {
          element.setAttribute(attribute, source);
        }
      });
    });
  }

  function translatePage(language = currentLanguage, root = document) {
    const normalized = normalizeLanguage(language);

    currentLanguage = normalized;

    document.documentElement.lang = normalized;

    const target = root === document ? document.documentElement : root;

    if (!target) {
      return normalized;
    }

    applyExplicitTranslations(target, normalized);

    applyAutomaticTextTranslations(target, normalized);

    document.dispatchEvent(
      new CustomEvent("qt:languagechange", {
        detail: {
          language: normalized,
        },
      }),
    );

    return normalized;
  }

  function applyToDocument(language = currentLanguage, root = document) {
    return translatePage(language, root);
  }

  function getLanguage() {
    return currentLanguage;
  }

  function setLanguage(language, options = {}) {
    const normalized = normalizeLanguage(language);

    currentLanguage = normalized;

    if (options.translate !== false) {
      translatePage(normalized, options.root || document);
    }

    return normalized;
  }

  function observe(root = document.body) {
    if (!root || typeof MutationObserver === "undefined") {
      return null;
    }

    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver(() => {
      if (observerScheduled) {
        return;
      }

      observerScheduled = true;

      queueMicrotask(() => {
        observerScheduled = false;

        if (observer) {
          observer.disconnect();
        }

        translatePage(currentLanguage, document);

        if (observer) {
          observer.observe(root, {
            childList: true,
            subtree: true,
          });
        }
      });
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    return observer;
  }

  function stopObserving() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function deepMerge(target, source) {
    const output = {
      ...(target || {}),
    };

    Object.entries(source || {}).forEach(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        output[key] = deepMerge(output[key], value);
      } else {
        output[key] = value;
      }
    });

    return output;
  }

  function addTranslations(language, dictionary) {
    const normalized = normalizeLanguage(language);

    if (!dictionary || typeof dictionary !== "object") {
      return;
    }

    translations[normalized] = deepMerge(translations[normalized], dictionary);
  }

  function start() {
    translatePage(currentLanguage, document);

    if (document.body) {
      observe(document.body);
    } else {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          observe(document.body);
        },
        {
          once: true,
        },
      );
    }
  }

  window.QT_I18N = {
    DEFAULT_LANGUAGE,
    translations,
    normalizeLanguage,
    hasLanguage,
    translate,
    interpolate,
    t,
    translateKnownText,
    translatePage,
    applyToDocument,
    getLanguage,
    setLanguage,
    observe,
    stopObserving,
    addTranslations,
    start,
  };
})();

/* =========================================================
   QUALITY THERM — TRADUÇÕES DINÂMICAS DA HOME
   PT-BR / EN / ES
========================================================= */

(() => {
  "use strict";

  if (!window.QT_I18N) {
    console.error("QT_I18N não foi carregado.");
    return;
  }

  window.QT_I18N.addTranslations("pt-BR", {
    dynamic: {
      validation: {
        required: "Por favor, preencha os campos obrigatórios.",
        invalidCep: "Digite um CEP válido no formato 00000-000.",
        notInformed: "Não informado",
      },

      whatsapp: {
        general:
          "Olá! Vim pelo site da Quality Therm e gostaria de atendimento. Pode me ajudar?",

        catalog:
          "Olá! Vim pelo site da Quality Therm e gostaria de conhecer os modelos de aquecedores disponíveis.",

        purchase:
          "Olá! Vim pelo site da Quality Therm e gostaria de um orçamento para aquecedor. Preciso de orientação para escolher o modelo ideal.",

        final:
          "Olá! Vim pelo site da Quality Therm e gostaria de solicitar um orçamento.",

        assistance:
          "Olá! Vim pelo site da Quality Therm e gostaria de solicitar assistência técnica.\n\n" +
          "Nome: {name}\n" +
          "Marca: {brand}\n" +
          "Modelo: {model}\n" +
          "Problema informado: {problem}\n" +
          "CEP: {cep}\n\n" +
          "Gostaria de verificar a disponibilidade para atendimento.",

        maintenance:
          "Olá! Vim pelo site da Quality Therm e gostaria de agendar uma manutenção preventiva.\n\n" +
          "Nome: {name}\n" +
          "Marca: {brand}\n" +
          "Modelo: {model}\n" +
          "Última manutenção: {lastMaintenance}\n" +
          "CEP: {cep}\n\n" +
          "Gostaria de verificar a disponibilidade para atendimento.",

        installation:
          "Olá! Vim pelo site da Quality Therm e gostaria de solicitar um orçamento para instalação/substituição.\n\n" +
          "Nome: {name}\n" +
          "Serviço: {service}\n" +
          "Marca: {brand}\n" +
          "Modelo: {model}\n" +
          "Tipo de gás: {gas}\n" +
          "CEP: {cep}\n" +
          "Observações: {notes}\n\n" +
          "Gostaria de verificar as condições e disponibilidade para atendimento.",

        product:
          "Olá! Vim pelo site da Quality Therm e tenho interesse no {product}.\n\n" +
          "Gostaria de confirmar:\n" +
          "• disponibilidade;\n" +
          "• versão GN ou GLP;\n" +
          "• valor do equipamento;\n" +
          "• valor da instalação.\n\n" +
          "Pode me orientar?",

        condominium:
          "Olá! Vim pelo site da Quality Therm.\n\n" +
          "Sou {profile} e gostaria de informações sobre atendimento programado para condomínio.\n\n" +
          "Pode me explicar como funciona?",

        sizing:
          "Olá! Vim pelo site da Quality Therm e utilizei o dimensionador de aquecedor.\n\n" +
          "Dados informados:\n" +
          "• Uso simultâneo: {showers} chuveiro(s)\n" +
          "• Vazão aproximada: {flow} L/min por ducha\n" +
          "• Tipo de gás: {gas}\n" +
          "• Faixa estimada: {band}\n\n" +
          "Gostaria de confirmar qual modelo é mais indicado e receber um orçamento.",
      },

      sizingResult: {
        estimate: "Estimativa inicial",

        disclaimer:
          "O dimensionamento final pode variar conforme as condições da sua instalação. Para a indicação correta do modelo, fale com um especialista da Quality Therm.",

        confirm: "Confirmar com especialista",

        band40: "40 L/min ou mais",
      },
    },
  });

  window.QT_I18N.addTranslations("en", {
    dynamic: {
      validation: {
        required: "Please fill in all required fields.",

        invalidCep: "Enter a valid Brazilian ZIP code in the format 00000-000.",

        notInformed: "Not provided",
      },

      whatsapp: {
        general:
          "Hello! I came from the Quality Therm website and would like assistance. Can you help me?",

        catalog:
          "Hello! I came from the Quality Therm website and would like to see the available water heater models.",

        purchase:
          "Hello! I came from the Quality Therm website and would like a quote for a water heater. I need help choosing the right model.",

        final:
          "Hello! I came from the Quality Therm website and would like to request a quote.",

        assistance:
          "Hello! I came from the Quality Therm website and would like to request technical assistance.\n\n" +
          "Name: {name}\n" +
          "Brand: {brand}\n" +
          "Model: {model}\n" +
          "Reported problem: {problem}\n" +
          "ZIP code: {cep}\n\n" +
          "I would like to check service availability.",

        maintenance:
          "Hello! I came from the Quality Therm website and would like to schedule preventive maintenance.\n\n" +
          "Name: {name}\n" +
          "Brand: {brand}\n" +
          "Model: {model}\n" +
          "Last maintenance: {lastMaintenance}\n" +
          "ZIP code: {cep}\n\n" +
          "I would like to check service availability.",

        installation:
          "Hello! I came from the Quality Therm website and would like a quote for installation/replacement.\n\n" +
          "Name: {name}\n" +
          "Service: {service}\n" +
          "Brand: {brand}\n" +
          "Model: {model}\n" +
          "Gas type: {gas}\n" +
          "ZIP code: {cep}\n" +
          "Notes: {notes}\n\n" +
          "I would like to check service conditions and availability.",

        product:
          "Hello! I came from the Quality Therm website and I am interested in {product}.\n\n" +
          "I would like to confirm:\n" +
          "• availability;\n" +
          "• NG or LPG version;\n" +
          "• equipment price;\n" +
          "• installation price.\n\n" +
          "Can you help me?",

        condominium:
          "Hello! I came from the Quality Therm website.\n\n" +
          "I am a {profile} and would like information about scheduled condominium service.\n\n" +
          "Can you explain how it works?",

        sizing:
          "Hello! I came from the Quality Therm website and used the water heater sizing calculator.\n\n" +
          "Information provided:\n" +
          "• Simultaneous use: {showers} shower(s)\n" +
          "• Approximate flow: {flow} L/min per shower\n" +
          "• Gas type: {gas}\n" +
          "• Estimated range: {band}\n\n" +
          "I would like to confirm the most suitable model and receive a quote.",
      },

      sizingResult: {
        estimate: "Initial estimate",

        disclaimer:
          "Final sizing may vary depending on the conditions of your installation. To select the correct model, speak with a Quality Therm specialist.",

        confirm: "Confirm with a specialist",

        band40: "40 L/min or more",
      },
    },
  });

  window.QT_I18N.addTranslations("es", {
    dynamic: {
      validation: {
        required: "Por favor, complete los campos obligatorios.",

        invalidCep:
          "Introduzca un código postal brasileño válido en el formato 00000-000.",

        notInformed: "No informado",
      },

      whatsapp: {
        general:
          "¡Hola! Llegué desde el sitio web de Quality Therm y quisiera recibir atención. ¿Puede ayudarme?",

        catalog:
          "¡Hola! Llegué desde el sitio web de Quality Therm y quisiera conocer los modelos de calentadores disponibles.",

        purchase:
          "¡Hola! Llegué desde el sitio web de Quality Therm y quisiera un presupuesto para un calentador. Necesito orientación para elegir el modelo adecuado.",

        final:
          "¡Hola! Llegué desde el sitio web de Quality Therm y quisiera solicitar un presupuesto.",

        assistance:
          "¡Hola! Llegué desde el sitio web de Quality Therm y quisiera solicitar asistencia técnica.\n\n" +
          "Nombre: {name}\n" +
          "Marca: {brand}\n" +
          "Modelo: {model}\n" +
          "Problema informado: {problem}\n" +
          "Código postal: {cep}\n\n" +
          "Quisiera consultar la disponibilidad para la atención.",

        maintenance:
          "¡Hola! Llegué desde el sitio web de Quality Therm y quisiera programar un mantenimiento preventivo.\n\n" +
          "Nombre: {name}\n" +
          "Marca: {brand}\n" +
          "Modelo: {model}\n" +
          "Último mantenimiento: {lastMaintenance}\n" +
          "Código postal: {cep}\n\n" +
          "Quisiera consultar la disponibilidad para la atención.",

        installation:
          "¡Hola! Llegué desde el sitio web de Quality Therm y quisiera solicitar un presupuesto para instalación/sustitución.\n\n" +
          "Nombre: {name}\n" +
          "Servicio: {service}\n" +
          "Marca: {brand}\n" +
          "Modelo: {model}\n" +
          "Tipo de gas: {gas}\n" +
          "Código postal: {cep}\n" +
          "Observaciones: {notes}\n\n" +
          "Quisiera consultar las condiciones y la disponibilidad para la atención.",

        product:
          "¡Hola! Llegué desde el sitio web de Quality Therm y estoy interesado en {product}.\n\n" +
          "Quisiera confirmar:\n" +
          "• disponibilidad;\n" +
          "• versión GN o GLP;\n" +
          "• precio del equipo;\n" +
          "• precio de la instalación.\n\n" +
          "¿Puede orientarme?",

        condominium:
          "¡Hola! Llegué desde el sitio web de Quality Therm.\n\n" +
          "Soy {profile} y quisiera información sobre la atención programada para condominios.\n\n" +
          "¿Puede explicarme cómo funciona?",

        sizing:
          "¡Hola! Llegué desde el sitio web de Quality Therm y utilicé el dimensionador de calentadores.\n\n" +
          "Datos informados:\n" +
          "• Uso simultáneo: {showers} ducha(s)\n" +
          "• Caudal aproximado: {flow} L/min por ducha\n" +
          "• Tipo de gas: {gas}\n" +
          "• Rango estimado: {band}\n\n" +
          "Quisiera confirmar cuál es el modelo más adecuado y recibir un presupuesto.",
      },

      sizingResult: {
        estimate: "Estimación inicial",

        disclaimer:
          "El dimensionamiento final puede variar según las condiciones de la instalación. Para elegir el modelo correcto, consulte con un especialista de Quality Therm.",

        confirm: "Confirmar con un especialista",

        band40: "40 L/min o más",
      },
    },
  });
})();
