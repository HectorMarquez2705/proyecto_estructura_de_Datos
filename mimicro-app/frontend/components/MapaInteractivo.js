/**
 * MapaInteractivo — solución unificada
 * En web carga MapaInteractivoWeb (react-leaflet + OpenStreetMap)
 * En iOS/Android carga MapaInteractivoNativo (react-native-maps + OSM tiles)
 * El importador de esta pantalla siempre usa este archivo; el bundler
 * de Expo resuelve automáticamente .native.js para iOS/Android.
 */
export { default } from './MapaInteractivoWeb';
