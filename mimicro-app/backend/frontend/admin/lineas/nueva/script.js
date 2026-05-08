/* admin/lineas/nueva/script.js */
Auth.initPage('admin');

/* ── Estado del mapa ────────────────────────────────────────── */
let map;
let waypoints  = [];   // [{lat, lng}, ...]
let markers    = [];   // Leaflet markers
let polyline   = null; // Leaflet polyline

/* ── Inicializar mapa ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  map = L.map('map-nueva').setView([-17.7833, -63.1822], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  map.on('click', onMapClick);
});

/* ── Click en el mapa: agregar waypoint ─────────────────────── */
function onMapClick(e) {
  const { lat, lng } = e.latlng;
  waypoints.push({ lat, lng });

  const idx = waypoints.length;
  const isFirst = idx === 1;
  const isLast  = false; // se actualiza al deshacer

  const marker = L.marker([lat, lng], { icon: makeIcon(idx) })
    .addTo(map)
    .bindPopup(`Punto ${idx}<br><small>${lat.toFixed(5)}, ${lng.toFixed(5)}</small>`);
  markers.push(marker);

  actualizarPolilinea();
  actualizarContador();
}

/* ── Deshacer último punto ──────────────────────────────────── */
function deshacerUltimoPunto() {
  if (!waypoints.length) return;
  waypoints.pop();
  const m = markers.pop();
  if (m) map.removeLayer(m);
  actualizarPolilinea();
  actualizarContador();
}

/* ── Limpiar toda la ruta ───────────────────────────────────── */
function limpiarRuta() {
  waypoints = [];
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (polyline) { map.removeLayer(polyline); polyline = null; }
  actualizarContador();
}

/* ── Dibujar / redibujar la polilínea ───────────────────────── */
function actualizarPolilinea() {
  if (polyline) map.removeLayer(polyline);
  if (waypoints.length < 2) { polyline = null; return; }
  polyline = L.polyline(waypoints.map(p => [p.lat, p.lng]), {
    color: '#2563EB',
    weight: 4,
    opacity: 0.85,
  }).addTo(map);
}

/* ── Actualizar contador ────────────────────────────────────── */
function actualizarContador() {
  const n = waypoints.length;
  document.getElementById('puntos-count').textContent =
    `${n} punto${n !== 1 ? 's' : ''}`;
}

/* ── Icono numerado para cada waypoint ──────────────────────── */
function makeIcon(n) {
  return L.divIcon({
    className: '',
    html: `<div class="wp-icon">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

/* ── Guardar línea ──────────────────────────────────────────── */
async function guardarLinea(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-guardar');

  const nombre = document.getElementById('l-nombre').value.trim();
  const desc   = document.getElementById('l-desc').value.trim();

  if (!nombre) { Toast.error('El nombre de la línea es requerido'); return; }
  if (waypoints.length < 2) {
    Toast.error('Trazá al menos 2 puntos en el mapa para definir la ruta');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Guardando…';

  try {
    const res = await Api.post('/lineas', {
      nombre,
      descripcion: desc,
      ruta_path: waypoints,
    });
    Toast.success(`Línea "${nombre}" creada correctamente`);
    setTimeout(() => { window.location.href = `/admin/lineas/detalle/?id=${res.id}`; }, 800);
  } catch (err) {
    Toast.error(err.detail || 'Error al guardar la línea');
    btn.disabled = false;
    btn.textContent = 'Guardar Línea';
  }
}
