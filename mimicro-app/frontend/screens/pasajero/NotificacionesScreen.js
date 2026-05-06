import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getToken } from '../../services/authService';
import { getNotificaciones, marcarLeida } from '../../services/notifService';

const COLORES = { desvio: '#F44336', retraso: '#FF9800', info: '#1565C0' };

export default function NotificacionesScreen() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  async function cargar() {
    const token  = await getToken();
    const userId = parseInt(JSON.parse(atob(token.split('.')[1])).sub);
    const data   = await getNotificaciones(userId);
    setNotifs(data);
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  async function handleLeer(id) {
    await marcarLeida(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  }

  if (loading) return <ActivityIndicator color="#1565C0" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <Text style={s.titulo}>Notificaciones</Text>
      {notifs.length === 0 && <Text style={s.empty}>No hay notificaciones</Text>}
      <FlatList data={notifs} keyExtractor={i => i.id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => !item.leida && handleLeer(item.id)}>
            <View style={[s.card, !item.leida && s.cardNueva]}>
              <View style={[s.badge, { backgroundColor: COLORES[item.tipo] || '#9E9E9E' }]}>
                <Text style={s.badgeText}>{item.tipo}</Text>
              </View>
              <Text style={s.mensaje}>{item.mensaje}</Text>
              <Text style={s.fecha}>{new Date(item.created_at).toLocaleString('es-BO')}</Text>
              {!item.leida && <Text style={s.nuevo}>● Nueva</Text>}
            </View>
          </TouchableOpacity>
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
  cardNueva: { borderLeftWidth: 4, borderLeftColor: '#1565C0' },
  badge:     { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  mensaje:   { color: '#333', fontSize: 14, marginBottom: 4 },
  fecha:     { color: '#aaa', fontSize: 11 },
  nuevo:     { color: '#1565C0', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
});
