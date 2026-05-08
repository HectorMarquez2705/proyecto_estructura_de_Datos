(function () {
  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    const map = { pasajero: '/pasajero/mapa/', chofer: '/chofer/ruta/', admin: '/admin/usuarios/' };
    window.location.replace(map[user?.rol] || '/');
  }
})();

const errBox = document.getElementById('auth-error');
const btnReg = document.getElementById('btn-register');

function showAuthError(msg) { errBox.textContent = msg; errBox.classList.add('show'); }
function hideAuthError()    { errBox.classList.remove('show'); }

// Selector de rol
document.getElementById('role-selector').addEventListener('click', e => {
  const btn = e.target.closest('.role-btn');
  if (!btn) return;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('rol').value = btn.dataset.rol;
});

document.getElementById('register-form').addEventListener('submit', async e => {
  e.preventDefault();
  hideAuthError();

  const nombre   = document.getElementById('nombre').value.trim();
  const email    = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const telefono = document.getElementById('telefono').value.trim();
  const rol      = document.getElementById('rol').value;

  if (!nombre || !email || !email.includes('@')) { showAuthError('Completá nombre y correo válido.'); return; }
  if (password.length < 6) { showAuthError('La contraseña debe tener mínimo 6 caracteres.'); return; }

  btnReg.disabled = true;
  btnReg.textContent = 'Creando cuenta…';

  try {
    const data = await Api.post('/auth/register', { nombre, email, password, rol, telefono }, false);
    Auth.login(data.token);
    const map = { pasajero: '/pasajero/mapa/', chofer: '/chofer/ruta/', admin: '/admin/usuarios/' };
    window.location.replace(map[data.rol] || '/');
  } catch (err) {
    const msg = err.status === 409
      ? 'Ese correo ya está registrado. Intentá con otro o iniciá sesión.'
      : (err.detail || 'Error al crear la cuenta. Intentá de nuevo.');
    showAuthError(msg);
    btnReg.disabled = false;
    btnReg.textContent = 'Crear cuenta';
  }
});
