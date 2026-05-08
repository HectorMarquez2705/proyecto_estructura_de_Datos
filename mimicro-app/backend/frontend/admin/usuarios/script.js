/* admin/usuarios/script.js */
Auth.initPage('admin');

let usuarios = [];

async function cargarUsuarios() {
  try {
    usuarios = await Api.get('/auth/usuarios');
    if (!Array.isArray(usuarios)) usuarios = usuarios.usuarios || [];
    renderTabla(usuarios);
    actualizarContador(usuarios.length, usuarios.length);
  } catch (e) {
    Toast.error(e.detail || 'Error al cargar usuarios');
    document.getElementById('tabla-body').innerHTML =
      '<tr><td colspan="5" class="empty-state"><div class="empty-icon">⚠️</div><div>No se pudo cargar la lista</div></td></tr>';
  }
}

function renderTabla(lista) {
  const tbody = document.getElementById('tabla-body');
  if (!lista.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <div class="empty-icon">👤</div>
          <div class="empty-title">No hay usuarios</div>
          <div class="empty-sub">No se encontraron usuarios con ese criterio</div>
        </td>
      </tr>`;
    return;
  }
  tbody.innerHTML = lista.map(u => `
    <tr data-id="${u.id}">
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="user-avatar" style="width:32px;height:32px;font-size:13px;flex-shrink:0;">
            ${(u.nombre || '?')[0].toUpperCase()}
          </div>
          <span style="font-weight:500;">${escapeHtml(u.nombre || '—')}</span>
        </div>
      </td>
      <td style="color:var(--text-2);font-size:13px;">${escapeHtml(u.email || '—')}</td>
      <td>
        <select class="rol-select" onchange="cambiarRol(${u.id}, this.value)">
          <option value="pasajero" ${u.rol === 'pasajero' ? 'selected' : ''}>Pasajero</option>
          <option value="chofer"   ${u.rol === 'chofer'   ? 'selected' : ''}>Chofer</option>
          <option value="admin"    ${u.rol === 'admin'    ? 'selected' : ''}>Admin</option>
        </select>
      </td>
      <td style="color:var(--text-3);font-size:13px;">
        ${(u.created_at || u.fecha_registro) ? new Date(u.created_at || u.fecha_registro).toLocaleDateString('es-BO') : '—'}
      </td>
      <td>
        <span class="badge badge-${u.rol}">${u.rol}</span>
      </td>
    </tr>`).join('');
}

async function cambiarRol(id, rol) {
  try {
    await Api.patch(`/auth/usuarios/${id}/rol`, { rol });
    Toast.success('Rol actualizado correctamente');
    const idx = usuarios.findIndex(u => u.id === id);
    if (idx !== -1) usuarios[idx].rol = rol;
  } catch (e) {
    Toast.error(e.detail || 'Error al cambiar rol');
    cargarUsuarios();
  }
}

function actualizarContador(filtrados, total) {
  const el = document.getElementById('search-count');
  if (el) {
    el.textContent = filtrados === total
      ? `${total} usuario${total !== 1 ? 's' : ''}`
      : `${filtrados} de ${total}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();
  document.getElementById('search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) { renderTabla(usuarios); actualizarContador(usuarios.length, usuarios.length); return; }
    const filtrados = usuarios.filter(u =>
      (u.nombre || '').toLowerCase().includes(q) ||
      (u.email  || '').toLowerCase().includes(q)
    );
    renderTabla(filtrados);
    actualizarContador(filtrados.length, usuarios.length);
  });
});
