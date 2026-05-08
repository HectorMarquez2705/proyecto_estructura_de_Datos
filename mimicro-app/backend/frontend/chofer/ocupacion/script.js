Auth.initPage('chofer');
let microId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getUser();
  const infoDiv = document.getElementById('micro-info');

  try {
    const micros = await Api.get('/micros');
    const micro  = micros.find(m => m.chofer_id == user.sub);

    if (!micro) {
      infoDiv.innerHTML = '<div class="empty-state" style="padding:20px"><div class="empty-title">Sin micro asignado</div><div class="empty-sub">Contactá al administrador</div></div>';
      return;
    }

    microId = micro.id;
    infoDiv.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:4px;">
        <div><div style="font-size:11px;color:var(--text-3);text-transform:uppercase;font-weight:600;">Placa</div><div style="font-size:16px;font-weight:700;">${micro.placa}</div></div>
        <div><div style="font-size:11px;color:var(--text-3);text-transform:uppercase;font-weight:600;">Ruta</div><div style="font-size:16px;font-weight:700;">${micro.ruta_nombre||'—'}</div></div>
        <div><div style="font-size:11px;color:var(--text-3);text-transform:uppercase;font-weight:600;">Capacidad</div><div style="font-size:16px;font-weight:700;">${micro.capacidad} pasajeros</div></div>
        <div><div style="font-size:11px;color:var(--text-3);text-transform:uppercase;font-weight:600;">Estado actual</div><span class="badge ${micro.estado==='activo'?'badge-green':'badge-gray'}">${micro.estado}</span></div>
      </div>`;

    document.getElementById('ocup-section').style.display = 'block';

    // Marcar estado actual si corresponde
    if (micro.ocupacion_estado) {
      const btn = document.getElementById(`btn-${micro.ocupacion_estado}`);
      if (btn) btn.classList.add('selected');
      mostrarUltimo(micro.ocupacion_estado);
    }
  } catch { Toast.error('Error al cargar datos del micro.'); }
});

async function reportarOcupacion(estado, btnEl) {
  if (!microId) return;
  const btns = document.querySelectorAll('.ocup-btn');
  btns.forEach(b => { b.disabled = true; b.classList.remove('selected'); });
  btnEl.classList.add('selected');

  try {
    await Api.patch(`/micros/${microId}/ocupacion`, { estado });
    Toast.success(`✅ Ocupación reportada: ${estado}`);
    mostrarUltimo(estado);
  } catch (err) {
    Toast.error(err.detail || 'No se pudo reportar la ocupación.');
    btnEl.classList.remove('selected');
  } finally {
    btns.forEach(b => b.disabled = false);
  }
}

function mostrarUltimo(estado) {
  const labels = { vacio: '🟢 Vacío', medio: '🟡 Medio', lleno: '🔴 Lleno' };
  const el = document.getElementById('ultimo-estado');
  el.style.display = 'block';
  document.getElementById('ultimo-label').textContent = labels[estado] || estado;
}
