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
    mountHeroCarousel();
    mountNavHighlight();
    mountHeaderScroll();
    mountParallaxDecor();
    mountCompareModal();
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
    if (document.body.hasAttribute("data-no-progress")) return;
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

  // ------- FAB flotante (solo comparativo) -------
  function mountFabDock() {
    if (document.body.hasAttribute("data-no-fab")) return;
    if (document.querySelector(".fab-dock")) return;
    var dock = document.createElement("div");
    dock.className = "fab-dock fab-dock--compare-only";
    dock.innerHTML = ''
      + '<button type="button" class="fab fab-compare" data-open-mm-compare data-tooltip="Comparar Ruta 5 (Magdalena Medio) vs cotización Yopal (PDF)" aria-haspopup="dialog" aria-controls="mm-compare-dialog" aria-expanded="false" aria-label="Abrir comparativo: Ruta 5 completa frente a cotización Exclusive Nature Tours (1 persona)">'
      +   '<span class="material-symbols-outlined" aria-hidden="true">compare_arrows</span>'
      +   '<span class="fab-compare-label">Comparar</span>'
      + '</button>';
    document.body.appendChild(dock);
  }

  // ------- Resaltar pestaña de navegación actual -------
  function mountNavHighlight() {
    var file = currentPageFile();
    document.querySelectorAll("a.nav-link[href]").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("?")[0].split("#")[0].trim();
      var hfile = href.split("/").pop();
      if (hfile && hfile.toLowerCase() === file.toLowerCase()) {
        a.classList.add("nav-link--current");
        a.setAttribute("aria-current", "page");
      }
    });
  }

  function currentPageFile() {
    var path = (window.location.pathname || "/").split("?")[0];
    var parts = path.replace(/\/+$/, "").split("/").filter(Boolean);
    var seg = parts.length ? parts[parts.length - 1] : "";
    if (!seg || seg === "index.html") return "index.html";
    if (seg === "index") return "index.html";
    if (/\.html$/i.test(seg)) return seg;
    return seg + ".html";
  }

  // ------- Cabecera al hacer scroll -------
  function mountHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function tick() {
      if (window.scrollY > 10) header.classList.add("site-header--scrolled");
      else header.classList.remove("site-header--scrolled");
    }
    document.addEventListener("scroll", tick, { passive: true });
    tick();
  }

  // ------- Parallax muy suave en decorativos -------
  function mountParallaxDecor() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var els = document.querySelectorAll(".mm-parallax-bg");
    if (!els.length) return;
    var ticking = false;
    function update() {
      var y = window.scrollY || 0;
      els.forEach(function (el) {
        var k = parseFloat(el.getAttribute("data-parallax") || "0.06");
        el.style.transform = "translate3d(0, " + Math.round(y * k) + "px, 0)";
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  // ------- Modal comparativo Ruta 5 vs cotización Colegio Mayor (PDF) -------
  function mountCompareModal() {
    if (document.getElementById("mm-compare-backdrop")) return;
    var backdrop = document.createElement("div");
    backdrop.id = "mm-compare-backdrop";
    backdrop.className = "mm-compare-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.innerHTML = ''
      + '<div class="mm-compare-dialog" id="mm-compare-dialog" role="dialog" aria-modal="true" aria-labelledby="mm-compare-title" tabindex="-1">'
      +   '<div class="mm-compare-dialog-head">'
      +     '<h2 id="mm-compare-title" class="mm-compare-title">Comparativo por persona</h2>'
      +     '<p class="mm-compare-sub">Ruta 5 — Ruta completa (Puerto Berrío y Maceo, informe referencial) frente a la cotización <strong>Misión de aprendizaje — Colegio Mayor de Antioquia</strong> (Yopal / Casanare, PDF «Cotización Colegio Mayor de Antioquia 2 Final», marzo 2026).</p>'
      +     '<button type="button" class="mm-compare-close" aria-label="Cerrar comparativo"><span class="material-symbols-outlined">close</span></button>'
      +   '</div>'
      +   '<div class="mm-compare-body">'
      +     '<p class="mm-compare-note">Son productos y destinos distintos; la tabla contrasta montos <em>por una persona</em> donde el informe da rangos referenciales y el PDF aporta totales de grupo prorrateados.</p>'
      +     '<div class="mm-compare-scroll">'
      +       '<table class="mm-compare-table">'
      +         '<thead><tr><th>Rubro</th><th>Ruta 5 completa (1 pax, COP)</th><th>Exclusive Nature Tours (1 pax, COP)</th></tr></thead>'
      +         '<tbody>'
      +           '<tr><td>Transporte ida y vuelta (bus según informe)</td><td>$76.000 – $102.000</td><td rowspan="5" class="mm-compare-merge">'
      +             '<div class="mm-compare-itin">'
      +               '<p class="mm-compare-itin-lead">Itinerario cotización N° 030 · Yopal–Casanare (fechas calendario a confirmar con el operador)</p>'
      +               '<p class="mm-compare-itin-meta">En el PDF, la llegada en tarde aparece antes del bloque «Día 1»; aquí se numera como <strong>día 0</strong> para que «Día 1–3» coincida con el documento.</p>'
      +               '<p class="mm-compare-itin-day">Día 0 · Llegada a Yopal</p>'
      +               '<ul class="mm-compare-itin-list">'
      +                 '<li>14:30 · Llegada aeropuerto Yopal.</li>'
      +                 '<li>15:00 · Recogida en aeropuerto y traslado al hotel.</li>'
      +                 '<li>20:00 · Cena.</li>'
      +                 '<li>22:00 · Pernoctación hotel Yopal.</li>'
      +               '</ul>'
      +               '<p class="mm-compare-itin-day">Día 1 · Martes (según plantilla PDF)</p>'
      +               '<ul class="mm-compare-itin-list">'
      +                 '<li>07:00 · Desayuno.</li>'
      +                 '<li>07:45 · Traslado a Cámara de Comercio del Casanare.</li>'
      +                 '<li>08:00 · Jornada académica · cluster turismo naturaleza.</li>'
      +                 '<li>10:00 · Jornada académica · empresa de transporte.</li>'
      +                 '<li>11:00 · Traslado hacia hato ganadero.</li>'
      +                 '<li>13:00 · Almuerzo en hato ganadero.</li>'
      +                 '<li>15:00–18:00 · Salida safari llanero.</li>'
      +                 '<li>18:00 · Traslado de regreso (PDF: retorno; cena y pernoctación en hato ganadero).</li>'
      +                 '<li>20:00–22:00 · Cena.</li>'
      +                 '<li>22:00 · Pernoctación hato ganadero.</li>'
      +               '</ul>'
      +               '<p class="mm-compare-itin-day">Día 2 · Miércoles</p>'
      +               '<ul class="mm-compare-itin-list">'
      +                 '<li>07:00 · Desayuno.</li>'
      +                 '<li>08:00–10:00 · Jornada académica (alojamiento, souvenirs, guianza).</li>'
      +                 '<li>10:30 · Salida hato ganadero → Yopal.</li>'
      +                 '<li>13:00 · Llegada a Yopal.</li>'
      +                 '<li>13:30 · Almuerzo.</li>'
      +                 '<li>15:00 · Visita tienda de souvenirs.</li>'
      +                 '<li>20:00 · Cena en hotel.</li>'
      +                 '<li>22:00 · Pernoctación hotel Yopal.</li>'
      +               '</ul>'
      +               '<p class="mm-compare-itin-day">Día 3 · Jueves</p>'
      +               '<ul class="mm-compare-itin-list">'
      +                 '<li>07:00 · Desayuno.</li>'
      +                 '<li>08:00–11:00 · Jornada de retroalimentación.</li>'
      +                 '<li>12:00 m. · Almuerzo en hotel.</li>'
      +                 '<li>13:00 · Traslado hotel → aeropuerto.</li>'
      +                 '<li>14:30 · Salida vuelo / regreso a ciudad de origen.</li>'
      +               '</ul>'
      +               '<p class="mm-compare-itin-meta">El PDF incluye una línea «Día 4» sin cronograma (plantilla); no se replica aquí.</p>'
      +               '<p class="mm-compare-itin-note">Servicios terrestres, alojamiento, alimentación, actividades académicas, safari llanero, guianza y asistencia al viajero van integrados en el paquete. <strong>El PDF no discrimina por rubro en pesos por persona.</strong></p>'
      +             '</div>'
      +           '</td></tr>'
      +           '<tr><td>Traslados internos (todos los tramos)</td><td>$280.000 – $450.000</td></tr>'
      +           '<tr><td>Alojamiento (4 noches hotel + 1 Ecorrefugio)</td><td>$480.000 – $750.000</td></tr>'
      +           '<tr><td>Comidas (5 D, 5 A, 5 C)</td><td>$220.000 – $380.000</td></tr>'
      +           '<tr><td>Actividades (balneario, histórico, Ciénaga, Ecorrefugio, ganadería, Bedout)</td><td>$250.000 – $400.000</td></tr>'
      +           '<tr class="mm-compare-total"><td><strong>Total referencial por persona</strong></td><td><strong>$1.306.000 – $2.082.000</strong></td><td><strong>$4.098.899</strong> <span class="mm-compare-tag">venta x persona, IVA incl.</span></td></tr>'
      +         '</tbody>'
      +       '</table>'
      +     '</div>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(backdrop);

    var dialog = backdrop.querySelector(".mm-compare-dialog");
    var closeBtn = backdrop.querySelector(".mm-compare-close");
    function getOpenTrigger() {
      return document.querySelector("[data-open-mm-compare]");
    }

    function tabbable() {
      if (!dialog) return [];
      var sel = dialog.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])");
      return Array.prototype.slice.call(sel).filter(function (el) {
        return !el.hasAttribute("disabled") && el.offsetParent !== null;
      });
    }

    function openModal() {
      backdrop.classList.add("is-open");
      backdrop.setAttribute("aria-hidden", "false");
      var b = getOpenTrigger();
      if (b) b.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
      document.addEventListener("keydown", onKeyDoc, true);
    }

    function closeModal() {
      backdrop.classList.remove("is-open");
      backdrop.setAttribute("aria-hidden", "true");
      var b = getOpenTrigger();
      if (b) {
        b.setAttribute("aria-expanded", "false");
        b.focus();
      }
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDoc, true);
    }

    function onKeyDoc(e) {
      if (!backdrop.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      var list = tabbable();
      if (list.length === 0) return;
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("[data-open-mm-compare]")) {
        e.preventDefault();
        openModal();
        return;
      }
      if (e.target.closest && e.target.closest(".mm-compare-close")) {
        e.preventDefault();
        closeModal();
        return;
      }
      if (backdrop.classList.contains("is-open") && e.target === backdrop) {
        closeModal();
      }
    });
  }

  // ------- Carrusel hero (index) -------
  function mountHeroCarousel() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) return;
    var slides = root.querySelectorAll(".hero-carousel-slide");
    var dots = root.querySelectorAll(".hero-carousel-dot");
    var prev = root.querySelector(".hero-carousel-prev");
    var next = root.querySelector(".hero-carousel-next");
    var n = slides.length;
    if (!n) return;
    var i = 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ms = parseInt(root.getAttribute("data-autoplay-ms") || "6000", 10);
    var timer = null;

    function go(idx) {
      i = (idx + n) % n;
      slides.forEach(function (s, j) {
        s.classList.toggle("is-active", j === i);
      });
      dots.forEach(function (d, j) {
        var on = j === i;
        d.classList.toggle("is-active", on);
        if (on) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
    }

    function nextSlide() {
      go(i + 1);
    }
    function prevSlide() {
      go(i - 1);
    }

    function arm() {
      clearInterval(timer);
      if (reduced || ms < 1500) return;
      timer = setInterval(nextSlide, ms);
    }
    function disarm() {
      clearInterval(timer);
      timer = null;
    }

    if (prev) {
      prev.addEventListener("click", function () {
        disarm();
        prevSlide();
        arm();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        disarm();
        nextSlide();
        arm();
      });
    }
    dots.forEach(function (dot, j) {
      dot.addEventListener("click", function () {
        disarm();
        go(j);
        arm();
      });
    });
    root.addEventListener("mouseenter", disarm);
    root.addEventListener("mouseleave", arm);
    root.addEventListener("focusin", disarm);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) arm();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) disarm();
      else arm();
    });
    arm();
  }

  // ------- Ripple en botones y chips -------
  function mountRipple() {
    document.addEventListener("click", function (evt) {
      var btn = evt.target.closest(".btn-primary-glow, .fab, .filter-chip, .map-route-btn, .day-tab");
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement("span");
      ripple.className = "ripple";
      if (btn.classList.contains("filter-chip")) {
        ripple.style.backgroundColor = "rgba(43, 99, 106, 0.18)";
      } else if (btn.classList.contains("map-route-btn")) {
        ripple.style.backgroundColor = "rgba(255, 255, 255, 0.35)";
      } else if (btn.classList.contains("day-tab")) {
        ripple.style.backgroundColor = "rgba(43, 99, 106, 0.12)";
      }
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (evt.clientX - rect.left - size / 2) + "px";
      ripple.style.top  = (evt.clientY - rect.top  - size / 2) + "px";
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  }
})();
