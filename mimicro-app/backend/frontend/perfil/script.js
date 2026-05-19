/* perfil/script.js */
Auth.initPage(null); // acepta cualquier rol autenticado

let fotoSeleccionada = null;

/* ── Carga de datos del perfil ───────────────────────────── */
async function cargarPerfil() {
  try {
    const perfil = await Api.get('/auth/perfil');
    const rolLabels = { admin: 'Administrador', pasajero: 'Pasajero', chofer: 'Chofer' };

    // Cabecera
    document.getElementById('perfil-nombre').textContent    = perfil.nombre || '—';
    document.getElementById('perfil-rol-badge').textContent = rolLabels[perfil.rol] || perfil.rol;
    const emailEl = document.getElementById('perfil-email');
    if (emailEl) emailEl.textContent = perfil.email || '';

    // Info personal
    document.getElementById('info-nombre').textContent   = escapeHtml(perfil.nombre   || '—');
    document.getElementById('info-email').textContent    = escapeHtml(perfil.email    || '—');
    document.getElementById('info-telefono').textContent = perfil.telefono ? escapeHtml(perfil.telefono) : 'No registrado';
    document.getElementById('info-rol').textContent      = rolLabels[perfil.rol] || perfil.rol;
    document.getElementById('info-fecha').textContent    = perfil.created_at
      ? new Date(perfil.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })
      : '—';

    // Avatar
    const avatarEl = document.getElementById('perfil-avatar');
    if (perfil.foto_url) {
      avatarEl.innerHTML = `<img src="${perfil.foto_url}?v=${Date.now()}" alt="Foto de perfil">`;
      document.getElementById('foto-preview').classList.add('has-image');
      document.getElementById('foto-preview').innerHTML =
        `<img src="${perfil.foto_url}?v=${Date.now()}" alt="Foto actual">`;
    } else {
      avatarEl.textContent = (perfil.nombre || '?')[0].toUpperCase();
    }
  } catch (e) {
    Toast.error(e.detail || 'Error al cargar el perfil');
  }
}

/* ── Preview de foto seleccionada ────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  cargarPerfil();

  document.getElementById('foto-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      Toast.error('Solo se permiten imágenes JPG, PNG o WebP');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Toast.error('La imagen no puede superar 5 MB');
      e.target.value = '';
      return;
    }

    fotoSeleccionada = file;
    const reader = new FileReader();
    reader.onload = ev => {
      const preview = document.getElementById('foto-preview');
      preview.classList.add('has-image');
      preview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
      document.getElementById('btn-subir-foto').style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
});

/* ── Subir foto ──────────────────────────────────────────── */
async function subirFoto() {
  if (!fotoSeleccionada) return;
  const btn = document.getElementById('btn-subir-foto');
  btn.disabled = true;
  btn.textContent = 'Subiendo…';

  try {
    const formData = new FormData();
    formData.append('file', fotoSeleccionada);

    const token = Auth.getToken();
    const res = await fetch('/auth/foto', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error al subir la foto' }));
      throw { detail: err.detail };
    }

    const data = await res.json();
    Toast.success('Foto actualizada correctamente');

    // Actualizar avatar en la página
    const avatarEl = document.getElementById('perfil-avatar');
    avatarEl.innerHTML = `<img src="${data.foto_url}?v=${Date.now()}" alt="Foto de perfil">`;

    // Actualizar avatar en el sidebar
    const sidebarAvatar = document.getElementById('user-avatar');
    if (sidebarAvatar) {
      sidebarAvatar.innerHTML = `<img src="${data.foto_url}?v=${Date.now()}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    }

    fotoSeleccionada = null;
    btn.style.display = 'none';
    document.getElementById('foto-input').value = '';
  } catch (e) {
    Toast.error(e.detail || 'Error al subir la foto');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Subir foto';
  }
}

/* ── Cambiar contraseña ──────────────────────────────────── */
async function cambiarPassword(e) {
  e.preventDefault();
  const errorEl = document.getElementById('pwd-error');
  errorEl.style.display = 'none';

  const body = {
    password_actual:    document.getElementById('pwd-actual').value,
    password_nueva:     document.getElementById('pwd-nueva').value,
    password_confirmar: document.getElementById('pwd-confirmar').value,
  };

  if (body.password_nueva !== body.password_confirmar) {
    errorEl.textContent = 'Las contraseñas nuevas no coinciden';
    errorEl.style.display = 'block';
    return;
  }
  if (body.password_nueva.length < 6) {
    errorEl.textContent = 'La nueva contraseña debe tener al menos 6 caracteres';
    errorEl.style.display = 'block';
    return;
  }

  const btn = document.getElementById('btn-cambiar-pwd');
  btn.disabled = true;
  btn.textContent = 'Actualizando…';

  try {
    await Api.patch('/auth/cambiar-password', body);
    Toast.success('Contraseña actualizada correctamente');
    document.getElementById('form-password').reset();
    errorEl.style.display = 'none';
  } catch (err) {
    errorEl.textContent = err.detail || 'Error al cambiar la contraseña';
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Actualizar contraseña';
  }
}

/* ── Toggle visibilidad contraseña ──────────────────────── */
function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}
