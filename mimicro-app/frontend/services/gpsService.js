import { io } from 'socket.io-client';
import { getToken } from './authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let _socket = null;

export function getSocket() {
  if (!_socket) {
    _socket = io(API, { transports: ['websocket'], autoConnect: false });
  }
  return _socket;
}

export function suscribirMapa(rutaId, onMoved, onOffline) {
  const socket = getSocket();
  socket.connect();
  socket.emit('join_ruta', { rutaId });
  socket.on('micro_moved',   onMoved);
  socket.on('micro_offline', onOffline);
  return () => {
    socket.emit('leave_ruta', { rutaId });
    socket.off('micro_moved',   onMoved);
    socket.off('micro_offline', onOffline);
  };
}

export async function emitirGPS(microId, lat, lng, velocidad = 0) {
  const socket = getSocket();
  socket.connect();
  socket.emit('gps_update', { microId, lat, lng, velocidad, timestamp: Date.now() });
}

export function detenerGPS(microId) {
  const socket = getSocket();
  socket.emit('gps_stop', { microId });
}

export async function getPosicionesActivas() {
  const token = await getToken();
  const res = await fetch(`${API}/gps/activos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
