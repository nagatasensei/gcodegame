/*!
 * SENAI Theme JS — comportamentos para o senai-theme.css
 * Sem dependências. Inclua com: <script src="senai-theme.js" defer></script>
 *
 * Hooks (atributos data-*):
 *   .ms-header                      → recebe .is-scrolled ao rolar e define --ms-header-h
 *   [data-ms-nav-toggle]            → botão do menu mobile (controla [data-ms-nav])
 *   [data-ms-nav] a[href^="#"]      → recebe .is-active conforme a seção visível
 *   [data-ms-tabs]                  → abas acessíveis (botões .ms-tab + painéis .ms-tabpanel)
 *   [data-ms-accordion]             → FAQ: abre um <details class="ms-acc"> por vez
 *   [data-ms-reveal]                → entrada suave ao rolar (opcional)
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Cabeçalho: estado de rolagem + altura real ---------- */
  function initHeader() {
    var header = $(".ms-header");
    if (!header) return;

    function setHeight() {
      document.documentElement.style.setProperty("--ms-header-h", header.offsetHeight + "px");
    }
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
        ticking = false;
      });
    }

    setHeight();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", setHeight);
  }

  /* ---------- Menu mobile ---------- */
  function initNav() {
    var header = $(".ms-header");
    var toggle = $("[data-ms-nav-toggle]");
    var nav = $("[data-ms-nav]");
    if (!header || !toggle || !nav) return;

    function setOpen(open) {
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }

    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) setOpen(false);
    });
  }

  /* ---------- Scrollspy: marca o link da seção atual ---------- */
  function initScrollSpy() {
    var links = $$('[data-ms-nav] a[href^="#"], [data-ms-nav] a[href*="/#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").split("#")[1];
      var target = id && document.getElementById(id);
      if (target) map[id] = a;
    });
    var ids = Object.keys(map);
    if (!ids.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        map[entry.target.id].classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    ids.forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ---------- Abas ---------- */
  function initTabs() {
    $$("[data-ms-tabs]").forEach(function (root) {
      var tabs = $$(".ms-tab", root);
      var panels = $$(".ms-tabpanel", root);
      if (!tabs.length || tabs.length !== panels.length) return;

      var list = tabs[0].parentElement;
      var uid = "ms-tabs-" + Math.random().toString(36).slice(2, 7);
      list.setAttribute("role", "tablist");

      tabs.forEach(function (tab, i) {
        tab.setAttribute("role", "tab");
        tab.id = tab.id || uid + "-tab-" + i;
        panels[i].setAttribute("role", "tabpanel");
        panels[i].id = panels[i].id || uid + "-panel-" + i;
        tab.setAttribute("aria-controls", panels[i].id);
        panels[i].setAttribute("aria-labelledby", tab.id);
        if (tab.parentElement !== list) tab.parentElement.setAttribute("role", "presentation");
      });

      function select(index, focus) {
        tabs.forEach(function (tab, i) {
          var on = i === index;
          tab.setAttribute("aria-selected", String(on));
          tab.tabIndex = on ? 0 : -1;
          panels[i].hidden = !on;
        });
        if (focus) tabs[index].focus();
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { select(i, false); });
        tab.addEventListener("keydown", function (e) {
          var next = null;
          if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
          else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === "Home") next = 0;
          else if (e.key === "End") next = tabs.length - 1;
          if (next !== null) { e.preventDefault(); select(next, true); }
        });
      });

      var initial = tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; });
      select(initial > -1 ? initial : 0, false);
    });
  }

  /* ---------- FAQ: um item aberto por vez ---------- */
  function initAccordion() {
    $$("[data-ms-accordion]").forEach(function (group) {
      var items = $$("details.ms-acc", group);
      items.forEach(function (item) {
        item.addEventListener("toggle", function () {
          if (!item.open) return;
          items.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        });
      });
    });
  }

  /* ---------- Entrada suave (opt-in) ---------- */
  function initReveal() {
    var items = $$("[data-ms-reveal]");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    document.documentElement.classList.add("ms-js");
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Validação simples de formulário ---------- */
  function initForms() {
    $$("form[data-ms-form]").forEach(function (form) {
      form.setAttribute("novalidate", "");
      form.addEventListener("submit", function (e) {
        var valid = true;
        $$(".ms-field", form).forEach(function (field) {
          var input = $(".ms-input, .ms-select, .ms-textarea", field);
          if (!input) return;
          var old = $(".ms-field__error", field);
          if (old) old.remove();
          field.classList.remove("has-error");
          input.removeAttribute("aria-invalid");
          if (!input.checkValidity()) {
            valid = false;
            field.classList.add("has-error");
            input.setAttribute("aria-invalid", "true");
            var msg = document.createElement("span");
            msg.className = "ms-field__error";
            msg.setAttribute("role", "alert");
            msg.textContent = input.validationMessage;
            field.appendChild(msg);
          }
        });
        if (!valid) {
          e.preventDefault();
          var first = $(".has-error .ms-input, .has-error .ms-select, .has-error .ms-textarea", form);
          if (first) first.focus();
        }
      });
    });
  }

  function init() {
    initHeader();
    initNav();
    initScrollSpy();
    initTabs();
    initAccordion();
    initReveal();
    initForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.SenaiTheme = { init: init };
})();
