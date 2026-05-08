/* pasajero/mapa/script.js */
Auth.initPage('pasajero');

const SCZ = [-17.7833, -63.1822];

let map    = null;
let socket = null;

let origenLat = null, origenLng = null;
let destinoLat = null, destinoLng = null;
let origenMarker  = null;
let destinoMarker = null;
let pinMode = null;
let rutaLayers = [];
let microMarkers = {};
let lineasSuscritas = new Set();

/* ── Íconos ─────────────────────────────────────────────────────── */
function makeOrigenIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;background:#16a34a;border:3px solid #fff;
      border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9],
  });
}

function makeDestinoIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;width:20px;">
      <div style="width:18px;height:18px;background:#dc2626;border:3px solid #fff;
        border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>
      <div style="width:2px;height:12px;background:#dc2626;"></div>
    </div>`,
    iconSize: [20, 30], iconAnchor: [10, 30],
  });
}

const iconMicro = L.divIcon({
  html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45));">🚌</div>',
  iconSize: [32, 32], iconAnchor: [16, 16], className: '',
});

/* ── Init ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initMapa();

  try {
    socket = SocketService.connect();
    socket.on('micro_moved',   onMicroMoved);
    socket.on('micro_offline', onMicroOffline);
  } catch (e) {
    console.warn('miMicro: Socket.IO no disponible', e);
  }

  initGPS();

  document.getElementById('btn-gps').addEventListener('click', initGPS);
  document.getElementById('btn-calcular').addEventListener('click', calcularRuta);
  document.getElementById('btn-modo-origen').addEventListener('click', () => setPinMode('origen'));
  document.getElementById('btn-modo-destino').addEventListener('click', () => setPinMode('destino'));
  document.getElementById('btn-clear-dest').addEventListener('click', clearDestino);
});

function initMapa() {
  map = L.map('mapa-container', { zoomControl: true }).setView(SCZ, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19,
  }).addTo(map);
  map.on('click', onMapClick);
}

function initGPS() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    pos => setOrigen(pos.coords.latitude, pos.coords.longitude, true),
    () => {}
  );
}

/* ── Modo pin ────────────────────────────────────────────────────── */
function setPinMode(mode) {
  pinMode = mode;
  const hint = document.getElementById('pin-hint');
  hint.style.display = 'block';
  hint.textContent = mode === 'origen'
    ? '📌 Hacé clic en el mapa para cambiar el origen'
    : '📌 Hacé clic en el mapa para fijar el destino';
  map.getContainer().style.cursor = 'crosshair';

  document.getElementById('btn-modo-origen').className =
    `btn btn-sm ${mode === 'origen' ? 'btn-primary' : 'btn-outline'}`;
  document.getElementById('btn-modo-destino').className =
    `btn btn-sm ${mode === 'destino' ? 'btn-primary' : 'btn-outline'}`;
}

function clearPinMode() {
  pinMode = null;
  document.getElementById('pin-hint').style.display = 'none';
  map.getContainer().style.cursor = '';
  document.getElementById('btn-modo-origen').className  = 'btn btn-sm btn-outline';
  document.getElementById('btn-modo-destino').className = 'btn btn-sm btn-outline';
}

function onMapClick(e) {
  if (!pinMode) return;
  const { lat, lng } = e.latlng;
  if (pinMode === 'origen') setOrigen(lat, lng, false);
  else setDestino(lat, lng);
  clearPinMode();
}

/* ── Origen / Destino ────────────────────────────────────────────── */
function setOrigen(lat, lng, fromGPS = false) {
  origenLat = lat; origenLng = lng;
  document.getElementById('input-origen').value = fromGPS
    ? `Mi ubicación (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  if (origenMarker) map.removeLayer(origenMarker);
  origenMarker = L.marker([lat, lng], { icon: makeOrigenIcon() })
    .addTo(map).bindPopup('<strong>Origen</strong>');
  if (fromGPS) map.setView([lat, lng], 15);
  checkPinsReady();
}

