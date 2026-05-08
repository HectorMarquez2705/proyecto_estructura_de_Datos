/* shared/layout.js — Inyección dinámica de sidebar y topbar */

window.Layout = {
  _config: {
    admin: {
      subtitle: 'Panel Admin',
      roleClass: 'role-admin',
      links: [
        { href: '/admin/usuarios/',  icon: '👤', label: 'Usuarios' },
        { href: '/admin/lineas/',    icon: '🚌', label: 'Líneas de Micro' },
        { href: '/admin/reportes/', icon: '📊', label: 'Reportes' },
      ],
    },
    pasajero: {
      subtitle: 'Portal Pasajero',
      roleClass: 'role-pasajero',
      links: [
        { href: '/pasajero/mapa/',            icon: '🗺️', label: 'Mapa en Vivo' },
        { href: '/pasajero/eta/',             icon: '⏱️', label: 'Tiempo de Llegada' },
        { href: '/pasajero/tarjeta/',         icon: '💳', label: 'Mi Tarjeta' },
        { href: '/pasajero/historial/',       icon: '📋', label: 'Historial' },
        { href: '/pasajero/notificaciones/',  icon: '🔔', label: 'Notificaciones' },
      ],
    },
    chofer: {
      subtitle: 'Portal Chofer',
      roleClass: 'role-chofer',
      links: [
        { href: '/chofer/ruta/',      icon: '🚌', label: 'Ruta Activa' },
        { href: '/chofer/ocupacion/', icon: '👥', label: 'Ocupación' },
        { href: '/chofer/desvio/',    icon: '⚠️', label: 'Reportar Desvío' },
      ],
    },
  },

  init(rol) {
    const cfg  = this._config[rol];
    if (!cfg) return;

    const user    = Auth.getUser();
    const initial = (user?.nombre || '?')[0].toUpperCase();
    const nombre  = user?.nombre || 'Usuario';
    const path    = window.location.pathname;

    /* ── Sidebar ── */
    const linksHTML = cfg.links.map(l => {
      const active = path.startsWith(l.href.replace(/\/$/, ''));
      return `<a href="${l.href}" class="sidebar-link${active ? ' active' : ''}">
        <span class="sidebar-icon">${l.icon}</span>${l.label}
      </a>`;
    }).join('');

    const sidebarHTML = `
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="sidebar-logo">🚌</span>
          <span class="sidebar-title">miMicro</span>
        </div>
        <div class="sidebar-subtitle">${cfg.subtitle}</div>
        <nav class="sidebar-nav">${linksHTML}</nav>
        <div class="sidebar-footer">
          <a href="/perfil/" class="sidebar-footer-user sidebar-footer-user--link">
            <div id="user-avatar" class="user-avatar">${initial}</div>
            <div id="user-name" class="user-name-text">${escapeHtml(nombre)}</div>
            <span class="perfil-arrow">›</span>
          </a>
          <div class="sidebar-footer-actions">
            <button class="theme-toggle" onclick="toggleTheme()" title="Cambiar tema">🌙</button>
            <button class="btn btn-sm btn-ghost" style="flex:1" onclick="Auth.logout()">Cerrar sesión</button>
          </div>
        </div>
      </aside>`;

    /* ── Topbar ── */
    const pageTitle = document.title.replace(/^miMicro\s*[—-]\s*/, '');
    const topbarHTML = `
      <header class="topbar">
        <button class="topbar-menu" onclick="document.querySelector('.sidebar').classList.toggle('open')">☰</button>
        <h1 class="topbar-title">${pageTitle}</h1>
        <span id="topbar-user" class="topbar-user">${escapeHtml(nombre)}</span>
      </header>`;

    /* ── Inyección ── */
    const shell  = document.getElementById('app-shell');
    const topbar = document.getElementById('topbar-mount');
    if (shell)  shell.innerHTML  = sidebarHTML;
    if (topbar) topbar.innerHTML = topbarHTML;

    /* Sincronizar icono de tema tras inyección */
    if (typeof _syncThemeIcon === 'function') _syncThemeIcon();
  },
};
