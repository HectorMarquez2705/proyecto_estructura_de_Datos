import { getToken } from './authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function headers() {
  const token = await getToken();
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function getRutas() {
  const res = await fetch(`${API}/rutas`, { headers: await headers() });
  return res.json();
}

export async function getParadas(rutaId) {
  const res = await fetch(`${API}/rutas/${rutaId}/paradas`, { headers: await headers() });
  return res.json();
}

export async function getRutaOptima(rutaId, origen, destino) {
  const res = await fetch(
    `${API}/rutas/${rutaId}/optima?origen=${origen}&destino=${destino}`,
    { headers: await headers() }
  );
  return res.json();
}
