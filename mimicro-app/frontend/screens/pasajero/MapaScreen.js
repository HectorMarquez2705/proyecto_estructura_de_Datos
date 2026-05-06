import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import MapaInteractivo from '../../components/MapaInteractivo';
import { getRutas, getParadas } from '../../services/rutasService';
import { suscribirMapa } from '../../services/gpsService';

export default function MapaScreen() {
  const [rutas,        setRutas]        = useState([]);
  const [rutaActiva,   setRutaActiva]   = useState(null);
  const [paradas,      setParadas]      = useState([]);
  const [marcadores,   setMarcadores]   = useState({});
  const unsubRef = useRef(null);

  useEffect(() => {
    getRutas().then(setRutas).catch(console.error);
  }, []);

  useEffect(() => {
    if (!rutaActiva) return;
    getParadas(rutaActiva).then(setParadas).catch(console.error);

    if (unsubRef.current) unsubRef.current();
    unsubRef.current = suscribirMapa(
      rutaActiva,
      (data) => setMarcadores(prev => ({ ...prev, [data.microId]: data })),
      ({ microId }) => setMarcadores(prev => { const n = {...prev}; delete n[microId]; return n; }),
    );
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [rutaActiva]);

  return (
    <View style={s.container}>
      <ScrollView horizontal style={s.tabs} showsHorizontalScrollIndicator={false}>
        {rutas.map(r => (
          <TouchableOpacity key={r.id} style={[s.tab, rutaActiva === r.id && s.tabActive]}
            onPress={() => setRutaActiva(r.id)}>
            <Text style={[s.tabText, rutaActiva === r.id && s.tabTextActive]}>{r.nombre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.mapa}>
        <MapaInteractivo
          paradas={paradas}
          marcadores={Object.values(marcadores)}
          centroInicial={{ lat: -17.7833, lng: -63.1822 }}
        />
      </View>

      {!rutaActiva && (
        <View style={s.hint}>
          <Text style={s.hintText}>Seleccioná una ruta para ver los micros en tiempo real</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  tabs:      { maxHeight: 50, paddingHorizontal: 8, paddingVertical: 8, backgroundColor: '#1565C0' },
  tab:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.2)' },
  tabActive: { backgroundColor: '#FFA000' },
  tabText:   { color: '#BBDEFB', fontSize: 13 },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },
  mapa:      { flex: 1 },
  hint:      { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  hintText:  { color: '#fff', fontSize: 13 },
});
