import { getToken } from './authService'

function h() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function getTarjeta(userId) {
  const res = await fetch(`/tarjeta/${userId}`, { headers: h() })
  return res.json()
}

export async function recargar(userId, monto) {
  const res = await fetch('/tarjeta/recargar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...h() },
    body: JSON.stringify({ user_id: userId, monto: parseFloat(monto) }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Error al recargar')
  return data
}

export async function cobrarPasaje(userId, rutaId) {
  const res = await fetch('/tarjeta/cobrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...h() },
    body: JSON.stringify({ user_id: userId, ruta_id: rutaId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Saldo insuficiente')
  return data
}

export async function getHistorial(userId) {
  const res = await fetch(`/tarjeta/${userId}/historial`, { headers: h() })
  if (!res.ok) return []
  return res.json()
}
