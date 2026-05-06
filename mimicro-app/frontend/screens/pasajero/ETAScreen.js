import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getRutas, getParadas } from '../../services/rutasService';
import { getETAsRuta } from '../../services/notifService';

const COLOR_OCUP = { vacio: '#4CAF50', medio: '#FFA000', lleno: '#F44336' };

export default function ETAScreen() {
  const [rutas,      setRutas]    = useState([]);
  const [rutaId,     setRutaId]   = useState(null);
  const [paradas,    setParadas]  = useState([]);
  const [paradaId,   setParadaId] = useState(null);
  const [etas,       setEtas]     = useState([]);
  const [loading,    setLoading]  = useState(false);

  useEffect(() => { getRutas().then(setRutas); }, []);

  useEffect(() => {
    if (!rutaId) return;
    getParadas(rutaId).then(list => { setParadas(list); setParadaId(list[0]?.id || null); });
  }, [rutaId]);

  useEffect(() => {
    if (!rutaId || !paradaId) return;
    const cargar = () => {
      setLoading(true);
      getETAsRuta(rutaId, paradaId)
        .then(setEtas)
        .finally(() => setLoading(false));
    };
    cargar();
    const id = setInterval(cargar, 10000);
    return () => clearInterval(id);
  }, [rutaId, paradaId]);

  return (
    <View style={s.container}>
      <Text style={s.titulo}>Tiempos de llegada</Text>

      <ScrollView horizontal style={s.scroll}>
        {rutas.map(r => (
          <TouchableOpacity key={r.id} style={[s.chip, rutaId === r.id && s.chipActive]}
            onPress={() => setRutaId(r.id)}>
            <Text style={s.chipText}>{r.nombre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {paradas.length > 0 && (
        <ScrollView horizontal style={s.scroll}>
          {paradas.map(p => (
            <TouchableOpacity key={p.id} style={[s.chip, paradaId === p.id && s.chipActive]}
              onPress={() => setParadaId(p.id)}>
              <Text style={s.chipText}>{p.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading && <ActivityIndicator color="#1565C0" style={{ margin: 20 }} />}

      {!loading && etas.length === 0 && rutaId && (
        <Text style={s.empty}>No hay micros activos en esta ruta</Text>
      )}

      <FlatList data={etas} keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={[s.dot, { backgroundColor: COLOR_OCUP[item.ocupacion] || '#9E9E9E' }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.microText}>Micro #{item.microId}</Text>
              <Text style={s.etaText}>
                {item.tiempoSegundos !== null
                  ? `${Math.round(item.tiempoSegundos / 60)} min · ${Math.round(item.distanciaMetros)} m`
                  : item.error || 'Sin datos'}
              </Text>
            </View>
            <Text style={s.ocupText}>{item.ocupacion || '–'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  titulo:    { fontSize: 20, fontWeight: 'bold', padding: 16, color: '#1565C0' },
  scroll:    { maxHeight: 48, paddingHorizontal: 8 },
  chip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#E3F2FD' },
  chipActive:{ backgroundColor: '#1565C0' },
  chipText:  { fontSize: 12, color: '#1565C0' },
  empty:     { textAlign: 'center', marginTop: 40, color: '#9E9E9E' },
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 8, padding: 14, borderRadius: 10, elevation: 2 },
  dot:       { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  microText: { fontWeight: 'bold', color: '#333' },
  etaText:   { color: '#555', fontSize: 13 },
  ocupText:  { color: '#888', fontSize: 12 },
});

import { ScrollView } from 'react-native';
