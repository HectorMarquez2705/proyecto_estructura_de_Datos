import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const iconMicro = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

export default function MapaInteractivo({ paradas = [], marcadores = [], centroInicial }) {
  const centro = centroInicial || { lat: -17.7833, lng: -63.1822 }

  return (
    <MapContainer
      center={[centro.lat, centro.lng]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {paradas.map(p => (
        <Marker key={p.id} position={[parseFloat(p.lat), parseFloat(p.lng)]}>
          <Popup>{p.nombre}</Popup>
        </Marker>
      ))}

      {marcadores.map(m => (
        <Marker key={m.microId} position={[m.lat, m.lng]} icon={iconMicro}>
          <Popup>🚌 Micro #{m.microId}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
