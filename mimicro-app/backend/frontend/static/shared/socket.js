/* shared/socket.js — Cliente Socket.IO */

window.SocketService = {
  _socket: null,

  connect() {
    if (!this._socket) {
      this._socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] });
    }
    return this._socket;
  },

  /* Suscribe al mapa de una ruta. Retorna función de limpieza. */
  suscribirMapa(rutaId, onMoved, onOffline) {
    const s = this.connect();
    s.emit('join_ruta', { rutaId });
    s.on('micro_moved',   onMoved);
    s.on('micro_offline', onOffline);
    return () => {
      s.emit('leave_ruta', { rutaId });
      s.off('micro_moved',   onMoved);
      s.off('micro_offline', onOffline);
    };
  },

  emitirGPS(microId, lat, lng, velocidad) {
    this.connect().emit('gps_update', { microId, lat, lng, velocidad, timestamp: new Date().toISOString() });
  },

  detenerGPS(microId) {
    if (this._socket) this._socket.emit('gps_stop', { microId });
  },
};
