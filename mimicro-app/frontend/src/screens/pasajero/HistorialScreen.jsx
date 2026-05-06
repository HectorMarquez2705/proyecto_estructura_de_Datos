import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getToken } from '../../services/authService'

export default function HistorialScreen() {
  const { user }    = useAuth()
  const [viajes,   setViajes]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`/gps/historial/${user?.sub}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        const data = await res.json()
        setViajes(Array.isArray(data) ? data : [])
      } catch { setViajes([]) }
      finally { setLoading(false) }
    }
    if (user?.sub) cargar()
  }, [user])

  if (loading) return <div className="spinner">Cargando historial...</div>

  return (
    <div>
      <h2 className="page-title">📋 Historial de viajes</h2>
      {viajes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚌</div>
          <p className="empty-text">No hay viajes registrados aún</p>
        </div>
      ) : (
        viajes.map((v, i) => (
          <div key={i} className="hist-item">
            <span className="hist-icon">🚌</span>
            <div className="hist-info">
              <div className="hist-ruta">Ruta #{v.ruta_id || v.rutaId || '—'}</div>
              <div className="hist-fecha">
                {v.fecha_inicio
                  ? new Date(v.fecha_inicio).toLocaleString('es-BO')
                  : v.timestamp
                  ? new Date(v.timestamp).toLocaleString('es-BO')
                  : 'Fecha no disponible'}
              </div>
            </div>
            {v.monto_cobrado != null && (
              <div className="hist-monto">Bs {parseFloat(v.monto_cobrado).toFixed(2)}</div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
