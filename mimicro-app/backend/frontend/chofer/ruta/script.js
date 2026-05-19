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

/* OSRM car pasando por todos los waypoints de ruta_path. Devuelve [[lat,lng],...]. */
async function fetchOSRMCarRoute(waypoints) {
  const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coords}` +
              `?overview=full&geometries=geojson`;
  try {
    const res  = await fetch(url);
    const json = await res.json();
    if (json.code !== 'Ok' || !json.routes?.length) throw new Error(json.code);
    return json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch (e) {
    console.warn('[OSRM car] falló:', e.message);
    return waypoints.map(p => [p.lat, p.lng]);
  }
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

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getUser();

  try {
    const micros = await Api.get('/micros');
    micro = micros.find(m => m.chofer_id == user.sub);

    if (!micro) {
      document.getElementById('no-micro-msg').style.display = 'block';
      return;
    }

    document.getElementById('chofer-content').style.display = 'flex';

    map = L.map('chofer-mapa').setView(SCZ, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    if (micro.linea_id) {
      /* ── Línea asignada: cargar ruta_path + paradas en paralelo ── */
      try {
        const [linea, paradas] = await Promise.all([
          Api.get(`/lineas/${micro.linea_id}`),
          Api.get(`/lineas/${micro.linea_id}/paradas`),
        ]);

        document.getElementById('info-ruta-nombre').textContent  = `Línea ${linea.nombre}`;
        document.getElementById('micro-placa-badge').textContent = micro.placa;
        document.getElementById('info-placa').textContent  = micro.placa;
        document.getElementById('info-ruta').textContent   = micro.modelo || `Línea ${linea.nombre}`;
        document.getElementById('info-cap').textContent    = `${micro.capacidad || '—'} pasajeros`;
        document.getElementById('info-cap-badge').textContent = `${micro.capacidad || '—'} pasajeros`;
        document.getElementById('info-estado').textContent = micro.estado || 'inactivo';

        /* Dibujar ruta_path via OSRM car */
        const rutaPath = linea.ruta_path || [];
        if (rutaPath.length >= 2) {
          const coords = await fetchOSRMCarRoute(rutaPath);
          L.polyline(coords, { color: '#2563EB', weight: 5, opacity: 0.8 }).addTo(map);
          L.marker(coords[0], { icon: makeEndIcon('▶', '#16a34a') }).addTo(map).bindPopup('Inicio de ruta');
          L.marker(coords[coords.length - 1], { icon: makeEndIcon('■', '#dc2626') }).addTo(map).bindPopup('Fin de ruta');
          map.fitBounds(coords, { padding: [40, 40] });
        }

        /* Dibujar paradas */
        paradas.forEach((p, i) => {
          L.marker([p.lat, p.lng], { icon: makeParadaIcon(i + 1) })
            .addTo(map)
            .bindPopup(`<strong>${escapeHtml(p.nombre)}</strong><br><small>Parada #${p.orden}</small>`);
        });

      } catch (e) {
        console.warn('Error cargando línea:', e);
        Toast.error('No se pudo cargar la ruta de la línea');
      }

    } else {
      /* ── Sin línea: fallback al sistema de rutas antiguo ── */
      document.getElementById('info-ruta-nombre').textContent  = micro.ruta_nombre || 'Sin línea asignada';
      document.getElementById('micro-placa-badge').textContent = micro.placa;
      document.getElementById('info-placa').textContent  = micro.placa;
      document.getElementById('info-ruta').textContent   = micro.modelo || micro.ruta_nombre || 'Sin línea';
      document.getElementById('info-cap').textContent    = `${micro.capacidad || '—'} pasajeros`;
      document.getElementById('info-cap-badge').textContent = `${micro.capacidad || '—'} pasajeros`;
      document.getElementById('info-estado').textContent = micro.estado || 'inactivo';

      if (micro.ruta_id) {
        try {
          const paradas = await Api.get(`/rutas/${micro.ruta_id}/paradas`);
          paradas.forEach((p, i) => {
            L.marker([p.lat, p.lng], { icon: makeParadaIcon(i + 1) })
              .addTo(map).bindPopup(p.nombre);
          });
          if (paradas.length > 0) map.fitBounds(paradas.map(p => [p.lat, p.lng]));
        } catch {}
      }
    }

  } catch { Toast.error('Error al cargar los datos del chofer.'); }
});

async function toggleRuta() {
  if (!micro) return;
  if (!rutaActiva) { iniciarRuta(); }
  else             { detenerRuta(); }
}

function setGPSUI(activo, label) {
  const el = document.getElementById('gps-indicator');
  if (activo) el.classList.remove('gps-inactive');
  else        el.classList.add('gps-inactive');
  document.getElementById('gps-label').textContent = label;
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

        document.getElementById('gps-lat').textContent = lat.toFixed(5);
        document.getElementById('gps-lng').textContent = lng.toFixed(5);
        document.getElementById('gps-vel').textContent = `${velocidad} km/h`;

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
    btn.textContent = '⏹️ Detener ruta';
    btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
    btn.disabled = false;
    setGPSUI(true, 'Transmitiendo…');
    Toast.success('Ruta iniciada. Transmitiendo posición en tiempo real.');
  } catch (err) {
    Toast.error(err.detail || 'No se pudo iniciar la ruta.');
    btn.disabled = false;
    btn.textContent = '▶️ Iniciar ruta';
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
  btn.textContent = '▶️ Iniciar ruta';
  btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
  btn.disabled = false;
  setGPSUI(false, 'GPS inactivo');
  document.getElementById('gps-lat').textContent = '—';
  document.getElementById('gps-lng').textContent = '—';
  document.getElementById('gps-vel').textContent = '— km/h';
  Toast.info('Ruta detenida.');
}

async function setOcupacion(estado, btn) {
  document.querySelectorAll('.ocup-btn').forEach(b => {
    b.classList.remove('active-vacio', 'active-medio', 'active-lleno');
  });
  btn.classList.add(`active-${estado}`);
  if (micro) {
    try { await Api.patch(`/micros/${micro.id}/ocupacion`, { estado }); }
    catch { Toast.error('No se pudo actualizar ocupación'); }
  }
}

window.addEventListener('beforeunload', () => {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  if (rutaActiva && micro) SocketService.detenerGPS(micro.id);
});
