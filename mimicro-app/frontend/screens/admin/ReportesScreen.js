import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getToken } from '../../services/authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function ReportesScreen() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch(`${API}/auth/logs`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLogs(await res.json());
      setLoading(false);
    })();
  }, []);

  const NIVEL_COLOR = { INFO: '#4CAF50', WARNING: '#FFA000', ERROR: '#F44336' };

  if (loading) return <ActivityIndicator color="#4A148C" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <Text style={s.titulo}>Reportes de seguridad</Text>
      {logs.length === 0 && <Text style={s.empty}>No hay logs disponibles</Text>}
      <FlatList data={logs} keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[s.card, { borderLeftColor: NIVEL_COLOR[item.nivel] || '#9E9E9E' }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.evento}>{item.evento}</Text>
              <Text style={s.sub}>{item.usuario} · {item.ip}</Text>
              <Text style={s.fecha}>{item.timestamp}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: NIVEL_COLOR[item.nivel] || '#9E9E9E' }]}>
              <Text style={s.badgeTxt}>{item.nivel}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  titulo:    { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginBottom: 16 },
  empty:     { textAlign: 'center', color: '#9E9E9E', marginTop: 40 },
  card:      { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, elevation: 1 },
  evento:    { fontWeight: 'bold', color: '#333', fontSize: 13 },
  sub:       { color: '#666', fontSize: 12 },
  fecha:     { color: '#aaa', fontSize: 11, marginTop: 2 },
  badge:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt:  { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});
