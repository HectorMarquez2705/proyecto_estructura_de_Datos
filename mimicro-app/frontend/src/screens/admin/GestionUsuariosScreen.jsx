import { useState, useEffect } from 'react'
import { getUsuarios, cambiarRol } from '../../services/authService'
import Toast from '../../components/Toast'

const ROLES   = ['pasajero', 'chofer', 'admin', 'suspendido']
const COLORES = { pasajero: 'blue', chofer: 'green', admin: 'purple', suspendido: 'red' }

export default function GestionUsuariosScreen() {
  const [usuarios, setUsuarios] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [toast,    setToast]    = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    getUsuarios().then(setUsuarios).catch(() => setUsuarios([])).finally(() => setLoading(false))
  }, [])

  async function handleRol(userId, nuevoRol) {
    try {
      await cambiarRol(userId, nuevoRol)
      setUsuarios(p => p.map(u => u.id === userId ? { ...u, rol: nuevoRol } : u))
      setToast({ mensaje: 'Rol actualizado correctamente', tipo: 'success' })
    } catch (e) {
      setToast({ mensaje: e.message, tipo: 'error' })
    }
  }

  const filtrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return <div className="spinner">Cargando usuarios...</div>

  return (
    <div>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}
      <div className="section-header">
        <h2 className="page-title" style={{ margin: 0 }}>👤 Gestión de usuarios</h2>
        <span className="badge badge-purple">{usuarios.length} usuarios</span>
      </div>

      <div className="card">
        <input className="form-input" placeholder="🔍 Buscar por nombre o email..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          style={{ marginBottom: 16 }} />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Rol</th><th>Cambiar rol</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-sec)' }}>#{u.id}</td>
                  <td><strong>{u.nombre}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.telefono || '—'}</td>
                  <td><span className={`badge badge-${COLORES[u.rol] || 'gray'}`}>{u.rol}</span></td>
                  <td>
                    <select className="form-input form-select" value={u.rol}
                      onChange={e => handleRol(u.id, e.target.value)}
                      style={{ width: 'auto', padding: '5px 28px 5px 10px', fontSize: 12 }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <div className="empty-state"><div className="empty-icon">🔍</div><p className="empty-text">Sin resultados</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
