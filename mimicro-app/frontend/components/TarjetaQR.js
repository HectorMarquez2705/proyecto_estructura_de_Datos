import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export default function TarjetaQR({ value, size = 150 }) {
  if (!value) return null;

  if (Platform.OS === 'web') {
    // En web usamos la API de QR code de Google Charts (sin dependencia extra)
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
    return (
      <View style={s.container}>
        <img src={url} alt="QR" width={size} height={size} style={{ borderRadius: 8 }} />
      </View>
    );
  }

  const QRCode = require('react-native-qrcode-svg').default;
  return (
    <View style={s.container}>
      <QRCode value={value} size={size} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 12, margin: 8 },
});
