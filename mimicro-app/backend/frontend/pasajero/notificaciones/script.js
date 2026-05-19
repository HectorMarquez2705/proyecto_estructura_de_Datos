Auth.initPage('pasajero');

let userId, notifData = [], filtroActivo = 'todas';

document.addEventListener('DOMContentLoaded', async () => {
  userId = Auth.getUser().sub;
  cargarNotificaciones();
});

async function cargarNotificaciones() {
  const list = document.getElementById('notif-list');
  try {
    notifData = await Api.get(`/notificaciones/${userId}`);
    renderNotificaciones();
  } catch {
    Toast.error('No se pudieron cargar las notificaciones.');
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Error al cargar</div></div>`;
  }
}

function filtrar(tipo, btn) {
  filtroActivo = tipo;
  document.querySelectorAll('.notif-tab').forEach(b => b.classList.toggle('active', b === btn));
  renderNotificaciones();
}

function renderNotificaciones() {
  const list     = document.getElementById('notif-list');
  const badge    = document.getElementById('badge-noLeidas');
  const btnTodas = document.getElementById('btn-todas');
  const noLeidas = notifData.filter(n => !n.leida).length;
  const visible  = filtroActivo === 'todas' ? notifData : notifData.filter(n => (n.tipo || 'info') === filtroActivo);

  if (noLeidas > 0) {
    badge.textContent = noLeidas;
    badge.style.display = 'inline-flex';
    btnTodas.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
    btnTodas.style.display = 'none';
  }

  if (!visible || visible.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔔</div>
      <div class="empty-title">Sin notificaciones</div>
      <div class="empty-sub">Aquí aparecerán las alertas de desvíos, retrasos y comunicados del sistema</div>
    </div>`;
    return;
  }

  const tipoIcon  = { desvio: '🚨', retraso: '⚠️', info: 'ℹ️', sistema: '🔧' };
  const tipoLabel = { desvio: 'Desvío', retraso: 'Retraso', info: 'Info', sistema: 'Sistema' };

  list.innerHTML = `<div class="notif-list">${visible.map((n, i) => {
    const tipo  = n.tipo || 'info';
    const fecha = new Date(n.created_at || Date.now()).toLocaleString('es-BO', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    const badge = `<span class="badge ${tipo==='desvio'?'badge-red':tipo==='retraso'?'badge-amber':'badge-blue'}">${tipoLabel[tipo]||tipo}</span>`;
    return `<div class="notif-item ${n.leida?'':'unread'} tipo-${tipo}" style="animation-delay:${i*0.05}s" data-id="${n.id}" onclick="marcarLeida(${n.id}, this)">
      <div class="notif-icon">${tipoIcon[tipo]||'ℹ️'}</div>
      <div class="notif-body">
        <div class="notif-msg">${n.mensaje}</div>
        <div class="notif-time">${badge} · ${fecha}</div>
      </div>
      ${!n.leida ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--blue);flex-shrink:0;margin-top:6px;"></div>' : ''}
    </div>`;
  }).join('')}</div>`;
}

async function marcarLeida(id, el) {
  if (!el.classList.contains('unread')) return;
  try {
    await Api.patch(`/notificaciones/${id}/leida`, {});
    el.classList.remove('unread');
    el.querySelector('[style*="border-radius:50%"]')?.remove();
    const n = notifData.find(x => x.id === id);
    if (n) n.leida = true;
    const noLeidas = notifData.filter(x => !x.leida).length;
    const badge = document.getElementById('badge-noLeidas');
    const btn   = document.getElementById('btn-todas');
    if (noLeidas === 0) { badge.style.display='none'; btn.style.display='none'; }
    else { badge.textContent = noLeidas; }
  } catch { Toast.error('No se pudo marcar como leída.'); }
}

async function marcarTodas() {
  try {
    await Api.patch(`/notificaciones/todas/${userId}/leidas`, {});
    notifData.forEach(n => n.leida = true);
    renderNotificaciones();
    Toast.success('Todas las notificaciones marcadas como leídas');
  } catch { Toast.error('No se pudo completar la acción.'); }
}
