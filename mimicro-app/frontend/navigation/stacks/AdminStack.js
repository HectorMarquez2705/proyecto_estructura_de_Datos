import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen      from '../../screens/admin/DashboardScreen';
import GestionRutasScreen   from '../../screens/admin/GestionRutasScreen';
import GestionMicrosScreen  from '../../screens/admin/GestionMicrosScreen';
import GestionUsuariosScreen from '../../screens/admin/GestionUsuariosScreen';
import ReportesScreen       from '../../screens/admin/ReportesScreen';

const Tab = createBottomTabNavigator();

export default function AdminStack() {
  return (
    <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: '#4A148C' }, headerTintColor: '#fff' }}>
      <Tab.Screen name="Dashboard"  component={DashboardScreen}       options={{ title: 'Panel' }} />
      <Tab.Screen name="Rutas"      component={GestionRutasScreen}    options={{ title: 'Rutas' }} />
      <Tab.Screen name="Micros"     component={GestionMicrosScreen}   options={{ title: 'Micros' }} />
      <Tab.Screen name="Usuarios"   component={GestionUsuariosScreen} options={{ title: 'Usuarios' }} />
      <Tab.Screen name="Reportes"   component={ReportesScreen}        options={{ title: 'Reportes' }} />
    </Tab.Navigator>
  );
}
