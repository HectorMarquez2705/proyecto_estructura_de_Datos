import { useState, useEffect, useRef } from 'react'
import MapaInteractivo from '../../components/MapaInteractivo'
import { getRutas, getParadas } from '../../services/rutasService'
import { suscribirMapa } from '../../services/gpsService'

export default function MapaScreen() {
  const [rutas,      setRutas]      = useState([])
  const [rutaActiva, setRutaActiva] = useState(null)
  const [paradas,    setParadas]    = useState([])
  const [marcadores, setMarcadores] = useState({})
  const unsubRef = useRef(null)

  useEffect(() => { getRutas().then(setRutas).catch(console.error) }, [])

  useEffect(() => {
    if (!rutaActiva) return
    getParadas(rutaActiva).then(setParadas).catch(console.error)
    if (unsubRef.current) unsubRef.current()
    unsubRef.current = suscribirMapa(
      rutaActiva,
      data  => setMarcadores(p => ({ ...p, [data.microId]: data })),
      ({ microId }) => setMarcadores(p => { const n = { ...p }; delete n[microId]; return n }),
    )
    return () => { if (unsubRef.current) unsubRef.current() }
  }, [rutaActiva])

  return (
    <div className="mapa-screen" style={{ height: 'calc(100vh - 54px)', marginTop: -24, marginLeft: -24, marginRight: -24 }}>
      <div className="mapa-tabs">
        {rutas.map(r => (
          <button key={r.id}
            className={`mapa-tab${rutaActiva === r.id ? ' active' : ''}`}
            onClick={() => setRutaActiva(r.id)}>
            {r.nombre}
          </button>
        ))}
      </div>
      <div className="mapa-body">
        <MapaInteractivo
          paradas={paradas}
          marcadores={Object.values(marcadores)}
          centroInicial={{ lat: -17.7833, lng: -63.1822 }}
        />
        {!rutaActiva && (
          <div className="mapa-hint">Seleccioná una ruta para ver los micros en tiempo real</div>
        )}
      </div>
    </div>
  )
}
