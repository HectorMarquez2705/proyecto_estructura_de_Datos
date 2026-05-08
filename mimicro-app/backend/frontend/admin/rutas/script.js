/* admin/rutas/script.js */
Auth.initPage('admin');

/* ── Carga inicial ──────────────────────────────────────────── */
async function cargarRutas() {
  try {
    const rutas = await Api.get('/rutas');
    renderTabla(rutas);
  } catch (e) {
    Toast.error(e.detail || 'Error al cargar rutas');
    document.getElementById('tabla-body').innerHTML =
      '<tr><td colspan="5" class="empty-state"><div class="empty-icon">⚠️</div><div>No se pudo cargar la lista</div></td></tr>';
  }
}

/* ── Renderizado de tabla ───────────────────────────────────── */
function renderTabla(rutas) {
  const tbody = document.getElementById('tabla-body');

  if (!rutas.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <div class="empty-icon">🗺️</div>
          <div class="empty-title">No hay rutas</div>
          <div class="empty-sub">Creá la primera ruta con el botón "Nueva Ruta"</div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = rutas.map(r => `
    <tr data-id="${r.id}">
      <td>
        <span style="font-weight:600;color:var(--text);">${escapeHtml(r.nombre || '—')}</span>
      </td>
      <td style="color:var(--text-2);">${escapeHtml(r.origen || '—')}</td>
      <td style="color:var(--text-2);">${escapeHtml(r.destino || '—')}</td>
      <td>
        <span class="paradas-badge">
          📍 ${r.total_paradas ?? r.paradas ?? '0'}
        </span>
      </td>
      <td>
        <button class="btn-danger-sm" onclick="eliminarRuta(${r.id}, '${escapeHtml(r.nombre || '')}')">
          🗑️ Eliminar
        </button>
      </td>
    </tr>`).join('');
}

/* ── Crear ruta ─────────────────────────────────────────────── */
async function crearRuta(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-crear-ruta');
  const body = {
    nombre:  document.getElementById('r-nombre').value.trim(),
    origen:  document.getElementById('r-origen').value.trim(),
    destino: document.getElementById('r-destino').value.trim(),
  };

  btn.disabled = true;
  btn.textContent = 'Creando…';

  try {
    await Api.post('/rutas', body);
    Toast.success('Ruta creada correctamente');
    Modal.close('modal-ruta');
    document.getElementById('form-ruta').reset();
    cargarRutas();
  } catch (e) {
    Toast.error(e.detail || 'Error al crear ruta');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Crear Ruta';
  }
}

/* ── Eliminar ruta ──────────────────────────────────────────── */
async function eliminarRuta(id, nombre) {
  if (!confirm(`¿Eliminar la ruta "${nombre}"? Esta acción no se puede deshacer.`)) return;
  try {
    await Api.del(`/rutas/${id}`);
    Toast.success('Ruta eliminada');
    cargarRutas();
  } catch (e) {
    Toast.error(e.detail || 'Error al eliminar ruta');
  }
}

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', cargarRutas);

/* ── Utilidades ─────────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
