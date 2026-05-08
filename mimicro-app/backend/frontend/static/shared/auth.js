/* shared/auth.js — Autenticación, tema y utilidades globales */

/* ── Tema claro / oscuro ────────────────────────────────────── */
(function () {
  const saved = localStorage.getItem('mimicro_theme') || 'light';
  document.documentElement.dataset.theme = saved;
})();

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('mimicro_theme', next);
  _syncThemeIcon();
}
function _syncThemeIcon() {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.querySelectorAll('.theme-toggle, .auth-theme-btn').forEach(b => {
    b.textContent = dark ? '☀️' : '🌙';
  });
}
document.addEventListener('DOMContentLoaded', _syncThemeIcon);

/* ── Objeto Auth global ─────────────────────────────────────── */
window.Auth = {
  TOKEN_KEY: 'mimicro_token',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch { return null; }
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  login(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    window.location.href = '/login/';
  },

  requireAuth(rolRequerido) {
    if (!this.isLoggedIn()) {
      window.location.href = '/login/';
      return false;
    }
    const user = this.getUser();
    if (rolRequerido && user.rol !== rolRequerido) {
      const map = { pasajero: '/pasajero/mapa/', chofer: '/chofer/ruta/', admin: '/admin/usuarios/' };
      window.location.href = map[user.rol] || '/login/';
      return false;
    }
    return true;
  },

  populateSidebar() {
    const user = this.getUser();
    if (!user) return;
    const initial = (user.nombre || user.sub || '?')[0].toUpperCase();
    const el = {
      avatar: document.getElementById('user-avatar'),
      name:   document.getElementById('user-name'),
      tuser:  document.getElementById('topbar-user'),
    };
    if (el.avatar) el.avatar.textContent = initial;
    if (el.name)   el.name.textContent   = user.nombre || 'Usuario';
    if (el.tuser)  el.tuser.textContent  = user.nombre || '';
  },

  markActiveLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.sidebar-link').forEach(a => {
      const href = a.getAttribute('href');
      if (href && path.startsWith(href.replace(/\/$/, ''))) {
        a.classList.add('active');
      }
    });
  },

  initPage(rolRequerido) {
    if (!this.requireAuth(rolRequerido)) return false;
    document.addEventListener('DOMContentLoaded', () => {
      if (window.Layout) {
        Layout.init(rolRequerido);
      } else {
        this.populateSidebar();
        this.markActiveLink();
      }
      _syncThemeIcon();
    });
    return true;
  }
};

/* ── escapeHtml global ──────────────────────────────────────── */
window.escapeHtml = function(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/* ── Toast global ───────────────────────────────────────────── */
window.Toast = {
  show(msg, type = 'info', duration = 5000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span class="toast-msg">${msg}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
    container.appendChild(t);
    if (duration > 0) setTimeout(() => t.remove(), duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg)    { this.show(msg, 'info'); },
};

/* ── Modal helper ───────────────────────────────────────────── */
window.Modal = {
  open(id)  { document.getElementById(id)?.classList.add('open'); },
  close(id) { document.getElementById(id)?.classList.remove('open'); },
  toggle(id){ document.getElementById(id)?.classList.toggle('open'); },
};

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});
