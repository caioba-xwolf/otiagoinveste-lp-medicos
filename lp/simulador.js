/* =========================================================
   Simulador de investimentos + carteira ilustrativa
   Sem dependências. Gráfico em SVG nativo.
   ========================================================= */
(function () {
  "use strict";
  var track = window.lpTrack || function () {};

  /* ---------------- Matemática (exposta para testes) ---------------- */
  // Taxa anual efetiva -> mensal: i = (1 + a)^(1/12) - 1
  function monthlyRate(annual) { return Math.pow(1 + annual, 1 / 12) - 1; }

  // Valor futuro com aportes ao final de cada mês
  // VF = P(1+i)^n + A[((1+i)^n - 1)/i]   |  i = 0  ->  VF = P + A·n
  function futureValue(P, A, i, n) {
    if (Math.abs(i) < 1e-12) return P + A * n;
    var f = Math.pow(1 + i, n);
    return P * f + A * ((f - 1) / i);
  }

  /*
   * Série anual de três cenários.
   * Com inflação: tudo em "valores de hoje" — usa a taxa real
   * (1+taxa)/(1+inflação)-1 e considera aportes reajustados pela inflação.
   */
  function simulate(o) {
    var anos = o.anos, rNom = o.taxa, infl = o.inflacao || 0;
    var real = !!o.real;
    var rEff = real ? (1 + rNom) / (1 + infl) - 1 : rNom;
    var i = monthlyRate(rEff);
    var A = [], B = [], C = [];
    for (var y = 0; y <= anos; y++) {
      var m = y * 12;
      C.push(futureValue(o.P, o.aporte, i, m));
      B.push(futureValue(o.P, 0, i, m));
      A.push(real ? o.P / Math.pow(1 + infl, y) : o.P);
    }
    var n = anos * 12;
    var vf = C[anos];
    var aportes = o.aporte * n;
    var capital = o.P + aportes;
    return { A: A, B: B, C: C, vf: vf, aportes: aportes, capital: capital, rendimentos: vf - capital, iMensal: i };
  }
  window.LPSim = { monthlyRate: monthlyRate, futureValue: futureValue, simulate: simulate };

  /* ---------------- Formatação ---------------- */
  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  var brlCompact = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });
  var num = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
  function money(v) { return brl.format(Math.round(v)); }
  function moneyShort(v) { return Math.abs(v) < 1000 ? brl.format(Math.round(v)) : brlCompact.format(v); }

  /* ---------------- Simulador (UI) ---------------- */
  var root = document.getElementById("sim");
  if (root) initSimulator();

  function initSimulator() {
    var $ = function (id) { return document.getElementById(id); };
    var inP = $("sim-p"), rgP = $("sim-p-range");
    var inA = $("sim-a"), rgA = $("sim-a-range");
    var rgN = $("sim-n"), outN = $("sim-n-out");
    var inR = $("sim-r"), chips = root.querySelectorAll(".rate-chip");
    var inflOn = $("sim-infl-on"), inflRow = $("sim-infl-row"), inInfl = $("sim-infl");
    var chartEl = $("sim-chart"), tip = $("sim-tip");
    var interacted = false;
    var state = { P: 100000, aporte: 3000, anos: 20, taxa: 0.08, inflacao: 0.04, real: false };
    var ready = false;
    var last = null, hoverYear = null, raf = 0;

    function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
    function digits(s) { var d = String(s).replace(/\D/g, ""); return d ? parseInt(d, 10) : 0; }

    function bindMoney(input, range, key, outId) {
      var min = +input.dataset.min, max = +input.dataset.max;
      function apply(v, from) {
        v = clamp(v, min, max);
        state[key] = v;
        if (from !== "input") input.value = num.format(v);
        if (from !== "range") range.value = String(Math.min(v, +range.max));
        $(outId).textContent = money(v);
        schedule();
      }
      input.addEventListener("input", function () {
        var v = digits(input.value);
        input.value = input.value.replace(/[^\d.]/g, "") === "" ? "" : num.format(Math.min(v, max));
        apply(v, "input");
      });
      input.addEventListener("blur", function () { input.value = num.format(state[key]); });
      range.addEventListener("input", function () { apply(+range.value, "range"); });
      apply(state[key], "init");
    }
    bindMoney(inP, rgP, "P", "sim-p-out");
    bindMoney(inA, rgA, "aporte", "sim-a-out");

    rgN.addEventListener("input", function () {
      state.anos = clamp(parseInt(rgN.value, 10) || 1, 1, 40);
      outN.textContent = state.anos + (state.anos === 1 ? " ano" : " anos");
      schedule();
    });

    function setRate(pct, fromInput) {
      var v = parseFloat(String(pct).replace(",", "."));
      if (!isFinite(v)) return;
      v = clamp(v, 0, 30);
      state.taxa = v / 100;
      if (!fromInput) inR.value = String(v);
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(+c.dataset.rate === v)); });
      schedule();
    }
    chips.forEach(function (c) { c.addEventListener("click", function () { setRate(c.dataset.rate); }); });
    inR.addEventListener("input", function () { if (inR.value !== "") setRate(inR.value, true); });
    inR.addEventListener("blur", function () { inR.value = String(+(state.taxa * 100).toFixed(2)); });

    inflOn.addEventListener("change", function () {
      state.real = inflOn.checked;
      inflRow.hidden = !inflOn.checked;
      schedule();
    });
    inInfl.addEventListener("input", function () {
      var v = parseFloat(String(inInfl.value).replace(",", "."));
      if (isFinite(v)) { state.inflacao = clamp(v, 0, 20) / 100; schedule(); }
    });
    inInfl.addEventListener("blur", function () { inInfl.value = String(+(state.inflacao * 100).toFixed(2)); });

    root.addEventListener("input", function () {
      if (!interacted) { interacted = true; track("simulator_interaction", { section: "simulador" }); }
    });

    // Renderiza no próximo quadro; o timer garante a atualização mesmo se
    // o navegador pausar requestAnimationFrame (aba em segundo plano etc.).
    function schedule() {
      if (!ready || raf) return;
      raf = 1;
      var done = false;
      var go = function () { if (done) return; done = true; raf = 0; render(); };
      if (window.requestAnimationFrame) requestAnimationFrame(go);
      setTimeout(go, 120);
    }

    function render() {
      last = simulate(state);
      $("st-p").textContent = money(state.P);
      $("st-a").textContent = money(last.aportes);
      $("st-vf").textContent = money(last.vf);
      $("st-g").textContent = money(last.rendimentos);
      $("st-cap").textContent = money(last.capital);
      $("st-real-note").hidden = !state.real;
      chartEl.setAttribute("aria-label",
        "Evolução hipotética em " + state.anos + " anos" + (state.real ? ", em valores de hoje" : "") +
        ": com aportes mensais " + money(last.vf) + "; investimento inicial sem aportes " + money(last.B[state.anos]) +
        "; dinheiro sem remuneração " + money(last.A[state.anos]) + ".");
      drawChart();
    }

    /* ---------- Gráfico SVG ---------- */
    var NS = "http://www.w3.org/2000/svg";
    function el(name, attrs, parent) {
      var e = document.createElementNS(NS, name);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    }
    // Topo do eixo = 4 × um passo "redondo" (1; 1,5; 2; 2,5; 3; 4; 5; 6; 8 × 10^k)
    function niceMax(v) {
      if (v <= 0) return 4;
      var raw = v / 4;
      var p = Math.pow(10, Math.floor(Math.log10(raw)));
      var steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
      for (var s = 0; s < steps.length; s++) if (steps[s] * p >= raw) return steps[s] * p * 4;
      return 40 * p;
    }

    var geo = null;
    function drawChart() {
      var W = Math.max(280, chartEl.clientWidth || 600);
      var H = W < 520 ? 240 : 300;
      var pad = { l: W < 520 ? 62 : 74, r: 14, t: 14, b: 30 };
      var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
      var N = state.anos;
      var maxV = niceMax(Math.max.apply(null, last.C.concat(last.B, last.A)) * 1.04);
      var x = function (y) { return pad.l + (N === 0 ? 0 : (y / N) * iw); };
      var yv = function (v) { return pad.t + ih - (Math.max(0, v) / maxV) * ih; };
      geo = { x: x, yv: yv, pad: pad, iw: iw, ih: ih, W: W, H: H, N: N };

      chartEl.innerHTML = "";
      var svg = el("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + H, "aria-hidden": "true", focusable: "false" }, chartEl);

      // grade + eixo Y
      for (var t = 0; t <= 4; t++) {
        var val = (maxV / 4) * t, gy = yv(val);
        el("line", { x1: pad.l, x2: W - pad.r, y1: gy, y2: gy, class: "grid" }, svg);
        var tx = el("text", { x: pad.l - 8, y: gy + 4, class: "axis", "text-anchor": "end" }, svg);
        tx.textContent = moneyShort(val);
      }
      // eixo X
      var stepX = N <= 10 ? (N <= 5 ? 1 : 2) : N <= 20 ? 5 : 10;
      for (var yx = 0; yx <= N; yx += stepX) {
        var lx = el("text", { x: x(yx), y: H - 8, class: "axis", "text-anchor": yx === 0 ? "start" : "middle" }, svg);
        lx.textContent = yx === 0 ? "Hoje" : yx + (W < 520 ? "a" : " anos");
      }

      function path(series) {
        return series.map(function (v, k) { return (k ? "L" : "M") + x(k).toFixed(1) + " " + yv(v).toFixed(1); }).join(" ");
      }
      // área do cenário C
      el("path", { d: path(last.C) + " L" + x(N) + " " + yv(0) + " L" + x(0) + " " + yv(0) + " Z", class: "area-c" }, svg);
      el("path", { d: path(last.A), class: "line-a" }, svg);
      el("path", { d: path(last.B), class: "line-b" }, svg);
      el("path", { d: path(last.C), class: "line-c" }, svg);

      // marcador interativo
      geo.cursor = el("line", { y1: pad.t, y2: pad.t + ih, class: "cursor", visibility: "hidden" }, svg);
      geo.dot = el("circle", { r: 5, class: "dot-c", visibility: "hidden" }, svg);
      if (hoverYear !== null) showTip(Math.min(hoverYear, N));
    }

    function showTip(y) {
      if (!geo || !last) return;
      hoverYear = y;
      var cx = geo.x(y);
      geo.cursor.setAttribute("x1", cx); geo.cursor.setAttribute("x2", cx); geo.cursor.setAttribute("visibility", "visible");
      geo.dot.setAttribute("cx", cx); geo.dot.setAttribute("cy", geo.yv(last.C[y])); geo.dot.setAttribute("visibility", "visible");
      tip.innerHTML =
        "<b>" + (y === 0 ? "Hoje" : "Ano " + y) + "</b>" +
        "<span><i class='lg-c'></i>" + money(last.C[y]) + "</span>" +
        "<span><i class='lg-b'></i>" + money(last.B[y]) + "</span>" +
        "<span><i class='lg-a'></i>" + money(last.A[y]) + "</span>";
      tip.hidden = false;
      var left = cx + 12, tw = tip.offsetWidth;
      if (left + tw > geo.W - 4) left = cx - tw - 12;
      tip.style.left = Math.max(4, left) + "px";
      tip.style.top = (geo.pad.t + 4) + "px";
    }
    function hideTip() {
      hoverYear = null; tip.hidden = true;
      if (geo) { geo.cursor.setAttribute("visibility", "hidden"); geo.dot.setAttribute("visibility", "hidden"); }
    }
    function yearFromEvent(e) {
      var r = chartEl.getBoundingClientRect();
      var px = e.clientX - r.left;
      var y = Math.round(((px - geo.pad.l) / geo.iw) * geo.N);
      return Math.min(geo.N, Math.max(0, y));
    }
    chartEl.addEventListener("pointermove", function (e) { if (geo) showTip(yearFromEvent(e)); });
    chartEl.addEventListener("pointerdown", function (e) { if (geo) showTip(yearFromEvent(e)); });
    chartEl.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hideTip(); });
    // teclado: setas percorrem os anos
    chartEl.tabIndex = 0;
    chartEl.addEventListener("keydown", function (e) {
      if (!geo) return;
      var y = hoverYear === null ? geo.N : hoverYear;
      if (e.key === "ArrowRight") y = Math.min(geo.N, y + 1);
      else if (e.key === "ArrowLeft") y = Math.max(0, y - 1);
      else if (e.key === "Home") y = 0;
      else if (e.key === "End") y = geo.N;
      else if (e.key === "Escape") { hideTip(); return; }
      else return;
      e.preventDefault(); showTip(y);
    });
    chartEl.addEventListener("blur", hideTip);

    // Só calcula e desenha quando o simulador se aproxima da tela
    // (evita trabalho na thread principal durante o carregamento).
    function start() {
      if (ready) return;
      ready = true;
      render();
      if ("ResizeObserver" in window) {
        var lastW = chartEl.clientWidth;
        new ResizeObserver(function () {
          var w = chartEl.clientWidth;
          if (Math.abs(w - lastW) > 2) { lastW = w; schedule(); }
        }).observe(chartEl);
      } else {
        window.addEventListener("resize", schedule);
      }
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { io.disconnect(); start(); }
      }, { rootMargin: "600px 0px" });
      io.observe(root.closest("section") || root);
      // Redes de segurança: primeira interação ou alguns segundos após o carregamento.
      root.addEventListener("focusin", start);
      root.addEventListener("pointerdown", start);
      var later = function () { setTimeout(start, 3500); };
      if (document.readyState === "complete") later(); else window.addEventListener("load", later);
    } else {
      start();
    }
  }

  /* ---------------- Carteira ilustrativa ---------------- */
  var cart = document.getElementById("cart");
  if (cart) {
    var INFO = {
      rf: ["Renda fixa · 50%", "Pode contribuir para objetivos relacionados a previsibilidade de fluxos, liquidez e gerenciamento de risco, dependendo dos ativos escolhidos."],
      acoes: ["Ações · 25%", "Representam participação em empresas e estão sujeitas a oscilações e riscos de mercado."],
      fii: ["Fundos imobiliários · 15%", "Permitem exposição a segmentos do mercado imobiliário e podem distribuir rendimentos, que não são garantidos."],
      intl: ["Investimentos internacionais · 10%", "Podem contribuir para diversificação geográfica e cambial, envolvendo riscos específicos."]
    };
    var btns = cart.querySelectorAll(".cls");
    var segs = cart.querySelectorAll(".seg");
    var desc = document.getElementById("cart-desc");
    var touched = false;
    var select = function (k) {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.k === k)); });
      segs.forEach(function (s) { s.classList.toggle("is-dim", s.dataset.k !== k); });
      desc.innerHTML = '<p class="cart-desc-title">' + INFO[k][0] + "</p><p>" + INFO[k][1] + "</p>";
      if (!touched) { touched = true; track("portfolio_interaction", { section: "carteira" }); }
    };
    btns.forEach(function (b) { b.addEventListener("click", function () { select(b.dataset.k); }); });
    segs.forEach(function (s) { s.addEventListener("click", function () { select(s.dataset.k); }); });
    // estado inicial sem disparar evento
    segs.forEach(function (s) { s.classList.toggle("is-dim", s.dataset.k !== "rf"); });
  }
})();
