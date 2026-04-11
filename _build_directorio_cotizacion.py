import pathlib
import re

base = pathlib.Path(__file__).parent
html = pathlib.Path(
    r"d:\Colmayor\CEITTO\Magdalena medio 2026\Entregable Magdalena Medio\Rutas ganaderas\Informe_Ruta_Turistica_Puerto_Berrio_Maceo.html"
).read_text(encoding="utf-8")

# Cotización inner (tab panels content only — tables)
m = re.search(
    r'<section id="cotizacion"[^>]*>([\s\S]*?)</section>\s*</div>\s*</div>\s*<footer>',
    html,
)
if not m:
    raise SystemExit("cotizacion not found")
cot_inner = m.group(1).strip()
# Replace inline styles with classes for tables
cot_inner = cot_inner.replace(
    '<h4 style="color:var(--marron);margin:16px 0 8px;">',
    '<h4 class="text-lg font-bold text-[#6b4226] mt-6 mb-2 font-headline">',
)
cot_inner = cot_inner.replace('class="tabla-cotizacion"', 'class="tabla-cotizacion w-full text-sm border-collapse my-4 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]"')

snippet = (base / "assets" / "snippets" / "directorio-cards.html").read_text(encoding="utf-8")

nav = """
<header class="site-header fixed top-0 w-full z-50 bg-[#fbf6ee]/85 backdrop-blur-md flex flex-wrap justify-between items-center gap-2 px-4 md:px-6 min-h-16 py-2">
  <div class="flex items-center gap-3">
    <button type="button" id="nav-toggle" class="md:hidden material-symbols-outlined text-[#19555B] p-2 rounded-full hover:bg-black/5" aria-label="Menú">menu</button>
    <a href="index.html" class="brand-mark">
      <span class="brand-title">Magdalena Medio</span>
      <span class="brand-tagline">Turismo ganadero</span>
    </a>
  </div>
  <nav id="nav-panel" class="hidden md:flex w-full md:w-auto flex-col md:flex-row gap-1 md:gap-6 text-sm font-bold text-primary pb-2 md:pb-0">
    <a class="nav-link py-2" href="index.html">Inicio</a>
    <a class="nav-link py-2" href="explorar-rutas.html">Explorar rutas</a>
    <a class="nav-link py-2" href="mapa.html">Mapa</a>
    <a class="nav-link py-2" href="directorio.html">Directorio</a>
    <a class="nav-link py-2" href="cotizacion.html">Cotización</a>
  </nav>
</header>
"""

footer = """
<footer class="site-footer text-white text-center py-10 mt-16 px-4">
  <p class="opacity-90 text-sm">Rutas turísticas Puerto Berrío y Maceo — Magdalena Medio · Paisaje cultural ganadero</p>
  <p class="opacity-60 text-xs mt-2">Precios referenciales; confirmar con cada proveedor.</p>
</footer>
"""

tw_head = """<!DOCTYPE html>
<html class="light" lang="es"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>%s</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;1,800&family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="assets/css/theme.css"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
tailwind.config = { darkMode: "class", theme: { extend: {
  colors: {
    primary: "#2b636a", "primary-dim": "#1c575d", "on-primary": "#d2faff",
    secondary: "#4e5c73", "on-secondary": "#eef2ff", "secondary-container": "#cfddf8",
    "on-secondary-container": "#414f65", tertiary: "#576100", "tertiary-container": "#e7f95e",
    "on-tertiary-container": "#555d00", surface: "#fbf6ee", "on-surface": "#302f2a",
    "on-surface-variant": "#5e5b55", "surface-container-low": "#f5f0e8", "surface-container-high": "#e7e2d8",
    "surface-container-lowest": "#ffffff", "primary-container": "#aee7ed", "on-primary-container": "#1a565c",
    outline: "#797770"
  },
  fontFamily: { headline: ["Plus Jakarta Sans","sans-serif"], body: ["Manrope","sans-serif"] }
}}}
</script>
<style>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
body { font-family: Manrope, sans-serif; }
h1,h2,h3 { font-family: "Plus Jakarta Sans", sans-serif; }
.tabla-cotizacion th, .tabla-cotizacion td { border: 1px solid #c5d9c8; padding: 10px 12px; text-align: left; }
.tabla-cotizacion th { background: linear-gradient(135deg, #172539, #19555B); color: #fff; font-weight: 600; }
.tabla-cotizacion tr:nth-child(even) { background: #f5faf5; }
</style>
<link rel="stylesheet" href="assets/css/informe-cards.css"/>
<script defer src="assets/js/site.js"></script>
</head>
<body class="text-on-surface min-h-screen">
"""

directorio_body = f"""
{nav}
<main class="pt-24 pb-16 px-4 md:px-6 max-w-5xl mx-auto">
  <p class="text-[10px] font-bold tracking-widest uppercase text-tertiary mb-3">Directorio</p>
  <h1 class="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4">Puntos de la ruta</h1>
  <p class="text-on-surface-variant max-w-2xl mb-6">Descriptores, servicios y precios tentativos por establecimiento (informe Puerto Berrío – Maceo).</p>
  <div class="mb-8">
    <label class="sr-only" for="dir-search">Buscar</label>
    <input id="dir-search" type="search" placeholder="Buscar por nombre, servicio o dirección…" class="w-full max-w-xl rounded-full border-0 border-b-2 border-primary bg-surface-container-low px-5 py-3 text-on-surface focus:ring-0 focus:border-primary-dim"/>
  </div>
  <div class="directorio-cards space-y-2">
{snippet}
  </div>
</main>
{footer}
<script>
document.addEventListener('DOMContentLoaded', function () {{
  var search = document.getElementById('dir-search');
  if (!search) return;
  search.addEventListener('input', function () {{
    var q = search.value.toLowerCase().trim();
    document.querySelectorAll('.empresa-card').forEach(function (card) {{
      card.style.display = !q || card.textContent.toLowerCase().includes(q) ? '' : 'none';
    }});
  }});
}});
</script>
</body></html>
"""

cot_body = f"""
{nav}
<main class="pt-24 pb-16 px-4 md:px-6 max-w-6xl mx-auto">
  <p class="text-[10px] font-bold tracking-widest uppercase text-tertiary mb-3">Cotización</p>
  <h1 class="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4">Discriminada por rubros</h1>
  <p class="text-on-surface-variant max-w-3xl mb-10">Información tomada del documento de cotización del informe. Valores en COP; confirmar con cada proveedor.</p>
  <div class="cotizacion-content space-y-8">
{cot_inner}
  </div>
</main>
{footer}
</body></html>
"""

(base / "directorio.html").write_text(
    tw_head % "Directorio — Rutas ganaderas Magdalena Medio" + directorio_body,
    encoding="utf-8",
)
(base / "cotizacion.html").write_text(
    tw_head % "Cotización — Rutas Puerto Berrío y Maceo" + cot_body,
    encoding="utf-8",
)
print("wrote directorio.html, cotizacion.html")
