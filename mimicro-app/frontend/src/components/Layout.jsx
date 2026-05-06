import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children, nav, color, titulo }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className={`sidebar ${color}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">🚌 miMicro</div>
          <div className="sidebar-role">{titulo?.split('— ')[1] || ''}</div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-uname">{user?.nombre || user?.sub}</div>
            <div className="sidebar-email">{user?.rol}</div>
          </div>
          <button className="btn btn-outline btn-full btn-sm" onClick={handleLogout}
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title">{titulo}</span>
        </header>
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
