import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginScreen    from './screens/auth/LoginScreen'
import RegisterScreen from './screens/auth/RegisterScreen'

import Layout from './components/Layout'

import MapaScreen          from './screens/pasajero/MapaScreen'
import ETAScreen           from './screens/pasajero/ETAScreen'
import TarjetaScreen       from './screens/pasajero/TarjetaScreen'
import HistorialScreen     from './screens/pasajero/HistorialScreen'
import NotificacionesScreen from './screens/pasajero/NotificacionesScreen'

import RutaActivaScreen       from './screens/chofer/RutaActivaScreen'
import ReportarOcupacionScreen from './screens/chofer/ReportarOcupacionScreen'
import ReportarDesvioScreen   from './screens/chofer/ReportarDesvioScreen'

import GestionUsuariosScreen from './screens/admin/GestionUsuariosScreen'
import GestionRutasScreen    from './screens/admin/GestionRutasScreen'
import GestionMicrosScreen   from './screens/admin/GestionMicrosScreen'
import ReportesScreen        from './screens/admin/ReportesScreen'

const NAV_PASAJERO = [
  { path: '/pasajero/mapa',           label: 'Mapa en Vivo',    icon: '🗺️' },
  { path: '/pasajero/eta',            label: 'Llegadas',        icon: '⏱️' },
  { path: '/pasajero/tarjeta',        label: 'Mi Tarjeta',      icon: '💳' },
  { path: '/pasajero/historial',      label: 'Historial',       icon: '📋' },
  { path: '/pasajero/notificaciones', label: 'Notificaciones',  icon: '🔔' },
]

const NAV_CHOFER = [
  { path: '/chofer/ruta',      label: 'Ruta Activa',   icon: '🚌' },
  { path: '/chofer/ocupacion', label: 'Ocupación',     icon: '👥' },
  { path: '/chofer/desvio',    label: 'Reportar Desvío', icon: '⚠️' },
]

const NAV_ADMIN = [
  { path: '/admin/usuarios', label: 'Usuarios', icon: '👤' },
  { path: '/admin/rutas',    label: 'Rutas',    icon: '🗺️' },
  { path: '/admin/micros',   label: 'Micros',   icon: '🚌' },
  { path: '/admin/reportes', label: 'Reportes', icon: '📊' },
]

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.rol)) return <Navigate to="/login" replace />
  return children
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.rol === 'admin')  return <Navigate to="/admin/usuarios" replace />
  if (user.rol === 'chofer') return <Navigate to="/chofer/ruta" replace />
  return <Navigate to="/pasajero/mapa" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login"    element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />

          {/* Pasajero */}
          <Route path="/pasajero/*" element={
            <ProtectedRoute roles={['pasajero']}>
              <Layout nav={NAV_PASAJERO} color="blue" titulo="miMicro — Pasajero">
                <Routes>
                  <Route path="mapa"           element={<MapaScreen />} />
                  <Route path="eta"            element={<ETAScreen />} />
                  <Route path="tarjeta"        element={<TarjetaScreen />} />
                  <Route path="historial"      element={<HistorialScreen />} />
                  <Route path="notificaciones" element={<NotificacionesScreen />} />
                  <Route index element={<Navigate to="mapa" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Chofer */}
          <Route path="/chofer/*" element={
            <ProtectedRoute roles={['chofer']}>
              <Layout nav={NAV_CHOFER} color="green" titulo="miMicro — Chofer">
                <Routes>
                  <Route path="ruta"      element={<RutaActivaScreen />} />
                  <Route path="ocupacion" element={<ReportarOcupacionScreen />} />
                  <Route path="desvio"    element={<ReportarDesvioScreen />} />
                  <Route index element={<Navigate to="ruta" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin']}>
              <Layout nav={NAV_ADMIN} color="purple" titulo="miMicro — Admin">
                <Routes>
                  <Route path="usuarios" element={<GestionUsuariosScreen />} />
                  <Route path="rutas"    element={<GestionRutasScreen />} />
                  <Route path="micros"   element={<GestionMicrosScreen />} />
                  <Route path="reportes" element={<ReportesScreen />} />
                  <Route index element={<Navigate to="usuarios" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
