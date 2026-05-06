import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapaScreen          from '../../screens/pasajero/MapaScreen';
import ETAScreen           from '../../screens/pasajero/ETAScreen';
import TarjetaScreen       from '../../screens/pasajero/TarjetaScreen';
import HistorialScreen     from '../../screens/pasajero/HistorialScreen';
import NotificacionesScreen from '../../screens/pasajero/NotificacionesScreen';

const Tab = createBottomTabNavigator();

export default function PasajeroStack() {
  return (
    <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1565C0' }, headerTintColor: '#fff' }}>
      <Tab.Screen name="Mapa"          component={MapaScreen}           options={{ title: 'Mapa en Vivo' }} />
      <Tab.Screen name="ETA"           component={ETAScreen}            options={{ title: 'Llegadas' }} />
      <Tab.Screen name="Tarjeta"       component={TarjetaScreen}        options={{ title: 'Mi Tarjeta' }} />
      <Tab.Screen name="Historial"     component={HistorialScreen}      options={{ title: 'Historial' }} />
      <Tab.Screen name="Notificaciones" component={NotificacionesScreen} options={{ title: 'Alertas' }} />
    </Tab.Navigator>
  );
}
