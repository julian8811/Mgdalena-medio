(function () {
  function esc(s) {
    return (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function popupHtml(p) {
    var d = p.detalle;
    if (!d) return '<div class="map-popup text-sm"><strong>' + esc(p.label) + "</strong></div>";
    var html = '<div class="map-popup text-sm text-left"><strong>' + esc(p.label) + "</strong>";
    if (d.municipio) html += '<br><span class="text-gray-500 text-xs">' + esc(d.municipio) + "</span>";
    if (d.descripcion) html += '<p class="mt-2 text-gray-700">' + esc(d.descripcion) + "</p>";
    if (d.experiencia) html += '<p class="mt-1 text-xs text-[#19555B]"><strong>En la ruta:</strong> ' + esc(d.experiencia) + "</p>";
    if (d.costo) html += '<p class="mt-1 text-xs font-semibold text-[#6b4226]">' + esc(d.costo) + "</p>";
    if (d.telefono || d.email) {
      html += '<p class="mt-1 text-xs">';
      if (d.telefono) html += "Tel: " + esc(d.telefono);
      if (d.telefono && d.email) html += " · ";
      if (d.email) html += esc(d.email);
      html += "</p>";
    }
    html += "</div>";
    return html;
  }

  var mapContainer = document.getElementById("mapa-rutas");
  if (!mapContainer || typeof window.RUTAS_JS === "undefined" || typeof L === "undefined") return;

  var map = null;
  var layers = [];

  function addRouteToLayer(points, color) {
    var group = L.layerGroup();
    var latlngs = points.map(function (p) {
      return [p.lat, p.lng];
    });
    var line = L.polyline(latlngs, { color: color || "#19555B", weight: 4, opacity: 0.85 });
    group.addLayer(line);
    points.forEach(function (p) {
      var marker = L.marker([p.lat, p.lng]);
      marker.bindPopup(popupHtml(p), { maxWidth: 340, minWidth: 260 });
      group.addLayer(marker);
    });
    return group;
  }

  function initMap() {
    if (map) return;
    map = L.map("mapa-rutas").setView([6.52, -74.59], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    var colors = ["#19555B", "#2980b9", "#8E44AD", "#E67E22", "#27ae60"];
    window.RUTAS_JS.forEach(function (r, i) {
      var layer = addRouteToLayer(r.puntos, colors[i % colors.length]);
      layers.push({ id: r.id, layer: layer });
    });
    var q = new URLSearchParams(window.location.search).get("ruta");
    var initial = q ? parseInt(q, 10) : 1;
    if (!initial || initial < 1 || initial > 5) initial = 1;
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
        map.fitBounds(b, { padding: [40, 40] });
      }
    }
  }

  function syncButtons(num) {
    document.querySelectorAll("[data-ruta]").forEach(function (b) {
      var id = parseInt(b.getAttribute("data-ruta"), 10);
      var on = id === num;
      b.classList.toggle("bg-primary", on);
      b.classList.toggle("text-on-primary", on);
      b.classList.toggle("ring-2", on);
      b.classList.toggle("ring-primary", on);
      b.classList.toggle("ring-offset-2", on);
      b.classList.toggle("ring-offset-surface", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
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
