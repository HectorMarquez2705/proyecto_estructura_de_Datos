import { useState, useEffect, useCallback } from 'react'
import { getRutas, getParadas } from '../../services/rutasService'
import { getETARuta } from '../../services/notifService'

const OCUP_COLOR = { vacio: 'green', medio: 'amber', lleno: 'red' }

export default function ETAScreen() {
  const [rutas,    setRutas]    = useState([])
  const [paradas,  setParadas]  = useState([])
  const [rutaId,   setRutaId]   = useState('')
  const [paradaId, setParadaId] = useState('')
  const [etas,     setEtas]     = useState([])
  const [loading,  setLoading]  = useState(false)

  useEffect(() => { getRutas().then(setRutas) }, [])
  useEffect(() => {
    if (!rutaId) return
    getParadas(rutaId).then(p => { setParadas(p); setParadaId('') })
  }, [rutaId])

  const cargar = useCallback(async () => {
    if (!rutaId || !paradaId) return
    setLoading(true)
    try { setEtas(await getETARuta(rutaId, paradaId)) }
    catch { setEtas([]) }
    finally { setLoading(false) }
  }, [rutaId, paradaId])

  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 10000)
    return () => clearInterval(id)
  }, [cargar])

  return (
    <div>
      <h2 className="page-title">⏱️ Tiempos de llegada</h2>
      <div className="card">
        <div className="eta-controls">
          <div>
            <label className="form-label">Ruta</label>
            <select className="form-input form-select" value={rutaId} onChange={e => setRutaId(e.target.value)}>
              <option value="">Seleccionar ruta...</option>
              {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Parada</label>
            <select className="form-input form-select" value={paradaId} onChange={e => setParadaId(e.target.value)} disabled={!rutaId}>
              <option value="">Seleccionar parada...</option>
              {paradas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={cargar} disabled={!rutaId || !paradaId}>Actualizar</button>
          </div>
        </div>
      </div>

      {loading && <div className="spinner">Calculando ETAs...</div>}

      {!loading && etas.length === 0 && rutaId && paradaId && (
        <div className="empty-state"><div className="empty-icon">🚌</div><p className="empty-text">No hay micros activos en esta ruta ahora</p></div>
      )}

      <div className="eta-list">
        {etas.map((e, i) => (
          <div key={i} className="eta-item">
            <span className="eta-icon">🚌</span>
            <div className="eta-info">
              <div className="eta-nombre">Micro #{e.micro_id}</div>
              <div className="eta-detail">
                <span className={`badge badge-${OCUP_COLOR[e.ocupacion] || 'gray'}`}>{e.ocupacion || 'desconocido'}</span>
                {' '}{e.distancia_km ? `· ${e.distancia_km.toFixed(1)} km` : ''}
              </div>
            </div>
            <div className="eta-tiempo">{e.eta_minutos != null ? `${Math.round(e.eta_minutos)} min` : '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
