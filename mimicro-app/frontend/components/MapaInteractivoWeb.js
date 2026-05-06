import React, { useEffect } from 'react';

let MapContainer, TileLayer, Marker, Popup, useMap;

// Importacion condicional para que no falle en entorno nativo
if (typeof window !== 'undefined') {
  const RL = require('react-leaflet');
  MapContainer = RL.MapContainer;
  TileLayer    = RL.TileLayer;
  Marker       = RL.Marker;
  Popup        = RL.Popup;

  // Corregir icono por defecto de Leaflet en bundlers
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl:       require('leaflet/dist/images/marker-icon.png'),
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
  });
}

export default function MapaInteractivoWeb({ paradas = [], marcadores = [], centroInicial }) {
  const centro = centroInicial || { lat: -17.7833, lng: -63.1822 };

  if (typeof window === 'undefined' || !MapContainer) {
    return <div style={{ flex: 1, background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span>Cargando mapa...</span>
    </div>;
  }

  return (
    <MapContainer
      center={[centro.lat, centro.lng]}
      zoom={13}
      style={{ height: '100%', width: '100%', minHeight: 400 }}
    >
      {/* OpenStreetMap — gratuito, sin API key */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Paradas */}
      {paradas.map(p => (
        <Marker key={p.id} position={[parseFloat(p.lat), parseFloat(p.lng)]}>
          <Popup>{p.nombre}</Popup>
        </Marker>
      ))}

      {/* Micros en movimiento */}
      {marcadores.map(m => (
        <Marker key={m.microId} position={[m.lat, m.lng]}>
          <Popup>🚌 Micro #{m.microId}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
