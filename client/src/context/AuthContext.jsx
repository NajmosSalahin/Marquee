import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext.js'
import {
  fetchMe,
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
} from '../api/auth.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (user) {
      root.dataset.accent = user.preferences.accentColor
      root.dataset.density = user.preferences.density
    }
  }, [user])

  const login = useCallback(async (identifier, password) => {
    const u = await loginRequest(identifier, password)
    setUser(u)
  }, [])

  const register = useCallback(async (username, email, password) => {
    const u = await registerRequest(username, email, password)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest().catch(() => {})
    setUser(null)
  }, [])

  const updateUser = useCallback((u) => setUser(u), [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser }),
    [user, loading, login, register, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
