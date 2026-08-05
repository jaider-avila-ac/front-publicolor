import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('auth'))
    } catch {
      return null
    }
  })

  const login = (data) => {
    setUser(data)
    localStorage.setItem('auth', JSON.stringify(data))
  }

  const logout = () => {
    localStorage.removeItem('auth')
    setUser(null)
  }

  useEffect(() => {
    const handler = () => {
      logout()
      window.location.replace('/login')
    }
    window.addEventListener('auth:expired', handler)
    return () => window.removeEventListener('auth:expired', handler)
  }, [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
