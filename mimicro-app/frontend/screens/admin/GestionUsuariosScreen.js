import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getToken } from '../../services/authService';

const API    = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const COLORES = { admin: '#4A148C', chofer: '#2E7D32', pasajero: '#1565C0', suspendido: '#9E9E9E' };

export default function GestionUsuariosScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading,  setLoading]  = useState(true);

  async function cargar() {
    // Endpoint de lista de usuarios (requiere admin)
    const token = await getToken();
    const res   = await fetch(`${API}/auth/usuarios`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setUsuarios(await res.json());
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  async function cambiarRol(userId, rolActual) {
    const opciones = ['pasajero', 'chofer', 'admin', 'suspendido'].filter(r => r !== rolActual);
    Alert.alert('Cambiar rol', `Selecciona el nuevo rol para este usuario:`,
      opciones.map(r => ({ text: r.toUpperCase(), onPress: async () => {
        const token = await getToken();
        await fetch(`${API}/auth/usuarios/${userId}/rol`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rol: r }),
        });
        cargar();
      }})).concat([{ text: 'Cancelar', style: 'cancel' }])
    );
  }

  if (loading) return <ActivityIndicator color="#4A148C" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <Text style={s.titulo}>Gestión de usuarios</Text>
      <FlatList data={usuarios} keyExtractor={i => i.id?.toString()}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.nombre}>{item.nombre}</Text>
              <Text style={s.email}>{item.email}</Text>
            </View>
            <TouchableOpacity onPress={() => cambiarRol(item.id, item.rol)}>
              <View style={[s.rolBadge, { backgroundColor: COLORES[item.rol] || '#9E9E9E' }]}>
                <Text style={s.rolText}>{item.rol}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  titulo:    { fontSize: 20, fontWeight: 'bold', color: '#4A148C', marginBottom: 16 },
  card:      { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  nombre:    { fontWeight: 'bold', color: '#333', fontSize: 15 },
  email:     { color: '#888', fontSize: 13 },
  rolBadge:  { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  rolText:   { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
