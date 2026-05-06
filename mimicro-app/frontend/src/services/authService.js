export function getToken() {
  return localStorage.getItem('mimicro_token')
}

export async function login(email, password) {
  const res  = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Credenciales inválidas')
  localStorage.setItem('mimicro_token', data.token)
  return data
}

export async function register(nombre, email, password, rol, telefono = '') {
  const res  = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password, rol, telefono }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Error al registrarse')
  localStorage.setItem('mimicro_token', data.token)
  return data
}

export function logout() {
  localStorage.removeItem('mimicro_token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getUsuarios() {
  const res = await fetch('/auth/usuarios', { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail)
  return data.usuarios
}

export async function cambiarRol(userId, rol) {
  const res = await fetch(`/auth/usuarios/${userId}/rol`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ rol }),
  })
  if (!res.ok) throw new Error('Error al cambiar rol')
  return res.json()
}

export async function getLogs(limite = 100) {
  const res = await fetch(`/auth/logs?limite=${limite}`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail)
  return data.logs
}
