import { useState, useEffect } from 'react'
import { getRutas, getParadas, crearRuta, eliminarRuta } from '../../services/rutasService'
import Toast from '../../components/Toast'

export default function GestionRutasScreen() {
  const [rutas,   setRutas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ nombre: '', descripcion: '', tarifa: '' })
  const [toast,   setToast]   = useState(null)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    getRutas().then(setRutas).finally(() => setLoading(false))
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleCrear(e) {
    e.preventDefault()
    if (!form.nombre) return setToast({ mensaje: 'El nombre es obligatorio', tipo: 'error' })
    setSaving(true)
    try {
      const nueva = await crearRuta({ nombre: form.nombre, descripcion: form.descripcion, tarifa: parseFloat(form.tarifa) || 2.5 })
      setRutas(p => [...p, nueva])
      setModal(false); setForm({ nombre: '', descripcion: '', tarifa: '' })
      setToast({ mensaje: 'Ruta creada correctamente', tipo: 'success' })
    } catch (e) {
      setToast({ mensaje: e.message, tipo: 'error' })
    } finally { setSaving(false) }
  }

  async function handleEliminar(id, nombre) {
    if (!confirm(`¿Eliminar la ruta "${nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarRuta(id)
      setRutas(p => p.filter(r => r.id !== id))
      setToast({ mensaje: 'Ruta eliminada', tipo: 'info' })
    } catch (e) {
      setToast({ mensaje: e.message, tipo: 'error' })
    }
  }

  if (loading) return <div className="spinner">Cargando rutas...</div>

  return (
    <div>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}
      <div className="section-header">
        <h2 className="page-title" style={{ margin: 0 }}>🗺️ Gestión de rutas</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nueva ruta</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Tarifa</th><th>Acciones</th></tr></thead>
            <tbody>
              {rutas.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-sec)' }}>#{r.id}</td>
                  <td><strong>{r.nombre}</strong></td>
                  <td>{r.descripcion || '—'}</td>
                  <td>Bs {parseFloat(r.tarifa || 0).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(r.id, r.nombre)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rutas.length === 0 && <div className="empty-state"><div className="empty-icon">🗺️</div><p className="empty-text">No hay rutas registradas</p></div>}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Nueva ruta</div>
            <form onSubmit={handleCrear}>
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input className="form-input" placeholder="Ej: Ruta 17 — Centro" value={form.nombre} onChange={set('nombre')} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input className="form-input" placeholder="Recorrido o zona" value={form.descripcion} onChange={set('descripcion')} />
              </div>
              <div className="form-group">
                <label className="form-label">Tarifa (Bs)</label>
                <input className="form-input" type="number" step="0.5" min="0" placeholder="2.50" value={form.tarifa} onChange={set('tarifa')} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear ruta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
