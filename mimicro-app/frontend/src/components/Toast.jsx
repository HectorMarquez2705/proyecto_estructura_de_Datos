import { useEffect } from 'react'

const COLORES = { desvio: '#C62828', retraso: '#E65100', info: '#1565C0', error: '#C62828', success: '#2E7D32' }

export default function Toast({ mensaje, tipo = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), 4500)
    return () => clearTimeout(t)
  }, [mensaje])

  if (!mensaje) return null

  return (
    <div className="toast" style={{ background: COLORES[tipo] || '#333' }}>
      <span style={{ flex: 1 }}>{mensaje}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  )
}
