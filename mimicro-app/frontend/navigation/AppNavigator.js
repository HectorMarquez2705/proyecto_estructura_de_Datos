import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import LoginScreen    from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Stacks por rol
import PasajeroStack from './stacks/PasajeroStack';
import ChoferStack   from './stacks/ChoferStack';
import AdminStack    from './stacks/AdminStack';

const Root = createStackNavigator();

function getToken() {
  if (Platform.OS === 'web') return localStorage.getItem('mimicro_token');
  return SecureStore.getItemAsync('mimicro_token');
}

export default function AppNavigator() {
  const [token, setToken]   = useState(null);
  const [rol, setRol]       = useState(null);
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) {
        const payload = JSON.parse(atob(t.split('.')[1]));
        setToken(t);
        setRol(payload.rol);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Root.Screen name="Login"    component={LoginScreen} />
            <Root.Screen name="Register" component={RegisterScreen} />
          </>
        ) : rol === 'admin' ? (
          <Root.Screen name="Admin"    component={AdminStack} />
        ) : rol === 'chofer' ? (
          <Root.Screen name="Chofer"   component={ChoferStack} />
        ) : (
          <Root.Screen name="Pasajero" component={PasajeroStack} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
