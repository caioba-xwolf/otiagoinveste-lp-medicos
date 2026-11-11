/* =========================================================
   Configuração central + tracking (Meta Pixel, GA4, GTM)
   Carregado no <head> de todas as páginas.
   ---------------------------------------------------------
   PREENCHA SOMENTE COM DADOS REAIS. Campos vazios = recurso desligado.
   ========================================================= */
window.LP_CONFIG = {
  // Meta Pixel já em uso no site atual (preservado).
  metaPixelId: "1028082333350113",

  // Google Analytics 4 — ex.: "G-XXXXXXXXXX". Vazio = não carrega.
  ga4Id: "",

  // Google Tag Manager — ex.: "GTM-XXXXXXX". Vazio = não carrega.
  // Se usar GTM para GA4/Meta, deixe ga4Id vazio para não duplicar.
  gtmId: "",

  // Endpoint PHP existente do site (mesmo contrato de dados do formulário atual).
  leadEndpoint: "/enviar-lead.php",

  // Mantidos por compatibilidade com o enviar-lead.php atual.
  // IMPORTANTE: o PHP deveria fixar o destinatário no servidor (ver documentação).
  emailDestino: "tiagoadmufpel@gmail.com",
  emailAssunto: "Novo Lead - Tiago Lopes (LP Médicos)",
  emailFromName: "Tiago Lopes",

  // Opcional — WhatsApp oficial no formato internacional só com dígitos (ex.: "5548999999999").
  // Vazio = botão de WhatsApp não aparece na página de obrigado.
  whatsappNumero: "",

  // Opcional — link real de agenda (Calendly, Google Agenda etc.).
  // Vazio = a página de obrigado informa que o contato será feito pelo WhatsApp.
  agendaUrl: ""
};

(function () {
  var C = window.LP_CONFIG;
  window.dataLayer = window.dataLayer || [];

  /* ---------- Meta Pixel (snippet oficial) ---------- */
  if (C.metaPixelId) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", C.metaPixelId);
    fbq("track", "PageView");
  }

  /* ---------- Google Tag Manager ---------- */
  if (C.gtmId) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(C.gtmId);
    document.head.appendChild(g);
  }

  /* ---------- Google Analytics 4 (gtag) ---------- */
  if (C.ga4Id) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(C.ga4Id);
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", C.ga4Id);
  }

  /* ---------- Helper único de eventos ----------
     lpTrack(nome, params, { meta: "Lead" | "ViewContent" | ..., metaCustom: bool, eventID })
     - Sempre envia ao dataLayer (GTM) e ao GA4 (se configurado).
     - Só envia ao Meta quando "meta" for informado explicitamente. */
  window.lpTrack = function (name, params, opts) {
    params = params || {};
    opts = opts || {};
    try { window.dataLayer.push(Object.assign({ event: name }, params)); } catch (e) {}
    try { if (C.ga4Id && window.gtag) gtag("event", name, params); } catch (e) {}
    try {
      if (opts.meta && window.fbq) {
        var extra = opts.eventID ? { eventID: opts.eventID } : undefined;
        fbq(opts.metaCustom ? "trackCustom" : "track", opts.meta, opts.metaParams || {}, extra);
      }
    } catch (e) {}
  };

  /* ---------- Atribuição (UTMs e IDs de anúncio) ----------
     Guarda a primeira origem da sessão para não perder UTMs
     se o visitante navegar por âncoras ou recarregar sem a query. */
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "fbclid", "gclid", "ad_id", "adset_id", "campaign_id"];
  var stored = {};
  try { stored = JSON.parse(sessionStorage.getItem("lp_attr") || "{}"); } catch (e) {}
  var qs = new URLSearchParams(window.location.search);
  var hasNew = KEYS.some(function (k) { return qs.get(k); });
  if (hasNew) {
    stored = {};
    KEYS.forEach(function (k) { if (qs.get(k)) stored[k] = qs.get(k); });
    stored.landing_page = window.location.pathname;
    stored.referrer = document.referrer || "";
    stored.first_seen = new Date().toISOString();
    try { sessionStorage.setItem("lp_attr", JSON.stringify(stored)); } catch (e) {}
  }
  window.lpAttribution = function () {
    var out = {};
    KEYS.forEach(function (k) { out[k] = stored[k] || ""; });
    out.landing_page = stored.landing_page || window.location.pathname;
    out.referrer = stored.referrer || document.referrer || "";
    return out;
  };
})();
