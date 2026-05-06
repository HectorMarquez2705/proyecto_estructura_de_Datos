import React, { useEffect, useState } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';

const COLORES = { desvio: '#C62828', retraso: '#E65100', info: '#1565C0' };

export default function NotificacionBanner({ notificacion, onClose }) {
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (!notificacion) return;
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(4000),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onClose && onClose());
  }, [notificacion]);

  if (!notificacion) return null;

  return (
    <Animated.View style={[s.banner, { opacity, backgroundColor: COLORES[notificacion.tipo] || '#333' }]}>
      <Text style={s.texto}>{notificacion.mensaje}</Text>
      <TouchableOpacity onPress={onClose} style={s.close}>
        <Text style={s.closeTxt}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner:   { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 14, zIndex: 999 },
  texto:    { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },
  close:    { padding: 6 },
  closeTxt: { color: '#fff', fontSize: 16 },
});
