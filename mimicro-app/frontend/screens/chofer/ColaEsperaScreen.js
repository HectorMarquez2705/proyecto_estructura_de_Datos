import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getToken } from '../../services/authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function ColaEsperaScreen() {
  const [cola,    setCola]    = useState([]);
  const [loading, setLoading] = useState(true);

  async function cargar() {
    setLoading(true);
    try {
      const token  = await getToken();
      const userId = parseInt(JSON.parse(atob(token.split('.')[1])).sub);
      const micros = await (await fetch(`${API}/micros`, { headers: { Authorization: `Bearer ${token}` } })).json();
      const miMicro = micros.find(m => m.chofer_id === userId);
      if (!miMicro) { setLoading(false); return; }
      const data = await (await fetch(`${API}/notificaciones/cola/${miMicro.ruta_id}`,
        { headers: { Authorization: `Bearer ${token}` } })).json();
      setCola(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargar(); const id = setInterval(cargar, 8000); return () => clearInterval(id); }, []);

  if (loading) return <ActivityIndicator color="#2E7D32" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.titulo}>Cola de espera por parada</Text>
        <TouchableOpacity onPress={cargar}><Text style={s.refresh}>↻ Actualizar</Text></TouchableOpacity>
      </View>
      {cola.length === 0 && <Text style={s.empty}>No hay pasajeros esperando</Text>}
      <FlatList data={cola} keyExtractor={i => i.paradaId?.toString()}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.paradaNombre}>Parada #{item.paradaId}</Text>
            <View style={[s.badge, { backgroundColor: item.esperando > 0 ? '#1565C0' : '#9E9E9E' }]}>
              <Text style={s.badgeText}>{item.esperando} esperando</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo:       { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  refresh:      { color: '#1565C0', fontSize: 14 },
  empty:        { textAlign: 'center', color: '#9E9E9E', marginTop: 40 },
  card:         { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  paradaNombre: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  badge:        { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText:    { color: '#fff', fontWeight: 'bold' },
});
