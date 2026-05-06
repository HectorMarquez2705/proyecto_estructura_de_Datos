import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLOR_OCUP = { vacio: '#4CAF50', medio: '#FFA000', lleno: '#F44336' };

export default function MarcadorMicro({ micro }) {
  const color = COLOR_OCUP[micro?.ocupacion] || '#1565C0';
  return (
    <View style={[s.marker, { backgroundColor: color }]}>
      <Text style={s.emoji}>🚌</Text>
      <View style={s.tail} />
    </View>
  );
}

const s = StyleSheet.create({
  marker: { alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 18, elevation: 4 },
  emoji:  { fontSize: 18 },
  tail:   { position: 'absolute', bottom: -6, width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#1565C0' },
});
