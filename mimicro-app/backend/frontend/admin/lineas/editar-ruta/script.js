/* admin/lineas/editar-ruta/script.js */
Auth.initPage('admin');

const params  = new URLSearchParams(window.location.search);
const lineaId = parseInt(params.get('id'));
if (!lineaId) window.location.href = '/admin/lineas/';

/* ── Estado: modo manual ────────────────────────────────────── */
let map;
let refLayer     = null;
let waypoints    = [];
let markers      = [];
let osrmSegments = [];
let polyline     = null;
let fetching     = false;

/* ── Estado: modo grabación GPS ─────────────────────────────── */
let gpsPoints = [];
let watchId   = null;
let grabando  = false;

/* ── Init: cargar línea y mostrar ruta de referencia ────────── */
document.addEventListener('DOMContentLoaded', async () => {
  map = L.map('map-editar').setView([-17.7833, -63.1822], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19,
  }).addTo(map);
  map.on('click', onMapClick);

  try {
    const linea = await Api.get(`/lineas/${lineaId}`);
    document.getElementById('page-titulo').textContent  = `Editar ruta — Línea ${escapeHtml(linea.nombre)}`;
    document.getElementById('btn-volver').href          = `/admin/lineas/detalle/?id=${lineaId}`;
    document.getElementById('link-cancelar').href       = `/admin/lineas/detalle/?id=${lineaId}`;

    if (linea.ruta_path?.length >= 2) {
      const latlngs = linea.ruta_path.map(p => [p.lat, p.lng]);
      refLayer = L.polyline(latlngs, {
        color: '#9ca3af', weight: 3, opacity: 0.5, dashArray: '6 4',
      }).addTo(map);
      map.fitBounds(latlngs, { padding: [40, 40] });
    }
  } catch (e) {
    Toast.error('Error al cargar la línea');
  }
});

/* ── OSRM routing entre dos puntos (modo manual) ────────────── */
async function fetchOSRMSegment(desde, hasta) {
  const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/` +
              `${desde.lng},${desde.lat};${hasta.lng},${hasta.lat}` +
              `?overview=full&geometries=geojson`;
  try {
    const res  = await fetch(url);
    const json = await res.json();
    if (json.code !== 'Ok' || !json.routes?.length) throw new Error(json.code);
    return json.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
  } catch (e) {
    console.warn('[OSRM route] falló:', e.message);
    return [desde, hasta];
  }
}

/* ── OSRM Map Matching con traza GPS ────────────────────────── */
async function matchConOSRM(points) {
  let pts = points;
  if (pts.length > 100) {
    const step    = Math.ceil(pts.length / 99);
    const sampled = pts.filter((_, i) => i % step === 0);
    if (sampled[sampled.length - 1] !== pts[pts.length - 1])
      sampled.push(pts[pts.length - 1]);
    pts = sampled;
  }

  const coords   = pts.map(p => `${p.lng},${p.lat}`).join(';');
  const radiuses = pts.map(() => '25').join(';');
  const url = `https://routing.openstreetmap.de/routed-car/match/v1/driving/${coords}` +
              `?overview=full&geometries=geojson&radiuses=${radiuses}`;
  try {
    const res  = await fetch(url);
    const json = await res.json();
    if (json.code !== 'Ok' || !json.matchings?.length) throw new Error(json.code);
    return json.matchings.flatMap(m =>
      m.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
    );
  } catch (e) {
    console.warn('[OSRM match] falló:', e.message);
    return pts;
  }
}

/* ── Path completo ──────────────────────────────────────────── */
function buildFullPath() {
  if (!osrmSegments.length) return waypoints.slice();
  const full = [];
  osrmSegments.forEach((seg, i) => {
    full.push(...(i === 0 ? seg : seg.slice(1)));
  });
  return full;
}

/* ═══════════════════════════════════════════════════════════════
   MODO MANUAL: click en el mapa
   ═══════════════════════════════════════════════════════════════ */
async function onMapClick(e) {
  if (fetching || grabando) return;

  const pt  = { lat: e.latlng.lat, lng: e.latlng.lng };
  const idx = waypoints.length + 1;

  waypoints.push(pt);
  markers.push(
    L.marker([pt.lat, pt.lng], { icon: makeIcon(idx) })
      .addTo(map)
      .bindPopup(`Punto ${idx}<br><small>${pt.lat.toFixed(5)}, ${pt.lng.toFixed(5)}</small>`)
  );

  if (waypoints.length >= 2) {
    fetching = true;
    actualizarContador();
    const seg = await fetchOSRMSegment(waypoints[waypoints.length - 2], pt);
    osrmSegments.push(seg);
    fetching = false;
  }

  actualizarPolilinea();
  actualizarContador();
}

