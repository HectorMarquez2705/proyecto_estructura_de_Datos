import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';

export default function MapaInteractivoNativo({ paradas = [], marcadores = [], centroInicial }) {
  const centro = centroInicial || { lat: -17.7833, lng: -63.1822 };

  return (
    <MapView
      style={s.mapa}
      initialRegion={{
        latitude:      centro.lat,
        longitude:     centro.lng,
        latitudeDelta:  0.05,
        longitudeDelta: 0.05,
      }}
      mapType="none"
    >
      {/* OpenStreetMap tiles — gratuito, sin API key */}
      <UrlTile
        urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
        flipY={false}
      />

      {/* Paradas */}
      {paradas.map(p => (
        <Marker key={p.id}
          coordinate={{ latitude: parseFloat(p.lat), longitude: parseFloat(p.lng) }}
          title={p.nombre}
          pinColor="#1565C0"
        />
      ))}

      {/* Micros en movimiento */}
      {marcadores.map(m => (
        <Marker key={m.microId}
          coordinate={{ latitude: m.lat, longitude: m.lng }}
          title={`Micro #${m.microId}`}
          pinColor="#FFA000"
        />
      ))}
    </MapView>
  );
}

const s = StyleSheet.create({ mapa: { flex: 1 } });
