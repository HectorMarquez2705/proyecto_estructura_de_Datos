import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { register } from '../../services/authService'

export default function RegisterScreen() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' })
  const [rol,     setRol]     = useState('pasajero')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const { login: setUser } = useAuth()
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const { nombre, email, password, telefono } = form
    if (!nombre || !email || !password) return setError('Completá los campos obligatorios')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    setError('')
    setLoading(true)
    try {
      const data = await register(nombre, email.trim().toLowerCase(), password, rol, telefono)
      setUser(data.token)
      navigate(rol === 'chofer' ? '/chofer/ruta' : '/pasajero/mapa')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🚌</div>
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-subtitle">Elegí tu rol para continuar</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="role-btns">
          <button type="button" className={`role-btn${rol === 'pasajero' ? ' active' : ''}`}
            onClick={() => setRol('pasajero')}>🧍 Pasajero</button>
          <button type="button" className={`role-btn${rol === 'chofer' ? ' active' : ''}`}
            onClick={() => setRol('chofer')}>🚌 Chofer</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre completo *</label>
            <input className="form-input" placeholder="Juan Pérez" value={form.nombre} onChange={set('nombre')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña * (mín. 6 caracteres)</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono (opcional)</label>
            <input className="form-input" placeholder="+591 7XXXXXXX" value={form.telefono} onChange={set('telefono')} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
