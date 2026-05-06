import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RutaActivaScreen        from '../../screens/chofer/RutaActivaScreen';
import ColaEsperaScreen        from '../../screens/chofer/ColaEsperaScreen';
import ReportarOcupacionScreen from '../../screens/chofer/ReportarOcupacionScreen';
import ReportarDesvioScreen    from '../../screens/chofer/ReportarDesvioScreen';

const Tab = createBottomTabNavigator();

export default function ChoferStack() {
  return (
    <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2E7D32' }, headerTintColor: '#fff' }}>
      <Tab.Screen name="RutaActiva"   component={RutaActivaScreen}        options={{ title: 'Mi Ruta' }} />
      <Tab.Screen name="Cola"         component={ColaEsperaScreen}        options={{ title: 'Cola de Espera' }} />
      <Tab.Screen name="Ocupacion"    component={ReportarOcupacionScreen} options={{ title: 'Ocupacion' }} />
      <Tab.Screen name="Desvio"       component={ReportarDesvioScreen}    options={{ title: 'Reportar Desvio' }} />
    </Tab.Navigator>
  );
}
