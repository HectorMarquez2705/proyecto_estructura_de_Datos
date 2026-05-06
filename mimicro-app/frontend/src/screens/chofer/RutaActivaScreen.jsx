import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getToken } from '../../services/authService'
import { emitirGPS, detenerGPS } from '../../services/gpsService'
import MapaInteractivo from '../../components/MapaInteractivo'
import Toast from '../../components/Toast'

export default function RutaActivaScreen() {
  const { user }   = useAuth()
  const [activa,   setActiva]   = useState(false)
  const [posicion, setPosicion] = useState(null)
  const [microId,  setMicroId]  = useState(null)
  const [paradas,  setParadas]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState(null)
  const watchRef = useRef(null)

  async function cargarMicro() {
    const token  = getToken()
    const userId = user?.sub
    const res    = await fetch('/micros', { headers: { Authorization: `Bearer ${token}` } })
    const micros = await res.json()
    const mi     = micros.find(m => m.chofer_id === parseInt(userId))
    if (!mi) throw new Error('No tenés un micro asignado. Contactá al administrador.')
    const resP = await fetch(`/rutas/${mi.ruta_id}/paradas`, { headers: { Authorization: `Bearer ${token}` } })
    setParadas(await resP.json())
    return mi.id
  }

  async function iniciar() {
    if (!navigator.geolocation) return setToast({ mensaje: 'Tu navegador no soporta geolocalización', tipo: 'error' })
    setLoading(true)
    try {
      const mid = await cargarMicro()
      setMicroId(mid)
      await fetch(`/micros/${mid}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ estado: 'activo' }),
      })
      watchRef.current = navigator.geolocation.watchPosition(
        pos => {
          const { latitude: lat, longitude: lng, speed } = pos.coords
          setPosicion({ lat, lng })
          emitirGPS(mid, lat, lng, speed || 0)
        },
        err => setToast({ mensaje: `GPS: ${err.message}`, tipo: 'error' }),
        { enableHighAccuracy: true, timeout: 8000 }
      )
      setActiva(true)
      setToast({ mensaje: 'Ruta iniciada — GPS activo', tipo: 'success' })
    } catch (e) {
      setToast({ mensaje: e.message, tipo: 'error' })
    } finally { setLoading(false) }
  }

  async function finalizar() {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
    if (microId) {
      detenerGPS(microId)
      await fetch(`/micros/${microId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ estado: 'inactivo' }),
      }).catch(() => {})
    }
    setActiva(false); setPosicion(null); setMicroId(null)
    setToast({ mensaje: 'Ruta finalizada', tipo: 'info' })
  }

  useEffect(() => () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current) }, [])

  return (
    <div style={{ height: 'calc(100vh - 54px)', marginTop: -24, marginLeft: -24, marginRight: -24, display: 'flex', flexDirection: 'column' }}>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}

      <div style={{ flex: 1, position: 'relative' }}>
        <MapaInteractivo
          paradas={paradas}
          marcadores={posicion ? [{ ...posicion, microId }] : []}
          centroInicial={{ lat: -17.7833, lng: -63.1822 }}
        />
      </div>

      <div style={{ background: '#fff', padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
        {activa && (
          <div className="gps-indicator">
            <div className="gps-dot" />
            GPS activo {posicion ? `· ${posicion.lat.toFixed(5)}, ${posicion.lng.toFixed(5)}` : '· esperando...'}
          </div>
        )}
        <div style={{ marginLeft: 'auto' }}>
          {loading ? (
            <span style={{ color: 'var(--text-sec)' }}>Cargando...</span>
          ) : activa ? (
            <button className="btn btn-danger" onClick={finalizar}>⏹ Finalizar ruta</button>
          ) : (
            <button className="btn btn-success" onClick={iniciar}>▶ Iniciar ruta</button>
          )}
        </div>
      </div>
    </div>
  )
}
