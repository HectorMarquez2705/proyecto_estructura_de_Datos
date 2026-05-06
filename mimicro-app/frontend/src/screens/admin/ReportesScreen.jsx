import { useState, useEffect } from 'react'
import { getLogs } from '../../services/authService'
import { getRutas } from '../../services/rutasService'
import { getMicros } from '../../services/notifService'
import { getUsuarios } from '../../services/authService'

const NIVEL_COL = { INFO: 'blue', WARNING: 'amber', ERROR: 'red' }

export default function ReportesScreen() {
  const [stats,   setStats]   = useState({ usuarios: 0, rutas: 0, micros: 0, activos: 0 })
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getUsuarios(), getRutas(), getMicros(), getLogs(50)])
      .then(([u, r, m, l]) => {
        const micros = Array.isArray(m) ? m : []
        setStats({
          usuarios: u.length,
          rutas:    r.length,
          micros:   micros.length,
          activos:  micros.filter(x => x.estado === 'activo').length,
        })
        setLogs(Array.isArray(l) ? l.reverse() : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner">Cargando reportes...</div>

  return (
    <div>
      <h2 className="page-title">📊 Reportes y estadísticas</h2>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Usuarios registrados</div><div className="stat-value blue">{stats.usuarios}</div></div>
        <div className="stat-card"><div className="stat-label">Rutas activas</div><div className="stat-value green">{stats.rutas}</div></div>
        <div className="stat-card"><div className="stat-label">Micros en flota</div><div className="stat-value amber">{stats.micros}</div></div>
        <div className="stat-card"><div className="stat-label">Micros en ruta ahora</div><div className="stat-value red">{stats.activos}</div></div>
      </div>

      <div className="card">
        <div className="card-title">🔐 Registro de seguridad (últimas 50 entradas)</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Timestamp</th><th>Nivel</th><th>Evento</th><th>Usuario</th><th>IP</th></tr></thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-sec)', fontSize: 12 }}>
                    {new Date(l.timestamp).toLocaleString('es-BO')}
                  </td>
                  <td><span className={`badge badge-${NIVEL_COL[l.nivel] || 'gray'}`}>{l.nivel}</span></td>
                  <td>{l.evento}</td>
                  <td>{l.usuario || '—'}</td>
                  <td style={{ color: 'var(--text-sec)', fontSize: 12 }}>{l.ip || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <div className="empty-state"><div className="empty-icon">📋</div><p className="empty-text">No hay logs de seguridad</p></div>}
        </div>
      </div>
    </div>
  )
}
