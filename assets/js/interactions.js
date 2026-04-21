(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    mountReveal();
    mountCounters();
    mountDayTabs();
    mountFilters();
    mountProgressBar();
    mountBackToTop();
    mountFabDock();
    mountRipple();
  }

  // ------- Scroll reveal -------
  function mountReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }

  // ------- Contadores animados -------
  function mountCounters() {
    var nodes = document.querySelectorAll("[data-count-to]");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.textContent = el.getAttribute("data-count-to"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var duration = parseInt(el.getAttribute("data-duration") || "1400", 10);
    var start = 0;
    var startTs = null;
    function step(ts) {
      if (!startTs) startTs = ts;
      var p = Math.min((ts - startTs) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = start + (target - start) * eased;
      var formatted = Number.isInteger(target) ? Math.round(value) : value.toFixed(1);
      el.textContent = prefix + formatted + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ------- Tabs de itinerario (días) -------
  function mountDayTabs() {
    var groups = document.querySelectorAll("[data-day-tabs]");
    groups.forEach(function (group) {
      var tabs = group.querySelectorAll(".day-tab");
      var panels = group.querySelectorAll(".day-panel");
      if (!tabs.length || !panels.length) return;
      tabs.forEach(function (tab, idx) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) { t.classList.remove("is-active"); });
          panels.forEach(function (p) { p.classList.remove("is-active"); });
          tab.classList.add("is-active");
          var target = tab.getAttribute("data-target");
          var panel = target
            ? group.querySelector(target)
            : panels[idx];
          if (panel) panel.classList.add("is-active");
        });
      });
      if (!group.querySelector(".day-tab.is-active")) {
        tabs[0].classList.add("is-active");
      }
      if (!group.querySelector(".day-panel.is-active")) {
        panels[0].classList.add("is-active");
      }
    });
  }

  // ------- Filtros (filter-bar + filterable) -------
  function mountFilters() {
    var bars = document.querySelectorAll("[data-filter-bar]");
    bars.forEach(function (bar) {
      var scope = bar.getAttribute("data-filter-scope");
      var container = scope ? document.querySelector(scope) : document;
      var chips = bar.querySelectorAll(".filter-chip");
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (c) { c.classList.remove("is-active"); });
          chip.classList.add("is-active");
          var value = chip.getAttribute("data-filter") || "all";
          var items = container.querySelectorAll(".filterable");
          items.forEach(function (item) {
            var tags = (item.getAttribute("data-tags") || "").split(/\s+/);
            if (value === "all" || tags.indexOf(value) !== -1) {
              item.classList.remove("is-hidden");
            } else {
              item.classList.add("is-hidden");
            }
          });
        });
      });
    });
  }

  // ------- Barra de progreso -------
  function mountProgressBar() {
    if (!document.querySelector("[data-progress]")) return;
    var bar = document.createElement("div");
    bar.className = "read-progress";
    document.body.appendChild(bar);
    function onScroll() {
      var h = document.documentElement;
      var total = h.scrollHeight - h.clientHeight;
      var pct = total > 0 ? (h.scrollTop / total) * 100 : 0;
      bar.style.width = pct + "%";
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ------- Back to top -------
  function mountBackToTop() {
    if (document.querySelector(".back-to-top")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Volver arriba");
    btn.innerHTML = '<span class="material-symbols-outlined">keyboard_arrow_up</span>';
    document.body.appendChild(btn);
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.addEventListener("scroll", function () {
      if (window.scrollY > 480) btn.classList.add("is-visible");
      else btn.classList.remove("is-visible");
    }, { passive: true });
  }

  // ------- FAB dock (WhatsApp + Cotización) -------
  function mountFabDock() {
    if (document.body.hasAttribute("data-no-fab")) return;
    if (document.querySelector(".fab-dock")) return;
    var dock = document.createElement("div");
    dock.className = "fab-dock";
    dock.innerHTML = ''
      + '<a class="fab fab-wa fab-pulse" data-tooltip="Escríbenos por WhatsApp" target="_blank" rel="noopener" href="https://wa.me/573108317438?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20las%20rutas%20del%20Magdalena%20Medio.">'
      +   '<span class="material-symbols-outlined">chat</span>'
      + '</a>'
      + '<a class="fab fab-quote" data-tooltip="Ver cotización" href="cotizacion.html">'
      +   '<span class="material-symbols-outlined">request_quote</span>'
      + '</a>';
    document.body.appendChild(dock);
  }

  // ------- Ripple en botones -------
  function mountRipple() {
    document.addEventListener("click", function (evt) {
      var btn = evt.target.closest(".btn-primary-glow, .fab");
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (evt.clientX - rect.left - size / 2) + "px";
      ripple.style.top  = (evt.clientY - rect.top  - size / 2) + "px";
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  }
})();
