import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getToken } from '../../services/authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function HistorialScreen() {
  const [viajes,  setViajes]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token  = await getToken();
        const userId = parseInt(JSON.parse(atob(token.split('.')[1])).sub);
        const res    = await fetch(`${API}/gps/historial/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } });
        setViajes(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <ActivityIndicator color="#1565C0" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <Text style={s.titulo}>Mis viajes</Text>
      {viajes.length === 0 && <Text style={s.empty}>No tenés viajes registrados aún</Text>}
      <FlatList data={viajes} keyExtractor={i => i.id?.toString()}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.ruta}>{item.ruta_nombre || 'Ruta desconocida'}</Text>
            <Text style={s.tramo}>{item.parada_origen} → {item.parada_destino}</Text>
            <View style={s.row}>
              <Text style={s.fecha}>{new Date(item.fecha).toLocaleString('es-BO')}</Text>
              <Text style={s.costo}>Bs {parseFloat(item.costo || 0).toFixed(2)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  titulo:    { fontSize: 20, fontWeight: 'bold', color: '#1565C0', marginBottom: 16 },
  empty:     { textAlign: 'center', color: '#9E9E9E', marginTop: 40 },
  card:      { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 1 },
  ruta:      { fontWeight: 'bold', color: '#1565C0', fontSize: 14 },
  tramo:     { color: '#333', marginVertical: 4 },
  row:       { flexDirection: 'row', justifyContent: 'space-between' },
  fecha:     { color: '#888', fontSize: 12 },
  costo:     { color: '#FFA000', fontWeight: 'bold' },
});
