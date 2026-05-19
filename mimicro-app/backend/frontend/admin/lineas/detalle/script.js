/* admin/lineas/detalle/script.js */
Auth.initPage('admin');

const params  = new URLSearchParams(window.location.search);
const lineaId = parseInt(params.get('id'));
if (!lineaId) window.location.href = '/admin/lineas/';

let map            = null;
let routeLayers    = [];
let modoParada     = false;
let lineaNombre    = '';
let paradaTempLat  = null;
let paradaTempLng  = null;
let paradaTempMark = null;
let paradaMarkers  = [];

/* ── Carga principal ────────────────────────────────────────── */
async function init() {
  try {
    const [linea, choferes] = await Promise.all([
      Api.get(`/lineas/${lineaId}`),
      Api.get('/auth/usuarios'),
    ]);
    lineaNombre = linea.nombre;
    document.title = `miMicro — Línea ${escapeHtml(linea.nombre)}`;
    document.getElementById('linea-titulo').textContent = `Línea ${linea.nombre}`;
    document.getElementById('linea-desc').textContent   = linea.descripcion || '';

    renderMapa(linea.ruta_path || []);
    poblarChoferes(choferes);
    renderMicros(linea.micros || []);
  } catch (e) {
    Toast.error(e.detail || 'Error al cargar la línea');
  }
  await cargarParadas();
}

/* ── Acciones de línea ──────────────────────────────────────── */
function cambiarRuta() {
  window.location.href = `/admin/lineas/editar-ruta/?id=${lineaId}`;
}

async function eliminarRuta() {
  if (!confirm(`¿Eliminar la ruta trazada de la línea "${lineaNombre}"?\n\nLa línea, sus micros y sus paradas se conservan.`)) return;
  try {
    await Api.patch(`/lineas/${lineaId}/ruta`, { ruta_path: [] });
    Toast.success('Ruta eliminada');
    init();
  } catch (e) {
    Toast.error(e.detail || 'Error al eliminar la ruta');
  }
}

async function eliminarLinea() {
  if (!confirm(`¿Eliminar la línea "${lineaNombre}"?\n\nLos micros asignados quedarán sin línea. Las paradas serán eliminadas.`)) return;
  try {
    await Api.del(`/lineas/${lineaId}`);
    Toast.success(`Línea "${lineaNombre}" eliminada`);
    setTimeout(() => { window.location.href = '/admin/lineas/'; }, 800);
  } catch (e) {
    Toast.error(e.detail || 'Error al eliminar la línea');
  }
}

/* ── Paradas ────────────────────────────────────────────────── */
async function cargarParadas() {
  try {
    const paradas = await Api.get(`/lineas/${lineaId}/paradas`);
    renderParadas(paradas);
    renderParadasEnMapa(paradas);
  } catch (e) {
    Toast.error('Error al cargar paradas');
  }
}

