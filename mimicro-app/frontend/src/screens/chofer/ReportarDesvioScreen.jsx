import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getToken } from '../../services/authService'
import { reportarDesvio } from '../../services/notifService'
import { getRutas } from '../../services/rutasService'
import Toast from '../../components/Toast'

export default function ReportarDesvioScreen() {
  const { user }        = useAuth()
  const [rutas,        setRutas]        = useState([])
  const [rutaId,       setRutaId]       = useState('')
  const [descripcion,  setDescripcion]  = useState('')
  const [loading,      setLoading]      = useState(false)
  const [toast,        setToast]        = useState(null)

  useEffect(() => {
    getRutas().then(r => {
      setRutas(r)
      if (r.length) setRutaId(String(r[0].id))
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!rutaId || !descripcion.trim()) return setToast({ mensaje: 'Completá todos los campos', tipo: 'error' })
    setLoading(true)
    try {
      await reportarDesvio(parseInt(rutaId), descripcion.trim())
      setToast({ mensaje: 'Desvío reportado. Se notificó a los pasajeros.', tipo: 'success' })
      setDescripcion('')
    } catch (e) {
      setToast({ mensaje: e.message, tipo: 'error' })
    } finally { setLoading(false) }
  }

  return (
    <div>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}
      <h2 className="page-title">⚠️ Reportar desvío o incidente</h2>
      <div className="card">
        <p style={{ color: 'var(--text-sec)', marginBottom: 20 }}>
          Este reporte se enviará como notificación a todos los pasajeros que viajaron en esta ruta recientemente.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ruta afectada</label>
            <select className="form-input form-select" value={rutaId} onChange={e => setRutaId(e.target.value)}>
              {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción del desvío o incidente</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Ej: Hay un corte en la Av. Roca y Coronado, tomamos ruta alternativa por la calle 3..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={5}
            />
          </div>
          <button className="btn btn-warning btn-full" type="submit" disabled={loading}>
            {loading ? 'Enviando...' : '📢 Enviar notificación a pasajeros'}
          </button>
        </form>
      </div>
    </div>
  )
}
