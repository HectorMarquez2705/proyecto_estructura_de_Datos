import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTarjeta, recargar, getHistorial } from '../../services/pagosService'
import Toast from '../../components/Toast'

export default function TarjetaScreen() {
  const { user } = useAuth()
  const userId   = user?.sub

  const [tarjeta,   setTarjeta]   = useState(null)
  const [historial, setHistorial] = useState([])
  const [modal,     setModal]     = useState(false)
  const [monto,     setMonto]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [toast,     setToast]     = useState(null)

  async function cargar() {
    try {
      const [t, h] = await Promise.all([getTarjeta(userId), getHistorial(userId)])
      setTarjeta(t)
      setHistorial(Array.isArray(h) ? h.slice(0, 10) : [])
    } catch { /* saldo no disponible */ }
  }

  useEffect(() => { if (userId) cargar() }, [userId])

  async function handleRecargar(e) {
    e.preventDefault()
    if (!monto || parseFloat(monto) <= 0) return
    setLoading(true)
    try {
      await recargar(userId, monto)
      setToast({ mensaje: `Recarga de Bs ${monto} exitosa`, tipo: 'success' })
      setModal(false); setMonto('')
      cargar()
    } catch (err) {
      setToast({ mensaje: err.message, tipo: 'error' })
    } finally { setLoading(false) }
  }

  const qrUrl = tarjeta
    ? `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(tarjeta.numero)}`
    : null

  return (
    <div>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}
      <h2 className="page-title">💳 Mi Tarjeta</h2>

      {tarjeta ? (
        <div className="tarjeta-card">
          <div className="tarjeta-numero">N° {tarjeta.numero}</div>
          <div className="tarjeta-saldo-lbl">Saldo disponible</div>
          <div className="tarjeta-saldo">Bs {parseFloat(tarjeta.saldo).toFixed(2)}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className="tarjeta-nombre">{user?.nombre}</div>
            {qrUrl && <img src={qrUrl} alt="QR tarjeta" style={{ borderRadius: 6, background: '#fff', padding: 4 }} />}
          </div>
        </div>
      ) : (
        <div className="spinner">Cargando tarjeta...</div>
      )}

      <button className="btn btn-primary" onClick={() => setModal(true)} style={{ marginBottom: 20 }}>
        + Recargar saldo
      </button>

      <div className="card">
        <div className="card-title">📋 Últimas transacciones</div>
        {historial.length === 0
          ? <div className="empty-state"><div className="empty-icon">📄</div><p className="empty-text">Sin transacciones aún</p></div>
          : historial.map((t, i) => (
            <div key={i} className="hist-item">
              <span className="hist-icon">{t.tipo === 'recarga' ? '⬆️' : '⬇️'}</span>
              <div className="hist-info">
                <div className="hist-ruta">{t.tipo === 'recarga' ? 'Recarga' : `Pasaje - ${t.descripcion || 'viaje'}`}</div>
                <div className="hist-fecha">{new Date(t.fecha || t.created_at).toLocaleString('es-BO')}</div>
              </div>
              <div className="hist-monto" style={{ color: t.tipo === 'recarga' ? 'var(--green)' : 'var(--red)' }}>
                {t.tipo === 'recarga' ? '+' : '-'}Bs {parseFloat(t.monto).toFixed(2)}
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Recargar saldo</div>
            <form onSubmit={handleRecargar}>
              <div className="form-group">
                <label className="form-label">Monto (Bs)</label>
                <input className="form-input" type="number" min="1" step="0.5" placeholder="20.00"
                  value={monto} onChange={e => setMonto(e.target.value)} autoFocus />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Procesando...' : 'Recargar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