function renderParadas(paradas) {
  const tbody = document.getElementById('paradas-body');
  document.getElementById('paradas-count').textContent = paradas.length;

  if (!paradas.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          <div class="empty-icon">📍</div>
          <div class="empty-title">Sin paradas definidas</div>
          <div class="empty-sub">Activá "Agregar parada" y hacé clic en el mapa</div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = paradas.map(p => `
    <tr data-id="${p.id}">
      <td class="orden-cell">${p.orden}</td>
      <td><strong>${escapeHtml(p.nombre)}</strong></td>
      <td class="coords-cell">${parseFloat(p.lat).toFixed(5)}, ${parseFloat(p.lng).toFixed(5)}</td>
      <td>
        <button class="btn btn-sm btn-ghost btn-danger-ghost"
          onclick="eliminarParada(${p.id})">🗑</button>
      </td>
    </tr>`).join('');
}

function renderParadasEnMapa(paradas) {
  paradaMarkers.forEach(m => map && map.removeLayer(m));
  paradaMarkers = [];
  paradas.forEach((p, i) => {
    const m = L.marker([p.lat, p.lng], { icon: makeParadaIcon(i + 1) })
      .addTo(map)
      .bindPopup(`<strong>${escapeHtml(p.nombre)}</strong><br><small>Parada #${p.orden}</small>`);
    paradaMarkers.push(m);
  });
}

async function eliminarParada(paradaId) {
  if (!confirm('¿Eliminar esta parada?')) return;
  try {
    await Api.del(`/lineas/${lineaId}/paradas/${paradaId}`);
    Toast.success('Parada eliminada');
    cargarParadas();
  } catch (e) {
    Toast.error(e.detail || 'Error al eliminar la parada');
  }
}

/* ── Modo agregar parada ────────────────────────────────────── */
function toggleModoParada() {
  modoParada = !modoParada;
  const btn   = document.getElementById('btn-modo-parada');
  const label = document.getElementById('modo-label');
  const hint  = document.getElementById('map-hint');

  if (modoParada) {
    btn.textContent = '✕ Cancelar';
    btn.classList.replace('btn-outline', 'btn-danger-ghost');
    label.textContent = 'Modo: Agregar parada';
    label.className   = 'modo-label modo-agregar';
    hint.style.display = 'block';
    map.getContainer().style.cursor = 'crosshair';
  } else {
    btn.textContent = '📍 Agregar parada';
    btn.classList.replace('btn-danger-ghost', 'btn-outline');
    label.textContent = 'Modo: Ver';
    label.className   = 'modo-label modo-ver';
    hint.style.display = 'none';
    map.getContainer().style.cursor = '';
    cancelarParada();
  }
}

function onMapClickParada(e) {
  if (!modoParada) return;
  const { lat, lng } = e.latlng;
  paradaTempLat = lat;
  paradaTempLng = lng;

  if (paradaTempMark) map.removeLayer(paradaTempMark);
  paradaTempMark = L.marker([lat, lng], { icon: makeParadaIcon('?'), opacity: 0.7 }).addTo(map);

  document.getElementById('p-coords').textContent =
    `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  document.getElementById('p-nombre').value = '';
  Modal.open('modal-parada');
}

function cancelarParada() {
  Modal.close('modal-parada');
  if (paradaTempMark) { map.removeLayer(paradaTempMark); paradaTempMark = null; }
  paradaTempLat = paradaTempLng = null;
}

async function confirmarParada(e) {
  e.preventDefault();
  const btn    = document.getElementById('btn-guardar-parada');
  const nombre = document.getElementById('p-nombre').value.trim();
  if (!nombre || paradaTempLat === null) return;

  btn.disabled = true;
  btn.textContent = 'Guardando…';
  try {
    await Api.post(`/lineas/${lineaId}/paradas`, {
      nombre, lat: paradaTempLat, lng: paradaTempLng,
    });
    Toast.success(`Parada "${nombre}" agregada`);
    cancelarParada();
    cargarParadas();
  } catch (err) {
    Toast.error(err.detail || 'Error al guardar la parada');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar Parada';
  }
}

/* ── Mapa ───────────────────────────────────────────────────── */
function renderMapa(rutaPath) {
  const noRutaEl = document.getElementById('map-no-ruta');
  const center   = rutaPath && rutaPath.length
    ? [rutaPath[0].lat, rutaPath[0].lng]
    : [-17.7833, -63.1822];

  // Solo inicializar Leaflet UNA vez — la segunda llamada reutiliza el mapa existente
  if (!map) {
    map = L.map('map-detalle').setView(center, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    map.on('click', onMapClickParada);
  }

  // Limpiar capas de ruta anteriores antes de redibujar
  routeLayers.forEach(l => map.removeLayer(l));
  routeLayers = [];

  if (!rutaPath || !rutaPath.length) {
    noRutaEl.style.display = 'block';
    return;
  }
  noRutaEl.style.display = 'none';

  const latlngs = rutaPath.map(p => [p.lat, p.lng]);
  routeLayers.push(
    L.polyline(latlngs, { color: '#2563EB', weight: 4, opacity: 0.75 }).addTo(map)
  );

  if (latlngs.length >= 1)
    routeLayers.push(
      L.marker(latlngs[0], { icon: makeEndIcon('▶', '#16a34a') })
        .addTo(map).bindPopup('Inicio de ruta')
    );
  if (latlngs.length >= 2)
    routeLayers.push(
      L.marker(latlngs[latlngs.length - 1], { icon: makeEndIcon('■', '#dc2626') })
        .addTo(map).bindPopup('Fin de ruta')
    );

  rutaPath.slice(1, -1).forEach(p => {
    routeLayers.push(
      L.circleMarker([p.lat, p.lng], {
        radius: 4, color: '#2563EB', fillColor: '#fff', fillOpacity: 1, weight: 2,
      }).addTo(map)
    );
  });

  map.fitBounds(latlngs, { padding: [30, 30] });
}

function makeEndIcon(symbol, color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;background:${color};color:#fff;border:2px solid #fff;
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,.35);">${symbol}</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  });
}

function makeParadaIcon(n) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;background:#f59e0b;color:#fff;border:2px solid #fff;
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:10px;font-weight:700;box-shadow:0 2px 5px rgba(0,0,0,.35);">${n}</div>`,
    iconSize: [26, 26], iconAnchor: [13, 13],
  });
}

