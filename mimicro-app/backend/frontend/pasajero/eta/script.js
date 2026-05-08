Auth.initPage('pasajero');

let refreshTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Cargar rutas
  try {
    const rutas = await Api.get('/rutas');
    const sel = document.getElementById('sel-ruta');
    sel.innerHTML = '<option value="">Seleccioná una ruta</option>';
    rutas.forEach(r => {
      const o = document.createElement('option');
      o.value = r.id; o.textContent = r.nombre;
      sel.appendChild(o);
    });
  } catch { Toast.error('Error al cargar rutas.'); }

  document.getElementById('sel-ruta').addEventListener('change', async function () {
    const rutaId = this.value;
    const selParada = document.getElementById('sel-parada');
    clearInterval(refreshTimer);
    resetResultado();

    if (!rutaId) { selParada.disabled = true; selParada.innerHTML = '<option>Seleccioná una ruta primero</option>'; return; }

    try {
      const paradas = await Api.get(`/rutas/${rutaId}/paradas`);
      selParada.innerHTML = '<option value="">Seleccioná una parada</option>';
      paradas.forEach(p => {
        const o = document.createElement('option');
        o.value = p.id; o.textContent = `${p.orden_en_ruta}. ${p.nombre}`;
        selParada.appendChild(o);
      });
      selParada.disabled = false;
    } catch { Toast.error('Error al cargar paradas.'); }
  });

  document.getElementById('sel-parada').addEventListener('change', function () {
    clearInterval(refreshTimer);
    if (this.value) {
      cargarETA();
      refreshTimer = setInterval(cargarETA, 10000);
    }
  });
});

async function cargarETA() {
  const rutaId   = document.getElementById('sel-ruta').value;
  const paradaId = document.getElementById('sel-parada').value;
  if (!rutaId || !paradaId) return;

  try {
    const lista = await Api.get(`/eta/ruta/${rutaId}/${paradaId}`);
    const result = document.getElementById('eta-result');

    if (!lista || lista.length === 0) {
      result.innerHTML = `<div class="empty-state"><div class="empty-icon">🚌</div><div class="empty-title">Sin micros activos</div><div class="empty-sub">No hay micros activos en esta ruta en este momento</div></div>`;
      return;
    }

    const badgeOcup = o => {
      const map = { vacio: 'badge-green', medio: 'badge-amber', lleno: 'badge-red' };
      const label = { vacio: '🟢 Vacío', medio: '🟡 Medio', lleno: '🔴 Lleno' };
      return `<span class="badge ${map[o]||'badge-gray'}">${label[o]||o||'—'}</span>`;
    };

    result.innerHTML = `<div class="eta-grid">${lista.map((m, i) => {
      const mins = Math.round((m.tiempoSegundos || 0) / 60);
      const dist = m.distanciaMetros >= 1000
        ? `${(m.distanciaMetros/1000).toFixed(1)} km`
        : `${Math.round(m.distanciaMetros||0)} m`;
      return `<div class="eta-item" style="animation-delay:${i*0.06}s">
        <div class="eta-bus">🚌</div>
        <div class="eta-info">
          <div class="eta-placa">Micro ${m.microId}</div>
          <div class="eta-dist">${dist} de distancia · ${badgeOcup(m.ocupacion)}</div>
        </div>
        <div class="eta-right">
          <div class="eta-mins">${mins}</div>
          <div class="eta-mins-label">minutos</div>
        </div>
      </div>`;
    }).join('')}</div>`;
  } catch { Toast.error('No se pudo actualizar el ETA.'); }
}

function resetResultado() {
  document.getElementById('eta-result').innerHTML = `<div class="empty-state"><div class="empty-icon">🚌</div><div class="empty-title">Esperando selección</div></div>`;
}

window.addEventListener('beforeunload', () => clearInterval(refreshTimer));
