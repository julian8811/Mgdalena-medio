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
      + '<button type="button" class="fab fab-compare" data-open-mm-compare data-tooltip="Comparativo rutas 1, 2 y 5 (Magdalena Medio) vs cotización Yopal (PDF)" aria-haspopup="dialog" aria-controls="mm-compare-dialog" aria-expanded="false" aria-label="Abrir comparativo de rutas: cocreación 1 y 2, Ruta 5 completa y Exclusive Nature Tours (1 persona)">'
      +   '<span class="material-symbols-outlined" aria-hidden="true">compare_arrows</span>'
      +   '<span class="fab-compare-label">Comparativo<br>rutas</span>'
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
      +     '<p class="mm-compare-sub">Comparativo rutas 1 y 2 (cocreación), ruta 5 completa vs Ruta Yopal / Casanare Exclusive Nature Tours.</p>'
      +     '<button type="button" class="mm-compare-close" aria-label="Cerrar comparativo"><span class="material-symbols-outlined">close</span></button>'
      +   '</div>'
      +   '<div class="mm-compare-body">'
      +     '<p class="mm-compare-note">Son productos y destinos distintos. Resumen por día para comparar en paralelo; totales referenciales por persona según cotización del sitio y venta PDF prorrateada.</p>'
      +     '<div class="mm-compare-scroll">'
      +       '<h3 class="mm-compare-section-title">Itinerario por día · cuatro rutas</h3>'
      +       '<p class="mm-compare-itin-lead">Itinerario cotización.</p>'
      +       '<table class="mm-compare-table mm-compare-table--quad">'
      +         '<thead><tr>'
      +           '<th>Etapa</th>'
      +           '<th>Ruta 1 · Vive la ganadería, no la mires desde lejos<br><span class="mm-compare-th-sub">(1 pax, COP)</span></th>'
      +           '<th>Ruta 2 · Descubre el corazón ganadero del Magdalena Medio<br><span class="mm-compare-th-sub">(1 pax, COP)</span></th>'
      +           '<th>Ruta 5 · Ruta completa (6 días / 5 noches)<br><span class="mm-compare-th-sub">(1 pax, COP)</span></th>'
      +           '<th>Exclusive Nature Tours<br><span class="mm-compare-th-sub">(1 pax, COP)</span></th>'
      +         '</tr></thead>'
      +         '<tbody>'
      +           '<tr><th scope="row" class="mm-compare-etapa">Llegada / inicio</th>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Encuentro La Alpina o El Portal; traslados minivan/4×4 hacia fincas (referencia sitio).</li></ul></td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Parque Principal o Casa del Río; recibimiento y contexto con guía historiador.</li></ul></td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Bus Medellín–Puerto Berrío; traslado a hotel y primer acercamiento a ciudad o balneario (referencia Paquete 5).</li></ul></td>'
      +             '<td class="mm-compare-cell-itin mm-compare-cell-itin--ent"><ul class="mm-compare-itin-list"><li>14:30 · Llegada aeropuerto Yopal.</li><li>15:00 · Traslado al hotel.</li><li>20:00 · Cena.</li><li>22:00 · Pernoctación hotel Yopal.</li></ul></td></tr>'
      +           '<tr><th scope="row" class="mm-compare-etapa">Día 1</th>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Finca Las Camelias: ordeño, desayuno, cabalgata.</li><li>Almuerzo sancocho trifásico.</li><li>Tarde: Puerto Berrío y compras.</li></ul></td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Patrimonio urbano (puente, ferrocarril, iglesia).</li><li>Almuerzo en el puerto; lancha puente a puente.</li><li>Sala Lechera La Ganadera; show del queso en Colbúfala; cena bufalina.</li></ul></td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Balneario La Alpina o Candilejas; alojamiento zona vía Medellín (referencia informe).</li></ul></td>'
      +             '<td class="mm-compare-cell-itin mm-compare-cell-itin--ent"><ul class="mm-compare-itin-list"><li>07:00 · Desayuno.</li><li>07:45 · Cámara de Comercio Casanare.</li><li>08:00–10:00 · Jornadas académicas (turismo naturaleza, empresa transporte).</li><li>11:00 · Traslado a hato.</li><li>13:00 · Almuerzo en hato.</li><li>15:00–18:00 · Safari llanero.</li><li>18:00–22:00 · Regreso, cena y pernoctación en hato ganadero.</li></ul></td></tr>'
      +           '<tr><th scope="row" class="mm-compare-etapa">Día 2</th>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Desayuno La Alpina o El Portal.</li><li>San Juan de Bedout: caracterización, bioseguridad, establos, salida de campo, refrigerio.</li><li>Cena Colbúfala / Casa Vieja / El Portal / La Martina; hotel Puerto Berrío.</li></ul></td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Amanecer en puerto; lancha a Ciénaga de Barbacoas.</li><li>Ranchería: desayuno y navegación; almuerzo con música en vivo.</li><li>Finca Las Camelias: cena asado e integración con fogata.</li></ul></td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Ciénaga de Barbacoas con lancha y guianza; retorno a hotel Puerto Berrío (referencia informe).</li></ul></td>'
      +             '<td class="mm-compare-cell-itin mm-compare-cell-itin--ent"><ul class="mm-compare-itin-list"><li>07:00 · Desayuno en hato.</li><li>08:00–10:00 · Jornada académica (alojamiento, souvenirs, guianza).</li><li>10:30 · Salida hato → Yopal.</li><li>13:30 · Almuerzo; 15:00 souvenirs.</li><li>20:00 · Cena hotel; 22:00 pernoctación hotel Yopal.</li></ul></td></tr>'
      +           '<tr><th scope="row" class="mm-compare-etapa">Día 3</th>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Hacienda La Tagua: ordeño, cabalgata manejo de campo, refrigerio, fiambre de vaquero.</li><li>Tour por Puerto Berrío; cierre (cena bufalina opcional en Colbúfala según Paquete 6).</li></ul></td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Desayuno en Las Camelias; tiempo libre y compras.</li><li>Regreso al puerto; salida a Medellín (terrestre o aérea).</li></ul></td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Parque Principal, Brigada, estación, Puente Monumental; operadores Conecta Nativa / Palma Beach (referencia informe).</li></ul></td>'
      +             '<td class="mm-compare-cell-itin mm-compare-cell-itin--ent"><ul class="mm-compare-itin-list"><li>07:00 · Desayuno.</li><li>08:00–11:00 · Retroalimentación.</li><li>12:00 m. · Almuerzo hotel.</li><li>13:00 · Traslado al aeropuerto.</li><li>14:30 · Salida vuelo / regreso a ciudad de origen.</li></ul></td></tr>'
      +           '<tr><th scope="row" class="mm-compare-etapa">Día 4</th>'
      +             '<td class="mm-compare-cell-itin">—</td><td class="mm-compare-cell-itin">—</td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Traslado a Ecorrefugio Alicante / cañón Río Alicante; noche con cena y tertulia (referencia Paquete 5).</li></ul></td>'
      +             '<td class="mm-compare-cell-itin">—</td></tr>'
      +           '<tr><th scope="row" class="mm-compare-etapa">Día 5</th>'
      +             '<td class="mm-compare-cell-itin">—</td><td class="mm-compare-cell-itin">—</td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Maceo: hoteles ganaderos; San Juan de Bedout; experiencia ganadera integral (referencia informe).</li></ul></td>'
      +             '<td class="mm-compare-cell-itin">—</td></tr>'
      +           '<tr><th scope="row" class="mm-compare-etapa">Día 6</th>'
      +             '<td class="mm-compare-cell-itin">—</td><td class="mm-compare-cell-itin">—</td>'
      +             '<td class="mm-compare-cell-itin"><ul class="mm-compare-itin-list"><li>Cierre (p. ej. Piway); regreso bus Puerto Berrío–Medellín (referencia informe).</li></ul></td>'
      +             '<td class="mm-compare-cell-itin">—</td></tr>'
      +           '<tr class="mm-compare-total">'
      +             '<th scope="row">Total referencial (1 pax, COP)</th>'
      +             '<td><strong>$841.000 – $1.507.000</strong></td>'
      +             '<td><strong>$826.000 – $1.517.000</strong></td>'
      +             '<td><strong>$1.306.000 – $2.082.000</strong></td>'
      +             '<td><strong>$4.098.899</strong> <span class="mm-compare-tag">IVA incl.</span></td>'
      +           '</tr>'
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
