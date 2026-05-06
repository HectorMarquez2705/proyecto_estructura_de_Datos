import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getToken } from '../../services/authService'
import Toast from '../../components/Toast'

const OPCIONES = [
  { valor: 'vacio', label: 'Vacío',  emoji: '😊', clase: 'vacio', desc: 'Menos del 40% de capacidad' },
  { valor: 'medio', label: 'Medio',  emoji: '😐', clase: 'medio', desc: 'Entre 40% y 80% de capacidad' },
  { valor: 'lleno', label: 'Lleno',  emoji: '😓', clase: 'lleno', desc: 'Más del 80% de capacidad' },
]

export default function ReportarOcupacionScreen() {
  const { user }   = useAuth()
  const [toast,    setToast]    = useState(null)
  const [ultimo,   setUltimo]   = useState(null)
  const [loading,  setLoading]  = useState(false)

  async function reportar(ocupacion) {
    setLoading(true)
    try {
      const token  = getToken()
      const userId = user?.sub
      const res    = await fetch('/micros', { headers: { Authorization: `Bearer ${token}` } })
      const micros = await res.json()
      const mi     = micros.find(m => m.chofer_id === parseInt(userId))
      if (!mi) throw new Error('No tenés un micro asignado')

      await fetch(`/micros/${mi.id}/ocupacion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ocupacion_estado: ocupacion }),
      })
      setUltimo(ocupacion)
      setToast({ mensaje: `Ocupación reportada: ${ocupacion}`, tipo: 'success' })
    } catch (e) {
      setToast({ mensaje: e.message, tipo: 'error' })
    } finally { setLoading(false) }
  }

  return (
    <div>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}
      <h2 className="page-title">👥 Reportar ocupación</h2>
      <div className="card">
        <p style={{ color: 'var(--text-sec)', marginBottom: 8 }}>
          Seleccioná el nivel actual de pasajeros en tu micro:
        </p>
        {ultimo && (
          <div className="ocup-confirm">
            ✅ Último reporte: <strong>{ultimo}</strong>
          </div>
        )}
        <div className="ocup-grid" style={{ marginTop: 20 }}>
          {OPCIONES.map(op => (
            <button key={op.valor} className={`ocup-btn ${op.clase}`}
              onClick={() => reportar(op.valor)} disabled={loading}>
              <span className="ocup-emoji">{op.emoji}</span>
              <span className="ocup-label">{op.label}</span>
              <span style={{ fontSize: 11, opacity: 0.85 }}>{op.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
