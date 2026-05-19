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
      bottomNav: [
        { href: '/pasajero/mapa/',      icon: svgMapa(),     label: 'Mapa'      },
        { href: '/pasajero/eta/',        icon: svgBuscar(),   label: 'Buscar'    },
        { href: '/pasajero/historial/', icon: svgHistorial(), label: 'Historial' },
        { href: '/perfil/',             icon: svgPerfil(),   label: 'Perfil'    },
      ],
    },
    chofer: {
      subtitle: 'Portal Chofer',
      roleClass: 'role-chofer',
      bottomNav: [
        { href: '/chofer/ruta/',      icon: svgRuta(),    label: 'Ruta'     },
        { href: '/chofer/ocupacion/', icon: svgOcup(),    label: 'Ocupación'},
        { href: '/chofer/desvio/',    icon: svgDesvio(),  label: 'Desvío'   },
        { href: '/perfil/',           icon: svgPerfil(),  label: 'Perfil'   },
      ],
    },
  },

  init(rol) {
    const cfg = this._config[rol];
    if (!cfg) return;

    const user    = Auth.getUser();
    const initial = (user?.nombre || '?')[0].toUpperCase();
    const nombre  = user?.nombre || 'Usuario';
    const path    = window.location.pathname;

    if (rol === 'admin') {
      this._initAdmin(cfg, user, initial, nombre, path);
    } else {
      this._initMobile(cfg, nombre, path, rol);
    }

    if (typeof _syncThemeIcon === 'function') _syncThemeIcon();
  },

  _initAdmin(cfg, user, initial, nombre, path) {
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

    const pageTitle = document.title.replace(/^miMicro\s*[—-]\s*/, '');
    const topbarHTML = `
      <header class="topbar">
        <button class="topbar-menu" onclick="document.querySelector('.sidebar').classList.toggle('open')">☰</button>
        <h1 class="topbar-title">${pageTitle}</h1>
        <span id="topbar-user" class="topbar-user">${escapeHtml(nombre)}</span>
      </header>`;

    const shell  = document.getElementById('app-shell');
    const topbar = document.getElementById('topbar-mount');
    if (shell)  shell.innerHTML  = sidebarHTML;
    if (topbar) topbar.innerHTML = topbarHTML;
  },

  _initMobile(cfg, nombre, path, rol) {
    document.body.classList.add('has-bottom-nav');

    const pageTitle = document.title.replace(/^miMicro\s*[—-]\s*/, '');

    /* Mobile topbar */
    const topbarHTML = `
      <header class="mobile-header">
        <div class="mobile-header-left">
          <span class="mobile-brand-icon">🚌</span>
          <span class="mobile-brand-name">miMicro</span>
        </div>
        <div class="mobile-header-right">
          <button class="mobile-icon-btn" onclick="toggleTheme()" title="Cambiar tema">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>
          <button class="mobile-icon-btn" onclick="Auth.logout()" title="Cerrar sesión">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>`;

    /* Bottom nav */
    const navItemsHTML = cfg.bottomNav.map(item => {
      const active = path === item.href || path.startsWith(item.href.replace(/\/$/, '') + '/') ||
                     (item.href !== '/perfil/' && path.startsWith(item.href.replace(/\/$/, '')));
      return `<a href="${item.href}" class="bottom-nav-item${active ? ' active' : ''}">
        <span class="bottom-nav-icon">${item.icon}</span>
        <span class="bottom-nav-label">${item.label}</span>
      </a>`;
    }).join('');

    const bottomNavHTML = `<nav class="bottom-nav">${navItemsHTML}</nav>`;

    const shell  = document.getElementById('app-shell');
    const topbar = document.getElementById('topbar-mount');
    if (shell)  shell.innerHTML  = bottomNavHTML;
    if (topbar) topbar.innerHTML = topbarHTML;
  },
};

/* ── SVG icons ─────────────────────────────────────────────── */
function svgMapa() {
  return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>`;
}
function svgBuscar() {
  return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>`;
}
function svgHistorial() {
  return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <polyline points="12 8 12 12 14 14"/>
    <path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 8.5 8.5 8.5"/>
  </svg>`;
}
function svgPerfil() {
  return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>`;
}
function svgRuta() {
  return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>`;
}
function svgOcup() {
  return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`;
}
function svgDesvio() {
  return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`;
}
