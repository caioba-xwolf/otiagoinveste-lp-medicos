/* =========================================================
   Interações da landing page (sem dependências)
   - Formulário: validação, máscara, envio ao endpoint existente
   - Tracking: cliques em CTA, início de formulário, ViewContent
   - UX: CTA fixo no mobile, animações sutis
   ========================================================= */
(function () {
  "use strict";
  var C = window.LP_CONFIG || {};
  var track = window.lpTrack || function () {};
  var hasIO = "IntersectionObserver" in window;

  /* ---------- Cliques nos CTAs (não é conversão) ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-cta]");
    if (!el) return;
    track("cta_click", { cta_id: el.getAttribute("data-cta"), cta_text: (el.textContent || "").trim().slice(0, 60) });
  });

  /* ---------- ViewContent: visitante viu o Método (uma vez) ---------- */
  var metodo = document.getElementById("metodo");
  if (metodo && hasIO) {
    var vcSent = false;
    var vcObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !vcSent) {
          vcSent = true;
          track("view_metodo", { section: "metodo_mapa" }, { meta: "ViewContent", metaParams: { content_name: "Metodo MAPA" } });
          vcObs.disconnect();
        }
      });
    }, { threshold: 0.35 });
    vcObs.observe(metodo);
  }

  /* ---------- Animações de entrada ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (hasIO && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var rvObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); rvObs.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { rvObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- CTA fixo no mobile ---------- */
  var sticky = document.getElementById("sticky-cta");
  var hero = document.getElementById("inicio");
  var diag = document.getElementById("diagnostico");
  if (sticky && hero && diag && hasIO) {
    var heroVisible = true, diagVisible = false;
    var update = function () {
      var show = !heroVisible && !diagVisible;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      var a = sticky.querySelector("a");
      if (a) a.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; update(); }, { threshold: 0 }).observe(hero);
    new IntersectionObserver(function (en) { diagVisible = en[0].isIntersecting; update(); }, { threshold: 0 }).observe(diag);
  }

  /* ---------- Ano no rodapé ---------- */
  var ano = document.getElementById("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());

  /* =========================================================
     FORMULÁRIO
     ========================================================= */
  var form = document.getElementById("lead-form");
  if (!form) return;
  window.__lpFormReady = true; // o handler abaixo assume o envio (com preventDefault)

  var $ = function (id) { return document.getElementById(id); };
  var fields = {
    nome: { el: $("f-nome"), err: $("e-nome") },
    telefone: { el: $("f-tel"), err: $("e-tel") },
    email: { el: $("f-email"), err: $("e-email") },
    patrimonio_investido: { el: $("f-patr"), err: $("e-patr") },
    objetivo: { el: $("f-obj"), err: $("e-obj") }
  };
  var alertBox = $("form-alert");
  var submitBtn = $("f-submit");
  var submitLabel = submitBtn.querySelector(".btn-label");
  var labelDefault = submitLabel.textContent;

  /* Máscara de telefone brasileiro */
  function maskPhone(v) {
    var d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 3) + " " + d.slice(3, 7) + "-" + d.slice(7);
  }
  fields.telefone.el.addEventListener("input", function (e) {
    e.target.value = maskPhone(e.target.value);
  });

  /* form_start — primeira interação real com o formulário */
  var started = false;
  form.addEventListener("focusin", function () {
    if (started) return;
    started = true;
    track("form_start", { form_id: "diagnostico" });
  });

  function setError(key, msg) {
    var f = fields[key];
    f.err.textContent = msg || "";
    if (msg) { f.el.setAttribute("aria-invalid", "true"); f.el.parentNode.setAttribute("data-invalid", ""); }
    else { f.el.removeAttribute("aria-invalid"); f.el.parentNode.removeAttribute("data-invalid"); }
  }

  function validate() {
    var errors = {};
    var nome = fields.nome.el.value.trim();
    var tel = fields.telefone.el.value.replace(/\D/g, "");
    var email = fields.email.el.value.trim();
    if (nome.length < 3) errors.nome = "Informe seu nome.";
    if (tel.length < 10 || tel.length > 11) errors.telefone = "Informe um WhatsApp válido com DDD.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Informe um e-mail válido.";
    if (!fields.patrimonio_investido.el.value) errors.patrimonio_investido = "Selecione uma faixa.";
    if (!fields.objetivo.el.value) errors.objetivo = "Selecione um objetivo.";
    Object.keys(fields).forEach(function (k) { setError(k, errors[k]); });
    return errors;
  }

  /* Revalida o campo ao sair dele, se já estava com erro */
  Object.keys(fields).forEach(function (k) {
    fields[k].el.addEventListener("blur", function () {
      if (fields[k].el.getAttribute("aria-invalid")) validate();
    });
    fields[k].el.addEventListener("change", function () {
      if (fields[k].el.getAttribute("aria-invalid")) validate();
    });
  });

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "lead-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    form.setAttribute("aria-busy", on ? "true" : "false");
    submitLabel.textContent = on ? "Enviando…" : labelDefault;
  }

  function showAlert(msg) {
    alertBox.textContent = msg;
    alertBox.hidden = !msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showAlert("");

    // Honeypot: bots preenchem; encerramos sem enviar e sem disparar conversão.
    if ($("f-site").value) return;

    var errors = validate();
    var firstKey = Object.keys(fields).find(function (k) { return errors[k]; });
    if (firstKey) {
      fields[firstKey].el.focus();
      track("form_error", { form_id: "diagnostico", field: firstKey });
      return;
    }

    var eventId = uuid();
    var now = new Date();
    var attr = window.lpAttribution ? window.lpAttribution() : {};
    var tel = fields.telefone.el.value.replace(/\D/g, "");

    // Mesmo contrato do formulário atual + campos novos (o PHP precisa aceitá-los — ver documentação).
    var payload = Object.assign({
      nome: fields.nome.el.value.trim(),
      email: fields.email.el.value.trim(),
      telefone: tel,
      whatsapp: tel,
      especialidade: $("f-esp").value.trim(),
      patrimonio_investido: fields.patrimonio_investido.el.value,
      objetivo: fields.objetivo.el.value,
      pagina: window.location.pathname.replace(/\/$/, "") || "/",
      variante_hero: document.documentElement.getAttribute("data-hv") || "controle",
      data_hora_conversao: now.toISOString(),
      data_hora_local: now.toLocaleString("pt-BR"),
      event_id: eventId,
      email_cliente: C.emailDestino,
      assunto_email: C.emailAssunto,
      from_name: C.emailFromName
    }, attr);

    setLoading(true);
    track("form_submit_attempt", { form_id: "diagnostico" });

    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);

    fetch(C.leadEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return null; }).then(function (data) {
          if (!res.ok || (data && data.status === "erro")) {
            throw new Error((data && data.mensagem) || "Não foi possível enviar seus dados. Tente novamente.");
          }
          return data;
        });
      })
      .then(function () {
        clearTimeout(timer);
        // Sinaliza para a página de obrigado que houve um envio real.
        // O evento Lead só é disparado lá, e só com esta marca (evita conversões falsas).
        try {
          sessionStorage.setItem("lp_lead_ok", JSON.stringify({
            event_id: eventId,
            ts: Date.now(),
            patrimonio: payload.patrimonio_investido,
            objetivo: payload.objetivo,
            variante_hero: payload.variante_hero
          }));
        } catch (err) {}
        window.location.href = "/obrigado/";
      })
      .catch(function (err) {
        clearTimeout(timer);
        setLoading(false);
        var msg = err && err.name === "AbortError"
          ? "A conexão demorou mais que o esperado. Verifique sua internet e tente novamente."
          : (err && err.message) || "Não foi possível enviar seus dados. Tente novamente.";
        showAlert(msg);
        track("form_submit_error", { form_id: "diagnostico", error: String(msg).slice(0, 100) });
      });
  });
})();
