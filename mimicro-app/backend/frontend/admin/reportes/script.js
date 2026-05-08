/* admin/reportes/script.js */
Auth.initPage('admin');

async function cargarReportes() {
  ['stat-usuarios', 'stat-rutas', 'stat-micros', 'stat-activos'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '…';
  });

  try {
    const [usuarios, rutas, micros, logs] = await Promise.all([
      Api.get('/auth/usuarios'),
      Api.get('/rutas'),
      Api.get('/micros'),
      Api.get('/auth/logs?limite=50'),
    ]);

    const usuariosList = Array.isArray(usuarios) ? usuarios : (usuarios.usuarios || []);
    const logsList     = Array.isArray(logs)     ? logs     : (logs.logs || []);

    document.getElementById('stat-usuarios').textContent = usuariosList.length;
    document.getElementById('stat-rutas').textContent    = (Array.isArray(rutas) ? rutas : []).length;
    document.getElementById('stat-micros').textContent   = (Array.isArray(micros) ? micros : []).length;
    document.getElementById('stat-activos').textContent  =
      (Array.isArray(micros) ? micros : []).filter(m => m.estado === 'activo').length;

    renderLogs(logsList);
  } catch (e) {
    Toast.error(e.detail || 'Error al cargar reportes');
    ['stat-usuarios', 'stat-rutas', 'stat-micros', 'stat-activos'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.textContent === '…') el.textContent = '—';
    });
  }
}

function renderLogs(logs) {
  const tbody = document.getElementById('log-body');
  if (!logs || !logs.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-title">Sin registros</div>
          <div class="empty-sub">No hay entradas en el log de seguridad</div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = logs.map(l => {
    const evento     = l.evento || l.accion || '—';
    const esFallo    = evento.includes('FAIL') || evento.includes('ERROR') || evento.includes('DENIED');
    const esWarning  = evento.includes('WARN') || evento.includes('CAMBIO') || evento.includes('UPDATE');
    const badgeClass = esFallo ? 'danger' : esWarning ? 'warning' : 'success';

    const quien = escapeHtml(l.usuario || l.email || l.ip || '—');
    const fecha = (l.timestamp || l.fecha)
      ? new Date(l.timestamp || l.fecha).toLocaleString('es-BO', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        })
      : '—';

    return `
    <tr>
      <td><span class="badge badge-${badgeClass}">${escapeHtml(evento)}</span></td>
      <td style="font-size:13px;color:var(--text-2);">${quien}</td>
      <td style="font-size:13px;color:var(--text-3);">${fecha}</td>
    </tr>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', cargarReportes);
