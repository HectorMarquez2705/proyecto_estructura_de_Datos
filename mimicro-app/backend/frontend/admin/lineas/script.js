/* admin/lineas/script.js */
Auth.initPage('admin');

async function init() {
  try {
    const lineas = await Api.get('/lineas');
    renderLineas(lineas);
  } catch (e) {
    Toast.error(e.detail || 'Error al cargar líneas');
    document.getElementById('lineas-grid').innerHTML = '';
    document.getElementById('empty-state').style.display = 'flex';
  }
}

function renderLineas(lineas) {
  const grid  = document.getElementById('lineas-grid');
  const empty = document.getElementById('empty-state');

  if (!lineas.length) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = lineas.map(l => {
    const puntosRuta = Array.isArray(l.ruta_path) ? l.ruta_path.length : 0;
    return `
    <a href="/admin/lineas/detalle/?id=${l.id}" class="linea-card">
      <div class="linea-card-header">
        <span class="linea-numero">Línea ${escapeHtml(l.nombre)}</span>
        <span class="badge badge-blue">${l.total_micros ?? 0} micros</span>
      </div>
      <p class="linea-desc">${escapeHtml(l.descripcion || 'Sin descripción')}</p>
      <div class="linea-meta">
        <span class="linea-meta-item">📍 ${puntosRuta} punto${puntosRuta !== 1 ? 's' : ''} de ruta</span>
        <span class="linea-meta-arrow">›</span>
      </div>
    </a>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', init);
