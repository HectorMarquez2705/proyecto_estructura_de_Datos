import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getNotificaciones, marcarLeida, marcarTodasLeidas } from '../../services/notifService'

const TIPO_COLOR = { desvio: 'red', retraso: 'amber', info: 'blue' }

export default function NotificacionesScreen() {
  const { user }   = useAuth()
  const [notifs,   setNotifs]   = useState([])
  const [loading,  setLoading]  = useState(true)

  async function cargar() {
    try { setNotifs(await getNotificaciones(user?.sub)) }
    catch { setNotifs([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user?.sub) cargar() }, [user])

  async function handleLeer(id) {
    await marcarLeida(id)
    setNotifs(p => p.map(n => n.id === id ? { ...n, leida: true } : n))
  }

  async function handleTodasLeidas() {
    await marcarTodasLeidas(user?.sub)
    setNotifs(p => p.map(n => ({ ...n, leida: true })))
  }

  if (loading) return <div className="spinner">Cargando notificaciones...</div>

  const nuevas = notifs.filter(n => !n.leida).length

  return (
    <div>
      <div className="section-header">
        <h2 className="page-title" style={{ margin: 0 }}>🔔 Notificaciones {nuevas > 0 && <span className="badge badge-red">{nuevas} nuevas</span>}</h2>
        {nuevas > 0 && (
          <button className="btn btn-outline btn-sm" onClick={handleTodasLeidas}>Marcar todas leídas</button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔕</div>
          <p className="empty-text">No hay notificaciones</p>
        </div>
      ) : (
        notifs.map(n => (
          <div key={n.id} className={`notif-item${!n.leida ? ' nueva' : ''}`} onClick={() => !n.leida && handleLeer(n.id)}>
            <div className="notif-header">
              {!n.leida && <div className="notif-dot" />}
              <span className={`badge badge-${TIPO_COLOR[n.tipo] || 'gray'}`}>{n.tipo}</span>
              {!n.leida && <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, marginLeft: 'auto' }}>Click para marcar leída</span>}
            </div>
            <div className="notif-mensaje">{n.mensaje}</div>
            <div className="notif-fecha">{new Date(n.created_at).toLocaleString('es-BO')}</div>
          </div>
        ))
      )}
    </div>
  )
}
