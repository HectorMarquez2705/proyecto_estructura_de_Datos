import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function guardarToken(token) {
  if (Platform.OS === 'web') localStorage.setItem('mimicro_token', token);
  else await SecureStore.setItemAsync('mimicro_token', token);
}

async function getToken() {
  if (Platform.OS === 'web') return localStorage.getItem('mimicro_token');
  return SecureStore.getItemAsync('mimicro_token');
}

export async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error al iniciar sesion');
  await guardarToken(data.token);
  return data;
}

export async function register(nombre, email, password, rol, telefono = '') {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password, rol, telefono }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error al registrarse');
  await guardarToken(data.token);
  return data;
}

export async function logout() {
  if (Platform.OS === 'web') localStorage.removeItem('mimicro_token');
  else await SecureStore.deleteItemAsync('mimicro_token');
}

export { getToken };
