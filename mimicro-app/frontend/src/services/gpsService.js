import { io } from 'socket.io-client'

let _socket = null

function getSocket() {
  if (!_socket) {
    _socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] })
  }
  return _socket
}

export function suscribirMapa(rutaId, onMoved, onOffline) {
  const s = getSocket()
  s.connect()
  s.emit('join_ruta', { rutaId })
  s.on('micro_moved',   onMoved)
  s.on('micro_offline', onOffline)
  return () => {
    s.emit('leave_ruta', { rutaId })
    s.off('micro_moved',   onMoved)
    s.off('micro_offline', onOffline)
  }
}

export function emitirGPS(microId, lat, lng, velocidad = 0) {
  getSocket().emit('gps_update', { microId, lat, lng, velocidad, timestamp: Date.now() })
}

export function detenerGPS(microId) {
  getSocket().emit('gps_stop', { microId })
}
