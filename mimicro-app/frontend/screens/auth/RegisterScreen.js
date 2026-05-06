import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { register } from '../../services/authService';

export default function RegisterScreen({ navigation }) {
  const [nombre,   setNombre]   = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol,      setRol]      = useState('pasajero');
  const [loading,  setLoading]  = useState(false);

  async function handleRegister() {
    if (!nombre || !email || !password)
      return Alert.alert('Error', 'Nombre, email y contraseña son obligatorios');
    try {
      setLoading(true);
      await register(nombre.trim(), email.trim().toLowerCase(), password, rol, telefono);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Crear cuenta</Text>

      <TextInput style={s.input} placeholder="Nombre completo" placeholderTextColor="#aaa"
        value={nombre} onChangeText={setNombre} />

      <TextInput style={s.input} placeholder="Email" placeholderTextColor="#aaa"
        value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" />

      <TextInput style={s.input} placeholder="Contraseña (mín. 6 caracteres)" placeholderTextColor="#aaa"
        value={password} onChangeText={setPassword} secureTextEntry />

      <TextInput style={s.input} placeholder="Teléfono (opcional)" placeholderTextColor="#aaa"
        value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />

      <Text style={s.label}>Tipo de cuenta:</Text>
      <View style={s.rolRow}>
        <TouchableOpacity style={[s.rolBtn, rol === 'pasajero' && s.rolActive]}
          onPress={() => setRol('pasajero')}>
          <Text style={[s.rolText, rol === 'pasajero' && s.rolTextActive]}>Pasajero</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.rolBtn, rol === 'chofer' && s.rolActive]}
          onPress={() => setRol('chofer')}>
          <Text style={[s.rolText, rol === 'chofer' && s.rolTextActive]}>Chofer</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Crear cuenta</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={s.link}>Ya tengo cuenta → Iniciar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#1565C0', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  title:     { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 28 },
  label:     { color: '#BBDEFB', marginBottom: 8, marginTop: 4 },
  input:     { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15 },
  rolRow:    { flexDirection: 'row', marginBottom: 20, gap: 12 },
  rolBtn:    { flex: 1, borderRadius: 10, padding: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  rolActive: { backgroundColor: '#FFA000' },
  rolText:   { color: '#BBDEFB', fontWeight: '600' },
  rolTextActive: { color: '#fff' },
  btn:       { backgroundColor: '#FFA000', borderRadius: 10, padding: 16, alignItems: 'center' },
  btnText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link:      { color: '#BBDEFB', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
