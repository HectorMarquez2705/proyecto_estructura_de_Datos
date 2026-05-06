import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { getToken } from '../../services/authService';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function GestionRutasScreen() {
  const [rutas,    setRutas]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [nombre,   setNombre]   = useState('');
  const [descrip,  setDescrip]  = useState('');

  async function cargar() {
    const token = await getToken();
    const data  = await (await fetch(`${API}/rutas`, { headers: { Authorization: `Bearer ${token}` } })).json();
    setRutas(data); setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  async function crearRuta() {
    if (!nombre.trim()) return Alert.alert('Error', 'El nombre es requerido');
    const token = await getToken();
    await fetch(`${API}/rutas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nombre, descripcion: descrip }),
    });
    setModal(false); setNombre(''); setDescrip(''); cargar();
  }

  async function desactivar(id) {
    Alert.alert('Confirmar', '¿Desactivar esta ruta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desactivar', style: 'destructive', onPress: async () => {
        const token = await getToken();
        await fetch(`${API}/rutas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        cargar();
      }},
    ]);
  }

  if (loading) return <ActivityIndicator color="#4A148C" style={{ flex: 1 }} />;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.titulo}>Gestión de rutas</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setModal(true)}>
          <Text style={s.addText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={rutas} keyExtractor={i => i.id?.toString()}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.nombre}>{item.nombre}</Text>
              <Text style={s.desc}>{item.descripcion || 'Sin descripcion'}</Text>
            </View>
            <TouchableOpacity style={s.delBtn} onPress={() => desactivar(item.id)}>
              <Text style={s.delText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitulo}>Nueva ruta</Text>
            <TextInput style={s.input} placeholder="Nombre de la ruta"
              value={nombre} onChangeText={setNombre} />
            <TextInput style={s.input} placeholder="Descripcion (opcional)"
              value={descrip} onChangeText={setDescrip} />
            <TouchableOpacity style={s.saveBtn} onPress={crearRuta}>
              <Text style={s.saveTxt}>Guardar</Text>
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
  container:  { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo:     { fontSize: 20, fontWeight: 'bold', color: '#4A148C' },
  addBtn:     { backgroundColor: '#4A148C', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addText:    { color: '#fff', fontWeight: 'bold' },
  card:       { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  nombre:     { fontWeight: 'bold', color: '#333', fontSize: 15 },
  desc:       { color: '#888', fontSize: 12, marginTop: 2 },
  delBtn:     { padding: 8 },
  delText:    { color: '#F44336', fontSize: 18 },
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 32 },
  modal:      { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitulo:{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#4A148C' },
  input:      { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 12 },
  saveBtn:    { backgroundColor: '#4A148C', borderRadius: 10, padding: 14, alignItems: 'center' },
  saveTxt:    { color: '#fff', fontWeight: 'bold' },
  cancel:     { textAlign: 'center', color: '#888', marginTop: 12 },
});
