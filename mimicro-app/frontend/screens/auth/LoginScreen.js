import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { login } from '../../services/authService';

export default function LoginScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Error', 'Completa todos los campos');
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
      // AppNavigator detecta el token y redirige automaticamente
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.logo}>🚌 miMicro</Text>
      <Text style={s.subtitle}>Transporte inteligente de SCZ</Text>

      <TextInput style={s.input} placeholder="Email" placeholderTextColor="#aaa"
        value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" />

      <TextInput style={s.input} placeholder="Contraseña" placeholderTextColor="#aaa"
        value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Ingresar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={s.link}>¿No tenés cuenta? Registrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1565C0', justifyContent: 'center', paddingHorizontal: 32 },
  logo:      { fontSize: 42, textAlign: 'center', marginBottom: 8, color: '#fff' },
  subtitle:  { fontSize: 14, textAlign: 'center', color: '#BBDEFB', marginBottom: 40 },
  input:     { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15 },
  btn:       { backgroundColor: '#FFA000', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link:      { color: '#BBDEFB', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
