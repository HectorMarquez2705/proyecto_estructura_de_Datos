import '@expo/metro-runtime';
import 'react-native-gesture-handler';
import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';

// En web, flex:1 no expande al viewport porque html/body no tienen altura definida.
// Se fuerza height:100vh en el root solo para web.
const rootStyle = Platform.OS === 'web'
  ? { flex: 1, height: '100vh', overflow: 'hidden' }
  : { flex: 1 };

export default function App() {
  return (
    <GestureHandlerRootView style={rootStyle}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#1565C0" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
