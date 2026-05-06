import { useState, useEffect } from 'react'
import { getMicros, crearMicro } from '../../services/notifService'
import { getRutas } from '../../services/rutasService'
import Toast from '../../components/Toast'

const OCUP_COL = { vacio: 'green', medio: 'amber', lleno: 'red' }
const EST_COL  = { activo: 'green', inactivo: 'gray', mantenimiento: 'amber' }

export default function GestionMicrosScreen() {
  const [micros,  setMicros]  = useState([])
  const [rutas,   setRutas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ placa: '', capacidad: 40, ruta_id: '', chofer_id: '' })
  const [toast,   setToast]   = useState(null)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    Promise.all([getMicros(), getRutas()])
      .then(([m, r]) => { setMicros(Array.isArray(m) ? m : []); setRutas(r) })
      .finally(() => setLoading(false))
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleCrear(e) {
    e.preventDefault()
    if (!form.placa || !form.ruta_id) return setToast({ mensaje: 'Placa y ruta son obligatorios', tipo: 'error' })
    setSaving(true)
    try {
      const nuevo = await crearMicro({ placa: form.placa, capacidad: parseInt(form.capacidad), ruta_id: parseInt(form.ruta_id), chofer_id: form.chofer_id ? parseInt(form.chofer_id) : null })
      setMicros(p => [...p, nuevo])
      setModal(false); setForm({ placa: '', capacidad: 40, ruta_id: '', chofer_id: '' })
      setToast({ mensaje: 'Micro registrado correctamente', tipo: 'success' })
    } catch (e) {
      setToast({ mensaje: e.message, tipo: 'error' })
    } finally { setSaving(false) }
  }

  if (loading) return <div className="spinner">Cargando micros...</div>

  return (
    <div>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}
      <div className="section-header">
        <h2 className="page-title" style={{ margin: 0 }}>🚌 Gestión de micros</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nuevo micro</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Placa</th><th>Ruta</th><th>Capacidad</th><th>Ocupación</th><th>Estado</th></tr></thead>
            <tbody>
              {micros.map(m => (
                <tr key={m.id}>
                  <td style={{ color: 'var(--text-sec)' }}>#{m.id}</td>
                  <td><strong>{m.placa}</strong></td>
                  <td>{m.ruta_nombre || `Ruta #${m.ruta_id}`}</td>
                  <td>{m.capacidad} pasajeros</td>
                  <td><span className={`badge badge-${OCUP_COL[m.ocupacion_estado] || 'gray'}`}>{m.ocupacion_estado || 'desconocido'}</span></td>
                  <td><span className={`badge badge-${EST_COL[m.estado] || 'gray'}`}>{m.estado || 'inactivo'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {micros.length === 0 && <div className="empty-state"><div className="empty-icon">🚌</div><p className="empty-text">No hay micros registrados</p></div>}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Registrar micro</div>
            <form onSubmit={handleCrear}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Placa *</label>
                  <input className="form-input" placeholder="ABC-123" value={form.placa} onChange={set('placa')} autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacidad</label>
                  <input className="form-input" type="number" min="10" max="80" value={form.capacidad} onChange={set('capacidad')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ruta *</label>
                <select className="form-input form-select" value={form.ruta_id} onChange={set('ruta_id')}>
                  <option value="">Seleccionar...</option>
                  {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ID del chofer (opcional)</label>
                <input className="form-input" type="number" placeholder="ID del chofer asignado" value={form.chofer_id} onChange={set('chofer_id')} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