/* ── Micros ─────────────────────────────────────────────────── */
function renderMicros(micros) {
  const tbody = document.getElementById('micros-body');
  document.getElementById('micros-count').textContent = micros.length;
  if (!micros.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">
      <div class="empty-icon">🚌</div>
      <div class="empty-title">No hay micros asignados</div>
      <div class="empty-sub">Agregá el primero con "+ Agregar Micro"</div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = micros.map(m => {
    const eb = m.estado === 'activo' ? 'success' : 'danger';
    const oc = m.ocupacion_estado || 'vacio';
    const ob = oc === 'lleno' ? 'danger' : oc === 'medio' ? 'warning' : 'success';
    return `<tr>
      <td><span class="placa-text">${escapeHtml(m.placa || '—')}</span></td>
      <td>${escapeHtml(m.modelo || '—')}</td>
      <td style="color:var(--text-2);font-size:13px;">${escapeHtml(m.descripcion || '—')}</td>
      <td>${escapeHtml(m.chofer_nombre || '—')}</td>
      <td><span class="badge badge-${eb}">${m.estado || 'inactivo'}</span></td>
      <td><span class="badge badge-${ob}">${oc}</span></td>
    </tr>`;
  }).join('');
}

function poblarChoferes(usuarios) {
  const sel = document.getElementById('m-chofer');
  sel.innerHTML = '<option value="">Sin chofer asignado</option>' +
    (usuarios || []).filter(u => u.rol === 'chofer').map(c =>
      `<option value="${c.id}">${escapeHtml(c.nombre)} — ${escapeHtml(c.email)}</option>`
    ).join('');
}

async function agregarMicro(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-agregar');
  const cv  = document.getElementById('m-chofer').value;
  const body = {
    placa:       document.getElementById('m-placa').value.trim().toUpperCase(),
    modelo:      document.getElementById('m-modelo').value.trim(),
    descripcion: document.getElementById('m-descripcion').value.trim(),
    chofer_id:   cv ? parseInt(cv) : null,
  };
  if (!body.placa)  { Toast.error('La placa es requerida'); return; }
  if (!body.modelo) { Toast.error('El modelo es requerido'); return; }
  btn.disabled = true; btn.textContent = 'Agregando…';
  try {
    await Api.post(`/lineas/${lineaId}/micros`, body);
    Toast.success(`Micro ${body.placa} agregado`);
    Modal.close('modal-micro');
    document.getElementById('form-micro').reset();
    init();
  } catch (err) {
    Toast.error(err.detail || 'Error al agregar el micro');
  } finally {
    btn.disabled = false; btn.textContent = 'Agregar Micro';
  }
}

document.addEventListener('DOMContentLoaded', init);
