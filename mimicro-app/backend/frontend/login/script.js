// Si ya hay sesión, redirigir
(function () {
  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    const map = { pasajero: '/pasajero/mapa/', chofer: '/chofer/ruta/', admin: '/admin/usuarios/' };
    window.location.replace(map[user?.rol] || '/login/');
  }
})();

const form    = document.getElementById('login-form');
const btnLogin= document.getElementById('btn-login');
const errBox  = document.getElementById('auth-error');

function showAuthError(msg) {
  errBox.textContent = msg;
  errBox.classList.add('show');
}
function hideAuthError() {
  errBox.classList.remove('show');
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  hideAuthError();

  const email    = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  // Validaciones básicas
  let ok = true;
  if (!email || !email.includes('@')) {
    document.getElementById('err-email').classList.add('show'); ok = false;
  } else {
    document.getElementById('err-email').classList.remove('show');
  }
  if (!password) {
    document.getElementById('err-password').classList.add('show'); ok = false;
  } else {
    document.getElementById('err-password').classList.remove('show');
  }
  if (!ok) return;

  btnLogin.disabled = true;
  btnLogin.textContent = 'Iniciando sesión…';

  try {
    const data = await Api.post('/auth/login', { email, password }, false);
    Auth.login(data.token);
    const map = { pasajero: '/pasajero/mapa/', chofer: '/chofer/ruta/', admin: '/admin/usuarios/' };
    window.location.replace(map[data.rol] || '/');
  } catch (err) {
    showAuthError(err.detail || 'Credenciales incorrectas. Verificá tu email y contraseña.');
    btnLogin.disabled = false;
    btnLogin.textContent = 'Iniciar sesión';
  }
});

document.addEventListener('DOMContentLoaded', () => { _syncThemeIcon && _syncThemeIcon(); });
