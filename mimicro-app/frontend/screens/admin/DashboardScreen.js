import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getToken } from '../../services/authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function DashboardScreen() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  async function cargar() {
    setLoading(true);
    const token = await getToken();
    const [stats, horas] = await Promise.all([
      fetch(`${API}/gps/activos`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]);
    // Obtener estadisticas del backend
    const res = await fetch(`${API}/auth/login`, { method: 'GET' }).catch(() => null);
    // Usamos datos basicos disponibles
    const micros = await (await fetch(`${API}/micros`, { headers: { Authorization: `Bearer ${token}` } })).json();
    const rutas  = await (await fetch(`${API}/rutas`,  { headers: { Authorization: `Bearer ${token}` } })).json();
    setStats({
      microsActivos: Array.isArray(stats) ? stats.length : 0,
      totalMicros:   micros.length,
      totalRutas:    rutas.length,
    });
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  if (loading) return <ActivityIndicator color="#4A148C" style={{ flex: 1 }} />;

  const tarjetas = [
    { label: 'Micros activos',  valor: stats?.microsActivos, color: '#4CAF50' },
    { label: 'Total micros',    valor: stats?.totalMicros,   color: '#1565C0' },
    { label: 'Rutas activas',   valor: stats?.totalRutas,    color: '#FFA000' },
  ];

  return (
    <ScrollView style={s.container}>
      <Text style={s.titulo}>Panel de administración</Text>
      <View style={s.grid}>
        {tarjetas.map((t, i) => (
          <View key={i} style={[s.card, { borderTopColor: t.color }]}>
            <Text style={[s.valor, { color: t.color }]}>{t.valor ?? '–'}</Text>
            <Text style={s.label}>{t.label}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.refresh} onPress={cargar}>
        <Text style={s.refreshText}>↻ Actualizar datos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  titulo:    { fontSize: 22, fontWeight: 'bold', color: '#4A148C', marginBottom: 20 },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:      { backgroundColor: '#fff', borderRadius: 12, padding: 20, flex: 1, minWidth: '45%', borderTopWidth: 4, elevation: 2 },
  valor:     { fontSize: 36, fontWeight: 'bold' },
  label:     { color: '#666', fontSize: 13, marginTop: 4 },
  refresh:   { marginTop: 24, alignItems: 'center' },
  refreshText: { color: '#4A148C', fontSize: 14 },
});
