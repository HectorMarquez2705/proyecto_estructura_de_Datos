Auth.initPage('pasajero');

document.addEventListener('DOMContentLoaded', async () => {
  const user   = Auth.getUser();
  const list   = document.getElementById('historial-list');

  try {
    const viajes = await Api.get(`/gps/historial/${user.sub}`);
    if (!viajes || viajes.length === 0) {
      list.innerHTML = `<div class="empty-state">
        <div class="empty-icon">🚌</div>
        <div class="empty-title">Sin viajes registrados</div>
        <div class="empty-sub">Tus viajes aparecerán aquí una vez que uses el servicio</div>
      </div>`;
      return;
    }

    list.innerHTML = `<div class="hist-list">${viajes.map((v, i) => {
      const fecha = new Date(v.fecha || v.timestamp || v.fecha_inicio || Date.now())
        .toLocaleString('es-BO', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
      const costo = v.costo || v.monto_cobrado || 3.50;
      return `<div class="hist-item" style="animation-delay:${i*0.05}s">
        <div class="hist-icon">🚌</div>
        <div class="hist-main">
          <div class="hist-ruta">${v.ruta_nombre || v.rutaId || 'Ruta ' + (v.ruta_id || '—')}</div>
          <div class="hist-paradas">
            ${v.parada_origen || 'Origen'} → ${v.parada_destino || 'Destino'}
            · Micro ${v.micro_id || '—'}
          </div>
        </div>
        <div class="hist-meta">
          <div class="hist-fecha">${fecha}</div>
          <div class="hist-costo">Bs ${parseFloat(costo).toFixed(2)}</div>
        </div>
      </div>`;
    }).join('')}</div>`;
  } catch {
    Toast.error('No se pudo cargar el historial.');
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Error al cargar</div><div class="empty-sub">Intentá recargar la página</div></div>`;
  }
});
