# Quality Therm — Landing Page de Conversão

Projeto estático, responsivo e sem frameworks pesados, pensado para alta velocidade e fácil edição no VS Code.

## 1. Abrir no VS Code

1. Extraia a pasta `qualitytherm-landing`.
2. Abra o VS Code.
3. Vá em **File > Open Folder**.
4. Selecione a pasta `qualitytherm-landing`.
5. Instale a extensão **Live Server** (opcional, recomendada).
6. Clique com o botão direito em `index.html` > **Open with Live Server**.

## 2. Onde alterar WhatsApp, telefone e rastreamento

Abra `js/config.js`.

- `whatsapp`: número principal, somente dígitos com DDI 55.
- `secondaryPhone`: telefone secundário.
- `gtmId`: ID do Google Tag Manager (GTM-XXXXXXX).
- `ga4Id`: referência do GA4. Nesta versão, recomenda-se publicar GA4 pelo GTM.
- `googleAdsId` / `googleAdsLeadLabel`: referências para configuração de conversões.

Enquanto o GTM estiver como `GTM-XXXXXXX`, nenhum script externo do Tag Manager será carregado.

## 3. Eventos já enviados ao dataLayer

- `page_context`
- `whatsapp_click`
- `generate_lead`
- `product_interest`
- `service_interest`
- `condo_interest`
- `calculator_complete`
- `phone_click`
- CTAs de navegação (`cta_buy`, `quick_dimensionar`, etc.)

O evento `generate_lead` segue a nomenclatura recomendada pelo GA4 para geração de lead.

## 4. UTM e origem de campanha

A página captura e salva:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `gclid`
- `fbclid`
- referrer

Mantém first-touch e last-touch em `localStorage` e inclui origem/campanha na mensagem enviada ao WhatsApp.

Exemplo de URL de campanha:

`/?utm_source=google&utm_medium=cpc&utm_campaign=manutencao_aquecedor&utm_term=manutencao+rinnai`

## 5. Google Tag Manager / GA4 / Google Ads

No GTM, crie:

1. Tag Google/GA4 para todas as páginas.
2. Evento GA4 acionado quando `event = generate_lead`.
3. Conversão Google Ads acionada quando `event = generate_lead` (ou crie eventos separados para leads qualificados).
4. Eventos auxiliares para `whatsapp_click`, `calculator_complete`, `product_interest` e `service_interest`.
5. Teste no Preview/Tag Assistant antes de publicar.

## 6. Meta Ads

O código já preserva `fbclid` e UTMs. Recomenda-se instalar o Meta Pixel via GTM e disparar um evento `Lead` quando ocorrer `generate_lead`.

## 7. Meta de velocidade

A página foi construída com:

- zero bibliotecas externas de interface;
- zero fontes externas;
- zero imagens pesadas na primeira dobra;
- CSS e JS pequenos;
- JavaScript principal com `defer`;
- GTM carregado de forma assíncrona apenas depois de inserir um ID válido;
- layout responsivo sem framework.

Isso ajuda a buscar carregamento abaixo de 3 s, mas **3 segundos não podem ser garantidos apenas pelo código**: hospedagem, distância do servidor, conexão do visitante, GTM/pixels, imagens futuras e scripts de terceiros influenciam o resultado.

Depois de publicar, teste com PageSpeed Insights / Lighthouse em Mobile e Desktop e ajuste as imagens para WebP/AVIF, preferencialmente abaixo de ~100–150 KB cada.

## 8. Antes de colocar em produção

- Conferir número principal e horários de atendimento.
- Inserir logo oficial em SVG/WebP.
- Trocar os blocos visuais dos produtos por fotos otimizadas autorizadas.
- Conferir modelos, preços, disponibilidade e versões GN/GLP.
- Inserir avaliações reais e verificáveis.
- Inserir página/política de privacidade e adequar consentimento de cookies conforme a implementação de mídia/LGPD.
- Conectar formulário/CRM em uma próxima etapa se desejar capturar leads além do WhatsApp.

## Estrutura

```
qualitytherm-landing/
├── index.html
├── robots.txt
├── sitemap.xml
├── assets/
│   └── favicon.svg
├── css/
│   └── style.css
└── js/
    ├── config.js
    └── app.js
```
