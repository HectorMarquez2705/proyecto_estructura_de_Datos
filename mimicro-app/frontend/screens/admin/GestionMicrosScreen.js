import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getToken } from '../../services/authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const ESTADO_COLOR = { activo: '#4CAF50', inactivo: '#9E9E9E' };

export default function GestionMicrosScreen() {
  const [micros,  setMicros]  = useState([]);
  const [loading, setLoading] = useState(true);

  async function cargar() {
    setLoading(true);
    const token = await getToken();
    const data  = await (await fetch(`${API}/micros`, { headers: { Authorization: `Bearer ${token}` } })).json();
    setMicros(data); setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  if (loading) return <ActivityIndicator color="#4A148C" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <Text style={s.titulo}>Gestión de micros</Text>
      <FlatList data={micros} keyExtractor={i => i.id?.toString()}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.placa}>{item.placa}</Text>
              <Text style={s.info}>Chofer: {item.chofer_nombre || '–'}</Text>
              <Text style={s.info}>Ruta: {item.ruta_nombre || '–'}</Text>
              <Text style={s.info}>Capacidad: {item.capacidad} pasajeros</Text>
            </View>
            <View style={[s.estadoBadge, { backgroundColor: ESTADO_COLOR[item.estado] || '#9E9E9E' }]}>
              <Text style={s.estadoText}>{item.estado}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  titulo:      { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginBottom: 16 },
  card:        { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  placa:       { fontWeight: 'bold', fontSize: 18, color: '#333' },
  info:        { color: '#666', fontSize: 13, marginTop: 2 },
  estadoBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  estadoText:  { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
