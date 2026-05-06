import { getToken } from './authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function headers() {
  const token = await getToken();
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function getSaldo(userId) {
  const res = await fetch(`${API}/tarjeta/${userId}`, { headers: await headers() });
  if (!res.ok) throw new Error('Error al obtener tarjeta');
  return res.json();
}

export async function recargar(monto) {
  const res = await fetch(`${API}/tarjeta/recargar`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({ monto }),
  });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.detail || 'Error al recargar');
  }
  return res.json();
}
