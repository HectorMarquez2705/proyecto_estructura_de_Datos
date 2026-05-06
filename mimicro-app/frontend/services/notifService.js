import { getToken } from './authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function headers() {
  const token = await getToken();
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function getNotificaciones(userId) {
  const res = await fetch(`${API}/notificaciones/${userId}`, { headers: await headers() });
  return res.json();
}

export async function marcarLeida(notifId) {
  await fetch(`${API}/notificaciones/${notifId}/leida`, {
    method: 'PATCH',
    headers: await headers(),
  });
}

export async function reportarDesvio(rutaId, descripcion) {
  const res = await fetch(`${API}/notificaciones/desvio`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({ rutaId, descripcion }),
  });
  return res.json();
}

export async function getETA(microId, paradaId) {
  const res = await fetch(`${API}/eta/${microId}/${paradaId}`, { headers: await headers() });
  return res.json();
}

export async function getETAsRuta(rutaId, paradaId) {
  const res = await fetch(`${API}/eta/ruta/${rutaId}/${paradaId}`, { headers: await headers() });
  return res.json();
}
