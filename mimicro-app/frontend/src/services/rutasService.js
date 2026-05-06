import { getToken } from './authService'

function h() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function getRutas() {
  const res = await fetch('/rutas', { headers: h() })
  return res.json()
}

export async function getParadas(rutaId) {
  const res = await fetch(`/rutas/${rutaId}/paradas`, { headers: h() })
  return res.json()
}

export async function crearRuta(data) {
  const res = await fetch('/rutas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...h() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'Error al crear ruta')
  return json
}

export async function eliminarRuta(id) {
  const res = await fetch(`/rutas/${id}`, { method: 'DELETE', headers: h() })
  if (!res.ok) throw new Error('Error al eliminar ruta')
}
