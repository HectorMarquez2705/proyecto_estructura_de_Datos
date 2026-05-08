Auth.initPage('chofer');

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getUser();
  const sel  = document.getElementById('sel-ruta');

  try {
    const rutas = await Api.get('/rutas');
    sel.innerHTML = '<option value="">Seleccioná una ruta</option>';
    rutas.forEach(r => {
      const o = document.createElement('option');
      o.value = r.id; o.textContent = r.nombre;
      sel.appendChild(o);
    });

    // Pre-seleccionar la ruta del chofer
    const micros = await Api.get('/micros');
    const micro  = micros.find(m => m.chofer_id == user.sub);
    if (micro?.ruta_id) sel.value = micro.ruta_id;
  } catch { Toast.error('Error al cargar las rutas.'); }
});

document.getElementById('desvio-form').addEventListener('submit', async e => {
  e.preventDefault();
  const ruta_id     = document.getElementById('sel-ruta').value;
  const descripcion = document.getElementById('descripcion').value.trim();

  if (!ruta_id)     { Toast.warning('Seleccioná una ruta.'); return; }
  if (!descripcion) { Toast.warning('Escribí una descripción del desvío.'); return; }

  const btn = document.getElementById('btn-enviar');
  btn.disabled = true; btn.textContent = '📡 Enviando alerta…';

  try {
    await Api.post('/notificaciones/desvio', { ruta_id: parseInt(ruta_id), descripcion });
    document.getElementById('success-msg').style.display = 'block';
    document.getElementById('descripcion').value = '';
    Toast.success('✅ Alerta enviada a todos los pasajeros de la ruta');
    setTimeout(() => { document.getElementById('success-msg').style.display = 'none'; }, 5000);
  } catch (err) {
    Toast.error(err.detail || 'No se pudo enviar la alerta.');
  } finally {
    btn.disabled = false; btn.textContent = '🚨 Enviar alerta a pasajeros';
  }
});