function deshacerUltimoPunto() {
  if (fetching || grabando || !waypoints.length) return;
  waypoints.pop();
  const m = markers.pop();
  if (m) map.removeLayer(m);
  if (osrmSegments.length) osrmSegments.pop();
  actualizarPolilinea();
  actualizarContador();
}

function limpiarRuta() {
  if (fetching || grabando) return;
  waypoints    = [];
  osrmSegments = [];
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (polyline) { map.removeLayer(polyline); polyline = null; }
  actualizarContador();
}

/* ═══════════════════════════════════════════════════════════════
   MODO GRABACIÓN GPS + OSRM Map Matching
   ═══════════════════════════════════════════════════════════════ */
function iniciarGrabacion() {
  if (!navigator.geolocation) {
    Toast.error('Tu dispositivo no soporta geolocalización');
    return;
  }
  gpsPoints = [];
  grabando  = true;
  actualizarUIGrabacion();
  Toast.info('Grabación iniciada. Recorrés la ruta con el dispositivo.');

  watchId = navigator.geolocation.watchPosition(
    pos => {
      gpsPoints.push({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      document.getElementById('gps-count').textContent = `${gpsPoints.length} puntos GPS`;
    },
    err => Toast.error(`Error GPS: ${err.message}`),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
  );
}

async function detenerGrabacion() {
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  grabando = false;

  if (gpsPoints.length < 2) {
    Toast.error('Se necesitan al menos 2 puntos GPS. Intentá de nuevo.');
    gpsPoints = [];
    actualizarUIGrabacion();
    return;
  }

  document.getElementById('gps-count').textContent = 'Mapeando con OSRM…';
  document.getElementById('btn-detener').disabled = true;

  const matched = await matchConOSRM(gpsPoints);
  gpsPoints = [];

  waypoints    = [];
  osrmSegments = [];
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (polyline) { map.removeLayer(polyline); polyline = null; }

  if (matched.length >= 2) {
    const first = matched[0];
    const last  = matched[matched.length - 1];

    waypoints = [first, last];
    markers.push(
      L.marker([first.lat, first.lng], { icon: makeIcon(1) }).addTo(map).bindPopup('Inicio de ruta')
    );
    markers.push(
      L.marker([last.lat, last.lng], { icon: makeIcon(2) }).addTo(map).bindPopup('Fin de ruta')
    );
    osrmSegments = [matched];

    actualizarPolilinea();
    map.fitBounds(matched.map(p => [p.lat, p.lng]), { padding: [40, 40] });
    Toast.success(`Ruta mapeada: ${matched.length} puntos sobre las calles`);
  }

  document.getElementById('btn-detener').disabled = false;
  actualizarUIGrabacion();
  actualizarContador();
}

function actualizarUIGrabacion() {
  document.getElementById('btn-grabar').style.display  = grabando ? 'none' : '';
  document.getElementById('btn-detener').style.display = grabando ? '' : 'none';
  document.getElementById('gps-info').style.display    = grabando ? '' : 'none';
  document.getElementById('btn-deshacer').disabled = grabando;
  document.getElementById('btn-limpiar').disabled  = grabando;
}

/* ── Polilínea ──────────────────────────────────────────────── */
function actualizarPolilinea() {
  if (polyline) map.removeLayer(polyline);
  const full = buildFullPath();
  if (full.length < 2) { polyline = null; return; }
  polyline = L.polyline(full.map(p => [p.lat, p.lng]), {
    color: '#2563EB', weight: 4, opacity: 0.85,
  }).addTo(map);
}

/* ── Contador ───────────────────────────────────────────────── */
function actualizarContador() {
  const el = document.getElementById('puntos-count');
  if (fetching) { el.textContent = 'Calculando ruta…'; return; }
  const n = waypoints.length;
  el.textContent = `${n} punto${n !== 1 ? 's' : ''}`;
}

/* ── Icono numerado ─────────────────────────────────────────── */
function makeIcon(n) {
  return L.divIcon({
    className: '',
    html: `<div class="wp-icon">${n}</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  });
}

/* ── Guardar nueva ruta ─────────────────────────────────────── */
async function guardarRuta() {
  if (fetching || grabando) return;

  if (waypoints.length < 2) {
    Toast.error('Trazá al menos 2 puntos o grabá la ruta para definir el recorrido');
    return;
  }

  const btn = document.getElementById('btn-guardar');
  btn.disabled    = true;
  btn.textContent = 'Guardando…';
  try {
    await Api.patch(`/lineas/${lineaId}/ruta`, { ruta_path: buildFullPath() });
    Toast.success('Ruta actualizada correctamente');
    setTimeout(() => { window.location.href = `/admin/lineas/detalle/?id=${lineaId}`; }, 800);
  } catch (err) {
    Toast.error(err.detail || 'Error al guardar la ruta');
    btn.disabled    = false;
    btn.textContent = 'Guardar ruta';
  }
}
