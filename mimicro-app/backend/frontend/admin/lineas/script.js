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
    <div class="linea-card" onclick="irADetalle(${l.id})">
      <div class="linea-card-header">
        <span class="linea-numero">Línea ${escapeHtml(l.nombre)}</span>
        <div class="linea-card-actions">
          <span class="badge badge-blue">${l.total_micros ?? 0} micros</span>
          <button class="btn btn-sm btn-ghost linea-btn-del" title="Eliminar línea"
                  onclick="event.stopPropagation(); eliminarLinea(${l.id}, ${JSON.stringify(l.nombre)})">
            🗑
          </button>
        </div>
      </div>
      <p class="linea-desc">${escapeHtml(l.descripcion || 'Sin descripción')}</p>
      <div class="linea-meta">
        <span class="linea-meta-item">📍 ${puntosRuta} punto${puntosRuta !== 1 ? 's' : ''} de ruta</span>
        <span class="linea-meta-arrow">›</span>
      </div>
    </div>`;
  }).join('');
}

function irADetalle(id) {
  window.location.href = `/admin/lineas/detalle/?id=${id}`;
}

async function eliminarLinea(id, nombre) {
  if (!confirm(`¿Eliminar la línea "${nombre}"?\n\nLos micros asignados quedarán sin línea. Las paradas serán eliminadas.`)) return;
  try {
    await Api.del(`/lineas/${id}`);
    Toast.success(`Línea "${nombre}" eliminada`);
    init();
  } catch (e) {
    Toast.error(e.detail || 'Error al eliminar la línea');
  }
}

document.addEventListener('DOMContentLoaded', init);
