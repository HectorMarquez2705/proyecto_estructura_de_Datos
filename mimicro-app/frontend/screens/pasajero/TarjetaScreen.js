import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, FlatList } from 'react-native';
import TarjetaQR from '../../components/TarjetaQR';
import { getSaldo, recargar } from '../../services/pagosService';
import { getToken } from '../../services/authService';

function getUserIdFromToken(token) {
  try { return parseInt(JSON.parse(atob(token.split('.')[1])).sub); } catch { return null; }
}

export default function TarjetaScreen() {
  const [tarjeta,  setTarjeta]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [monto,    setMonto]    = useState('');

  async function cargar() {
    setLoading(true);
    try {
      const token  = await getToken();
      const userId = getUserIdFromToken(token);
      const data   = await getSaldo(userId);
      setTarjeta(data);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);

  async function handleRecargar() {
    const m = parseFloat(monto);
    if (!m || m <= 0) return Alert.alert('Error', 'Ingresa un monto valido');
    try {
      await recargar(m);
      setModal(false); setMonto('');
      cargar();
      Alert.alert('Exito', `Recarga de ${m} Bs realizada`);
    } catch (e) { Alert.alert('Error', e.message); }
  }

  if (loading) return <ActivityIndicator color="#1565C0" style={{ flex: 1 }} />;
  if (!tarjeta) return <Text style={{ textAlign: 'center', marginTop: 40 }}>Sin tarjeta</Text>;

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.cardTitle}>Tarjeta miMicro</Text>
        <Text style={s.numero}>{tarjeta.tarjeta?.numero_tarjeta}</Text>
        <Text style={s.saldo}>Bs {parseFloat(tarjeta.saldo).toFixed(2)}</Text>
        <TarjetaQR value={tarjeta.tarjeta?.numero_tarjeta} />
        <TouchableOpacity style={s.btn} onPress={() => setModal(true)}>
          <Text style={s.btnText}>Recargar saldo</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.seccion}>Últimas transacciones</Text>
      <FlatList data={tarjeta.ultimas_transacciones || []} keyExtractor={i => i.id?.toString()}
        renderItem={({ item }) => (
          <View style={s.tx}>
            <Text style={[s.txTipo, { color: item.tipo === 'recarga' ? '#4CAF50' : '#F44336' }]}>
              {item.tipo === 'recarga' ? '+' : '-'}{item.monto} Bs
            </Text>
            <Text style={s.txDesc}>{item.descripcion}</Text>
          </View>
        )}
      />

      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Recargar saldo</Text>
            <TextInput style={s.input} placeholder="Monto en Bs" keyboardType="numeric"
              value={monto} onChangeText={setMonto} />
            <TouchableOpacity style={s.btn} onPress={handleRecargar}>
              <Text style={s.btnText}>Confirmar recarga</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={s.cancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card:      { backgroundColor: '#1565C0', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  cardTitle: { color: '#BBDEFB', fontSize: 14 },
  numero:    { color: '#fff', fontSize: 18, fontWeight: 'bold', marginVertical: 6 },
  saldo:     { color: '#FFA000', fontSize: 36, fontWeight: 'bold', marginBottom: 16 },
  btn:       { backgroundColor: '#FFA000', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12, width: '100%' },
  btnText:   { color: '#fff', fontWeight: 'bold' },
  seccion:   { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  tx:        { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 6 },
  txTipo:    { fontWeight: 'bold', fontSize: 15 },
  txDesc:    { color: '#888', fontSize: 13 },
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 32 },
  modal:     { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle:{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1565C0' },
  input:     { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 16 },
  cancel:    { textAlign: 'center', color: '#888', marginTop: 12 },
});
