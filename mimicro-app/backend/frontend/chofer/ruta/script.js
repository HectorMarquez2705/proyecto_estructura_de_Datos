Auth.initPage('chofer');

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

let micro = null, map = null, choferMarker = null;
let watchId = null, rutaActiva = false;

const SCZ = [-17.7833, -63.1822];

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getUser();

  try {
    const micros = await Api.get('/micros');
    micro = micros.find(m => m.chofer_id == user.sub);

    if (!micro) {
      document.getElementById('no-micro-msg').style.display = 'flex';
      return;
    }

    document.getElementById('chofer-content').style.display = 'block';
    document.getElementById('micro-info-sub').textContent   = `Micro ${micro.placa} · ${micro.ruta_nombre || 'Ruta ' + micro.ruta_id}`;
    document.getElementById('info-placa').textContent  = micro.placa;
    document.getElementById('info-ruta').textContent   = micro.ruta_nombre || 'Ruta ' + micro.ruta_id;
    document.getElementById('info-cap').textContent    = `${micro.capacidad} pasajeros`;
    document.getElementById('info-estado').textContent = micro.estado;

    // Inicializar mapa
    map = L.map('chofer-mapa').setView(SCZ, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    // Cargar paradas de la ruta
    if (micro.ruta_id) {
      try {
        const paradas = await Api.get(`/rutas/${micro.ruta_id}/paradas`);
        paradas.forEach(p => L.marker([p.lat, p.lng]).addTo(map).bindPopup(p.nombre));
        if (paradas.length > 0) map.fitBounds(paradas.map(p => [p.lat, p.lng]));
      } catch {}
    }
  } catch { Toast.error('Error al cargar los datos del chofer.'); }
});

async function toggleRuta() {
  if (!micro) return;
  if (!rutaActiva) { iniciarRuta(); }
  else             { detenerRuta(); }
}

function setGPSUI(activo, label) {
  ['gps-indicator','gps-indicator-2'].forEach(id => {
    const el = document.getElementById(id);
    if (activo) el.classList.remove('gps-inactive');
    else        el.classList.add('gps-inactive');
  });
  document.getElementById('gps-label').textContent  = label;
  document.getElementById('gps-label-2').textContent = label;
}

async function iniciarRuta() {
  if (!navigator.geolocation) { Toast.error('Tu navegador no soporta geolocalización.'); return; }

  const btn = document.getElementById('btn-toggle-ruta');
  btn.disabled = true; btn.textContent = 'Activando…';

  try {
    await Api.patch(`/micros/${micro.id}/estado`, { estado: 'activo' });

    watchId = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng, speed } = pos.coords;
        const velocidad = speed ? Math.round(speed * 3.6) : 0;

        document.getElementById('gps-lat').textContent = lat.toFixed(6);
        document.getElementById('gps-lng').textContent = lng.toFixed(6);
        document.getElementById('gps-vel').textContent = `${velocidad} km/h`;
        document.getElementById('gps-ts').textContent  = new Date().toLocaleTimeString('es-BO');

        SocketService.emitirGPS(micro.id, lat, lng, velocidad);

        if (choferMarker) choferMarker.setLatLng([lat, lng]);
        else {
          const icon = L.divIcon({ html: '🚌', iconSize:[36,36], iconAnchor:[18,18], className:'' });
          choferMarker = L.marker([lat, lng], { icon }).addTo(map).bindPopup('Mi posición actual');
        }
        map.panTo([lat, lng]);
      },
      err => { Toast.error(`Error GPS: ${err.message}`); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    rutaActiva = true;
    btn.textContent = '⏹️ Detener Ruta';
    btn.className = 'btn btn-danger btn-lg';
    btn.disabled = false;
    setGPSUI(true, 'Transmitiendo…');
    Toast.success('Ruta iniciada. Transmitiendo posición en tiempo real.');
  } catch (err) {
    Toast.error(err.detail || 'No se pudo iniciar la ruta.');
    btn.disabled = false;
    btn.textContent = '▶️ Iniciar Ruta';
  }
}

async function detenerRuta() {
  const btn = document.getElementById('btn-toggle-ruta');
  btn.disabled = true; btn.textContent = 'Deteniendo…';

  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  SocketService.detenerGPS(micro.id);

  try { await Api.patch(`/micros/${micro.id}/estado`, { estado: 'inactivo' }); } catch {}

  if (choferMarker) { choferMarker.remove(); choferMarker = null; }
  rutaActiva = false;
  btn.textContent = '▶️ Iniciar Ruta';
  btn.className = 'btn btn-primary btn-lg';
  btn.disabled = false;
  setGPSUI(false, 'GPS inactivo');
  document.getElementById('gps-lat').textContent = '—';
  document.getElementById('gps-lng').textContent = '—';
  document.getElementById('gps-vel').textContent = '— km/h';
  Toast.info('Ruta detenida.');
}

window.addEventListener('beforeunload', () => {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  if (rutaActiva && micro) SocketService.detenerGPS(micro.id);
});
