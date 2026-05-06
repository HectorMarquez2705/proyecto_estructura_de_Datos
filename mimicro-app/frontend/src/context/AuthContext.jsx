import { createContext, useContext, useState, useCallback } from 'react'

const AuthCtx = createContext(null)

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('mimicro_token')
    if (!token) return null
    const payload = decodeToken(token)
    if (!payload) return null
    return { token, ...payload }
  })

  const login = useCallback((token) => {
    localStorage.setItem('mimicro_token', token)
    const payload = decodeToken(token)
    setUser({ token, ...payload })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('mimicro_token')
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
