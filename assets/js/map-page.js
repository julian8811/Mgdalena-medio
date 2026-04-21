(function () {
  function esc(s) {
    return (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var ROUTE_COLORS = ["#19555B", "#1e6b8c", "#7c3aed", "#c2410c", "#15803d", "#a855f7", "#0d9488"];

  function popupHtml(p) {
    var d = p.detalle;
    var head = esc(p.label);
    if (!d) {
      return (
        '<div class="mm-popup">' +
        '<div class="mm-popup-head">' + head + "</div>" +
        '<div class="mm-popup-body"><p class="mm-muted">Punto de interés en la ruta.</p></div></div>'
      );
    }
    var html =
      '<div class="mm-popup">' +
      '<div class="mm-popup-head">' + head + "</div>" +
      '<div class="mm-popup-body">';
    if (d.municipio) html += '<p class="mm-muted">' + esc(d.municipio) + "</p>";
    if (d.descripcion) html += '<p class="mm-desc">' + esc(d.descripcion) + "</p>";
    if (d.experiencia) {
      html += '<p class="mm-desc"><span class="mm-tag">En la ruta</span> ' + esc(d.experiencia) + "</p>";
    }
    if (d.costo) html += '<p class="mm-price">' + esc(d.costo) + "</p>";
    if (d.telefono || d.email) {
      html += '<p class="mm-contact">';
      if (d.telefono) html += "Tel: " + esc(d.telefono);
      if (d.telefono && d.email) html += " · ";
      if (d.email) html += esc(d.email);
      html += "</p>";
    }
    html += "</div></div>";
    return html;
  }

  function routeColor(index) {
    return ROUTE_COLORS[index % ROUTE_COLORS.length];
  }

  function makeMarkerIcon(color) {
    return L.divIcon({
      className: "mm-marker-wrap",
      html:
        '<div class="mm-marker" style="background:' +
        color +
        ';--mm-pin:' +
        color +
        '"><span class="mm-marker-inner"></span></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16],
    });
  }

  var mapContainer = document.getElementById("mapa-rutas");
  if (!mapContainer || typeof window.RUTAS_JS === "undefined" || typeof L === "undefined") return;

  var map = null;
  var layers = [];

  function addRouteToLayer(points, color) {
    var c = color || "#19555B";
    var group = L.layerGroup();
    var latlngs = points.map(function (p) {
      return [p.lat, p.lng];
    });
    var glow = L.polyline(latlngs, {
      color: c,
      weight: 14,
      opacity: 0.22,
      lineCap: "round",
      lineJoin: "round",
    });
    var line = L.polyline(latlngs, {
      color: c,
      weight: 5,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
    });
    group.addLayer(glow);
    group.addLayer(line);
    var icon = makeMarkerIcon(c);
    points.forEach(function (p) {
      var marker = L.marker([p.lat, p.lng], { icon: icon });
      marker.bindPopup(popupHtml(p), {
        maxWidth: 340,
        minWidth: 260,
        className: "mm-leaflet-popup",
      });
      group.addLayer(marker);
    });
    return group;
  }

  function initMap() {
    if (map) return;
    map = L.map("mapa-rutas", { scrollWheelZoom: true, zoomControl: true }).setView([6.52, -74.59], 10);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);
    L.control.scale({ metric: true, imperial: false, position: "bottomleft" }).addTo(map);
    map.zoomControl.setPosition("topright");

    window.RUTAS_JS.forEach(function (r, i) {
      var layer = addRouteToLayer(r.puntos, routeColor(i));
      layers.push({ id: r.id, layer: layer });
    });
    var q = new URLSearchParams(window.location.search).get("ruta");
    var initial = q ? parseInt(q, 10) : 1;
    if (!initial || initial < 1 || initial > 7) initial = 1;
    showRouteOnMap(initial);
    syncButtons(initial);
  }

  function showRouteOnMap(num) {
    if (!map || !layers.length) return;
    layers.forEach(function (obj) {
      map.removeLayer(obj.layer);
    });
    var sel = layers.find(function (o) {
      return o.id === num;
    });
    if (sel) {
      map.addLayer(sel.layer);
      var pts = window.RUTAS_JS.find(function (r) {
        return r.id === num;
      });
      if (pts && pts.puntos.length) {
        var b = L.latLngBounds(
          pts.puntos.map(function (p) {
            return [p.lat, p.lng];
          })
        );
        map.fitBounds(b, { padding: [48, 48], maxZoom: 13 });
      }
    }
  }

  function syncButtons(num) {
    document.querySelectorAll("[data-ruta]").forEach(function (b) {
      var id = parseInt(b.getAttribute("data-ruta"), 10);
      var on = id === num;
      var accent = routeColor(id - 1);
      var dot = b.querySelector(".route-dot");
      if (dot) dot.style.backgroundColor = accent;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      if (on) {
        b.style.backgroundImage = "linear-gradient(135deg, " + accent + ", #172539)";
        b.style.borderColor = "transparent";
        b.style.setProperty("color", "#fff");
      } else {
        b.style.removeProperty("background-image");
        b.style.removeProperty("border-color");
        b.style.removeProperty("color");
      }
    });
  }

  document.querySelectorAll("[data-ruta]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var rutaId = parseInt(btn.getAttribute("data-ruta"), 10);
      initMap();
      showRouteOnMap(rutaId);
      syncButtons(rutaId);
    });
  });

  initMap();
})();
