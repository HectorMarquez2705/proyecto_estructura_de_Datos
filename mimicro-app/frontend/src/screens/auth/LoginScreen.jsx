import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../services/authService'

export default function LoginScreen() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const { login: setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return setError('Completá todos los campos')
    setError('')
    setLoading(true)
    try {
      const data = await login(email.trim().toLowerCase(), password)
      setUser(data.token)
      if (data.rol === 'admin')  navigate('/admin/usuarios')
      else if (data.rol === 'chofer') navigate('/chofer/ruta')
      else navigate('/pasajero/mapa')
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
        <h1 className="auth-title">miMicro</h1>
        <p className="auth-subtitle">Transporte inteligente de Santa Cruz de la Sierra</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="correo@ejemplo.com"
              value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}
            style={{ marginTop: 8 }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-link">
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </div>
    </div>
  )
}