function setDestino(lat, lng) {
  destinoLat = lat; destinoLng = lng;
  document.getElementById('input-destino').value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  document.getElementById('btn-clear-dest').style.display = '';
  if (destinoMarker) map.removeLayer(destinoMarker);
  destinoMarker = L.marker([lat, lng], { icon: makeDestinoIcon() })
    .addTo(map).bindPopup('<strong>Destino</strong>');
  checkPinsReady();
}

function clearDestino() {
  destinoLat = destinoLng = null;
  document.getElementById('input-destino').value = '';
  document.getElementById('btn-clear-dest').style.display = 'none';
  if (destinoMarker) { map.removeLayer(destinoMarker); destinoMarker = null; }
  checkPinsReady();
  clearRutaLayers();
  document.getElementById('result-section').style.display  = 'none';
  document.getElementById('no-ruta-section').style.display = 'none';
}

function checkPinsReady() {
  document.getElementById('btn-calcular').disabled =
    origenLat === null || destinoLat === null;
}

/* ── Calcular ruta ───────────────────────────────────────────────── */
async function calcularRuta() {
  const btn = document.getElementById('btn-calcular');
  btn.disabled = true;
  btn.textContent = 'Calculando…';

  clearRutaLayers();
  document.getElementById('result-section').style.display  = 'none';
  document.getElementById('no-ruta-section').style.display = 'none';

  try {
    const data = await Api.post('/routing/planificar', {
      origen_lat:  origenLat,  origen_lng:  origenLng,
      destino_lat: destinoLat, destino_lng: destinoLng,
    });

    if (!data.encontrado) {
      document.getElementById('no-ruta-section').style.display = 'flex';
    } else {
      renderResultado(data);
      drawRuta(data.tramos);
      suscribirLineas(data.tramos);
    }
  } catch (e) {
    Toast.error(e.detail || 'Error al calcular la ruta');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Calcular ruta óptima';
    checkPinsReady();
  }
}

