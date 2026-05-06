const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Soporte web: extensiones en orden correcto
config.resolver.sourceExts = ['web.js', 'web.ts', 'web.tsx', 'js', 'json', 'ts', 'tsx'];

// Excluir carpetas ocultas de node_modules (ej: .react-native-gesture-handler-XXXXX)
// Estas carpetas causan EPERM en Windows porque tienen permisos restringidos.
// Se configura en las tres ubicaciones posibles según versión de Metro:
const BLOCK = /node_modules[/\\]+\.[^/\\]/;
config.resolver.blockList    = [BLOCK]; // Metro 0.73+
config.resolver.blacklistRE  = BLOCK;   // Metro < 0.73

module.exports = config;
