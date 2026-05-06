import { getToken } from './authService'

function h() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function getNotificaciones(userId) {
  const res = await fetch(`/notificaciones/${userId}`, { headers: h() })
  if (!res.ok) return []
  return res.json()
}

export async function marcarLeida(id) {
  await fetch(`/notificaciones/${id}/leida`, { method: 'PATCH', headers: h() })
}

export async function marcarTodasLeidas(userId) {
  await fetch(`/notificaciones/${userId}/todas`, { method: 'PATCH', headers: h() })
}

export async function reportarDesvio(rutaId, descripcion) {
  const res = await fetch('/notificaciones/desvio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...h() },
    body: JSON.stringify({ ruta_id: rutaId, descripcion }),
  })
  if (!res.ok) throw new Error('Error al reportar desvío')
  return res.json()
}

export async function getMicros() {
  const res = await fetch('/micros', { headers: h() })
  return res.json()
}

export async function crearMicro(data) {
  const res = await fetch('/micros', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...h() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail || 'Error al crear micro')
  return json
}

export async function getETARuta(rutaId, paradaId) {
  const res = await fetch(`/eta/ruta/${rutaId}/${paradaId}`, { headers: h() })
  if (!res.ok) return []
  return res.json()
}
