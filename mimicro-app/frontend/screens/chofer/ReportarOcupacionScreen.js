import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { getToken } from '../../services/authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const OPCIONES = [
  { key: 'vacio', label: 'VACÍO',  color: '#4CAF50', emoji: '🟢' },
  { key: 'medio', label: 'MEDIO',  color: '#FFA000', emoji: '🟡' },
  { key: 'lleno', label: 'LLENO',  color: '#F44336', emoji: '🔴' },
];

export default function ReportarOcupacionScreen() {
  const [microId,   setMicroId]   = useState(null);
  const [ocupacion, setOcupacion] = useState(null);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    (async () => {
      const token  = await getToken();
      const userId = parseInt(JSON.parse(atob(token.split('.')[1])).sub);
      const micros = await (await fetch(`${API}/micros`, { headers: { Authorization: `Bearer ${token}` } })).json();
      const m = micros.find(x => x.chofer_id === userId);
      if (m) { setMicroId(m.id); setOcupacion(m.ocupacion_estado || 'vacio'); }
    })();
  }, []);

  async function reportar(estado) {
    if (!microId) return;
    setLoading(true);
    try {
      const token = await getToken();
      await fetch(`${API}/micros/${microId}/ocupacion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ocupacion: estado }),
      });
      setOcupacion(estado);
      Alert.alert('Actualizado', `Ocupación reportada como: ${estado.toUpperCase()}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.titulo}>¿Cuántos pasajeros hay a bordo?</Text>
      <Text style={s.sub}>Toca el botón que corresponda para actualizar en tiempo real</Text>

      {loading && <ActivityIndicator color="#2E7D32" style={{ marginVertical: 20 }} />}

      {OPCIONES.map(op => (
        <TouchableOpacity key={op.key} style={[s.btn, { backgroundColor: op.color },
          ocupacion === op.key && s.btnActivo]}
          onPress={() => reportar(op.key)} disabled={loading}>
          <Text style={s.emoji}>{op.emoji}</Text>
          <Text style={s.btnText}>{op.label}</Text>
          {ocupacion === op.key && <Text style={s.tick}>✓ Actual</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 24, justifyContent: 'center' },
  titulo:    { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 8 },
  sub:       { textAlign: 'center', color: '#888', marginBottom: 32, fontSize: 13 },
  btn:       { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, elevation: 2 },
  btnActivo: { borderWidth: 4, borderColor: '#fff' },
  emoji:     { fontSize: 36, marginBottom: 6 },
  btnText:   { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  tick:      { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4 },
});
