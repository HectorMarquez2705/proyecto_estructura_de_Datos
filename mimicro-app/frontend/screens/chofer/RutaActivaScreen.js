import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { emitirGPS, detenerGPS } from '../../services/gpsService';
import { getToken } from '../../services/authService';
import MapaInteractivo from '../../components/MapaInteractivo';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function RutaActivaScreen() {
  const [activa,       setActiva]       = useState(false);
  const [posicion,     setPosicion]     = useState(null);
  const [microId,      setMicroId]      = useState(null);
  const [paradas,      setParadas]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const suscripcionRef = useRef(null);

  async function cargarDatosMicro() {
    const token  = await getToken();
    const userId = parseInt(JSON.parse(atob(token.split('.')[1])).sub);
    const res    = await fetch(`${API}/micros`, { headers: { Authorization: `Bearer ${token}` } });
    const micros = await res.json();
    const miMicro = micros.find(m => m.chofer_id === userId);
    if (!miMicro) throw new Error('No tienes un micro asignado');
    const resP = await fetch(`${API}/rutas/${miMicro.ruta_id}/paradas`,
      { headers: { Authorization: `Bearer ${token}` } });
    setParadas(await resP.json());
    return miMicro.id;
  }

  async function iniciarRuta() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicacion para iniciar la ruta');
        return;
      }
      const mid = await cargarDatosMicro();
      setMicroId(mid);

      await fetch(`${API}/micros/${mid}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` },
        body: JSON.stringify({ estado: 'activo' }),
      });

      suscripcionRef.current = await Location.watchPositionAsync(
        { timeInterval: 4000, distanceInterval: 10 },
        (loc) => {
          const { latitude: lat, longitude: lng } = loc.coords;
          setPosicion({ lat, lng });
          emitirGPS(mid, lat, lng, loc.coords.speed || 0);
        }
      );
      setActiva(true);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function finalizarRuta() {
    if (suscripcionRef.current) {
      suscripcionRef.current.remove();
      suscripcionRef.current = null;
    }
    if (microId) {
      detenerGPS(microId);
      await fetch(`${API}/micros/${microId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` },
        body: JSON.stringify({ estado: 'inactivo' }),
      });
    }
    setActiva(false); setPosicion(null); setMicroId(null);
  }

  return (
    <View style={s.container}>
      <View style={s.mapa}>
        <MapaInteractivo
          paradas={paradas}
          marcadores={posicion ? [{ ...posicion, microId }] : []}
          centroInicial={{ lat: -17.7833, lng: -63.1822 }}
        />
      </View>

      <View style={s.panel}>
        {activa && (
          <View style={s.gpsIndicator}>
            <View style={s.gpsDot} />
            <Text style={s.gpsText}>GPS activo · {posicion ? `${posicion.lat.toFixed(5)}, ${posicion.lng.toFixed(5)}` : 'esperando...'}</Text>
          </View>
        )}

        {loading
          ? <ActivityIndicator color="#2E7D32" size="large" />
          : activa
          ? <TouchableOpacity style={[s.btn, s.btnRojo]} onPress={finalizarRuta}>
              <Text style={s.btnText}>⏹ Finalizar ruta</Text>
            </TouchableOpacity>
          : <TouchableOpacity style={[s.btn, s.btnVerde]} onPress={iniciarRuta}>
              <Text style={s.btnText}>▶ Iniciar ruta</Text>
            </TouchableOpacity>
        }
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1 },
  mapa:         { flex: 1 },
  panel:        { backgroundColor: '#fff', padding: 20, elevation: 8 },
  gpsIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  gpsDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', marginRight: 8 },
  gpsText:      { color: '#555', fontSize: 12 },
  btn:          { borderRadius: 12, padding: 18, alignItems: 'center' },
  btnVerde:     { backgroundColor: '#2E7D32' },
  btnRojo:      { backgroundColor: '#C62828' },
  btnText:      { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