/* ── Render panel ────────────────────────────────────────────────── */
function renderResultado(data) {
  const totalMin = Math.round(data.tiempo_total_seg / 60);
  document.getElementById('result-tiempo').textContent = totalMin >= 60
    ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`
    : `${totalMin} min`;

  document.getElementById('tramos-list').innerHTML =
    data.tramos.map(renderTramo).join('');
  document.getElementById('result-section').style.display = 'block';
}

function renderTramo(t) {
  const min = Math.round(t.tiempo_seg / 60);

  if (t.tipo === 'caminar') {
    const dist = t.distancia_m < 1000
      ? `${Math.round(t.distancia_m)} m`
      : `${(t.distancia_m / 1000).toFixed(1)} km`;
    return `
      <div class="tramo tramo-walk">
        <div class="tramo-icon">🚶</div>
        <div class="tramo-body">
          <div class="tramo-title">Caminar ${dist}</div>
          <div class="tramo-sub">${min} min · ${escapeHtml(t.descripcion)}</div>
        </div>
      </div>`;
  }

  /* tipo === 'micro' */
  const nombre = escapeHtml(t.linea_nombre || `Línea ${t.linea_id}`);
  const km     = (t.distancia_m / 1000).toFixed(1);

  const etaHtml = t.micro_cercano
    ? `<div class="micro-eta">
        🚌 Micro a <strong>${Math.round(t.micro_cercano.distancia_m)} m</strong>
        — llega en ~<strong>${Math.round(t.micro_cercano.eta_seg / 60)} min</strong>
       </div>`
    : '';

  return `
    <div class="tramo" data-linea="${t.linea_id || ''}">
      <div class="tramo-icon">🚌</div>
      <div class="tramo-body">
        <div class="tramo-title">Línea <strong>${nombre}</strong></div>
        <div class="tramo-sub">${min} min · ${km} km en ruta</div>
        ${etaHtml}
      </div>
    </div>`;
}

/* ── Dibujar ruta en mapa ────────────────────────────────────────── */
function clearRutaLayers() {
  rutaLayers.forEach(l => map && map.removeLayer(l));
  rutaLayers = [];
  Object.values(microMarkers).forEach(m => map && map.removeLayer(m));
  microMarkers = {};
}

function drawRuta(tramos) {
  const COLORS = ['#2563EB', '#7c3aed', '#db2777', '#d97706', '#059669'];
  let colorIdx = 0;
  const bounds = [];

  if (origenLat)  bounds.push([origenLat,  origenLng]);
  if (destinoLat) bounds.push([destinoLat, destinoLng]);

  tramos.forEach(t => {

    if (t.tipo === 'caminar') {
      /* Segmento a pie: línea punteada directa de punto a punto */
      if (t.distancia_m < 1) return;   // omitir segmentos con distancia cero
      const from = [t.desde_lat, t.desde_lng];
      const to   = [t.hasta_lat, t.hasta_lng];
      const pl = L.polyline([from, to], {
        color: '#6b7280', weight: 3, opacity: 0.65, dashArray: '7 7',
      }).addTo(map);
      rutaLayers.push(pl);
      bounds.push(from, to);

    } else if (t.tipo === 'micro') {
      /* Segmento en micro: polyline siguiendo el ruta_path real de la línea */
      const segmento = t.ruta_segmento || [];
      if (!segmento.length) return;

      const color   = COLORS[colorIdx % COLORS.length];
      colorIdx++;
      const latlngs = segmento.map(p => [p.lat, p.lng]);

      const pl = L.polyline(latlngs, { color, weight: 5, opacity: 0.85 }).addTo(map);
      rutaLayers.push(pl);
      bounds.push(...latlngs);

      /* Marcadores de subida y bajada */
      const puntos = [
        { ll: latlngs[0],                    label: 'Subida' },
        { ll: latlngs[latlngs.length - 1],   label: 'Bajada' },
      ];
      puntos.forEach(({ ll, label }) => {
        const cm = L.circleMarker(ll, {
          radius: 7, color: '#fff', fillColor: color, fillOpacity: 1, weight: 2.5,
        }).addTo(map)
          .bindPopup(`<strong>${label}: ${escapeHtml(t.linea_nombre || String(t.linea_id))}</strong>`);
        rutaLayers.push(cm);
      });

      /* Micro activo más cercano */
      if (t.micro_cercano) {
        const mc  = t.micro_cercano;
        const mid = String(mc.micro_id);
        if (!microMarkers[mid]) {
          const m = L.marker([mc.lat, mc.lng], { icon: iconMicro })
            .addTo(map)
            .bindPopup(`🚌 Micro activo<br>A ${Math.round(mc.distancia_m)} m<br>ETA: ~${Math.round(mc.eta_seg / 60)} min`);
          microMarkers[mid] = m;
          bounds.push([mc.lat, mc.lng]);
        }
      }
    }
  });

  if (bounds.length > 1) map.fitBounds(bounds, { padding: [60, 40] });
}

/* ── Socket.IO — micros en tiempo real ───────────────────────────── */
function suscribirLineas(tramos) {
  if (!socket) return;
  lineasSuscritas.forEach(id => socket.emit('leave_linea', { lineaId: id }));
  lineasSuscritas.clear();
  tramos.forEach(t => {
    if (t.tipo === 'micro' && t.linea_id && !lineasSuscritas.has(t.linea_id)) {
      socket.emit('join_linea', { lineaId: t.linea_id });
      lineasSuscritas.add(t.linea_id);
    }
  });
}

function onMicroMoved(data) {
  const mid = String(data.microId);
  if (!microMarkers[mid]) return;
  microMarkers[mid].setLatLng([data.lat, data.lng]);
  microMarkers[mid].getPopup()?.setContent(
    `🚌 Micro activo<br>${Math.round(data.velocidad || 0)} km/h`
  );
}

function onMicroOffline(data) {
  const mid = String(data.microId);
  if (microMarkers[mid]) {
    map.removeLayer(microMarkers[mid]);
    delete microMarkers[mid];
  }
}

window.addEventListener('beforeunload', () => {
  if (!socket) return;
  lineasSuscritas.forEach(id => socket.emit('leave_linea', { lineaId: id }));
});
