import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { reportarDesvio } from '../../services/notifService';
import { getToken } from '../../services/authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function ReportarDesvioScreen() {
  const [descripcion, setDescripcion] = useState('');
  const [loading,     setLoading]     = useState(false);

  async function handleEnviar() {
    const desc = descripcion.trim();
    if (!desc) return Alert.alert('Error', 'Escribe una descripcion del desvio');
    setLoading(true);
    try {
      const token  = await getToken();
      const userId = parseInt(JSON.parse(atob(token.split('.')[1])).sub);
      const micros = await (await fetch(`${API}/micros`, { headers: { Authorization: `Bearer ${token}` } })).json();
      const miMicro = micros.find(m => m.chofer_id === userId);
      if (!miMicro) throw new Error('No tienes un micro asignado');
      await reportarDesvio(miMicro.ruta_id, desc);
      Alert.alert('Enviado', 'Los pasajeros de tu ruta fueron notificados');
      setDescripcion('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.titulo}>Reportar desvío de ruta</Text>
      <Text style={s.sub}>Se notificará automáticamente a todos los pasajeros de tu ruta activa</Text>

      <TextInput
        style={s.input}
        placeholder="Ej: Cortado por obra en Av. Banzer, tomando 2do anillo..."
        placeholderTextColor="#aaa"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <TouchableOpacity style={s.btn} onPress={handleEnviar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>📢 Enviar alerta</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 24 },
  titulo:    { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  sub:       { color: '#888', marginBottom: 24, fontSize: 13 },
  input:     { backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 15, minHeight: 120, marginBottom: 20, elevation: 1 },
  btn:       { backgroundColor: '#C62828', borderRadius: 12, padding: 18, alignItems: 'center' },
  btnText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
