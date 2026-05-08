/* admin/micros/script.js */
Auth.initPage('admin');

/* ── Carga inicial ──────────────────────────────────────────── */
async function init() {
  try {
    const [micros, rutas] = await Promise.all([
      Api.get('/micros'),
      Api.get('/rutas'),
    ]);
    renderMicros(micros);
    poblarSelectRutas(rutas);
  } catch (e) {
    Toast.error(e.detail || 'Error al cargar datos');
    document.getElementById('tabla-body').innerHTML =
      '<tr><td colspan="6" class="empty-state"><div class="empty-icon">⚠️</div><div>No se pudo cargar la flota</div></td></tr>';
  }
}

/* ── Poblar select de rutas en el modal ─────────────────────── */
function poblarSelectRutas(rutas) {
  const sel = document.getElementById('m-ruta');
  sel.innerHTML =
    '<option value="">Sin ruta</option>' +
    rutas.map(r => `<option value="${r.id}">${escapeHtml(r.nombre)}</option>`).join('');
}

/* ── Renderizado de tabla ───────────────────────────────────── */
function renderMicros(micros) {
  const tbody = document.getElementById('tabla-body');

  if (!micros.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-icon">🚌</div>
          <div class="empty-title">No hay micros registrados</div>
          <div class="empty-sub">Agregá el primer vehículo con "Nuevo Micro"</div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = micros.map(m => {
    const estadoBadge  = m.estado === 'activo' ? 'success' : 'danger';
    const ocup         = m.ocupacion || 'vacio';
    const ocupBadge    = ocup === 'lleno' ? 'danger' : ocup === 'medio' ? 'warning' : 'success';

    return `
    <tr data-id="${m.id}">
      <td><span class="placa-text">${escapeHtml(m.placa || '—')}</span></td>
      <td style="text-align:center;">${m.capacidad ?? '—'}</td>
      <td style="color:var(--text-2);">${escapeHtml(m.ruta_nombre || (m.ruta_id ? `Ruta #${m.ruta_id}` : '—'))}</td>
      <td><span class="badge badge-${estadoBadge}">${m.estado || '—'}</span></td>
      <td><span class="badge badge-${ocupBadge}">${ocup}</span></td>
      <td style="color:var(--text-3);font-size:13px;">${m.chofer_id || '—'}</td>
    </tr>`;
  }).join('');
}

/* ── Crear micro ────────────────────────────────────────────── */
async function crearMicro(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-crear-micro');

  const rutaVal   = document.getElementById('m-ruta').value;
  const choferVal = document.getElementById('m-chofer').value;

  const body = {
    placa:     document.getElementById('m-placa').value.trim().toUpperCase(),
    capacidad: parseInt(document.getElementById('m-capacidad').value) || 30,
    ruta_id:   rutaVal   ? parseInt(rutaVal)   : null,
    chofer_id: choferVal ? parseInt(choferVal) : null,
  };

  btn.disabled = true;
  btn.textContent = 'Creando…';

  try {
    await Api.post('/micros', body);
    Toast.success('Micro creado correctamente');
    Modal.close('modal-micro');
    document.getElementById('form-micro').reset();
    init();
  } catch (e) {
    Toast.error(e.detail || 'Error al crear micro');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Crear Micro';
  }
}

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);

/* ── Utilidades ─────────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
