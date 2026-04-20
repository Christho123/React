/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  authLogin,
  authLogout,
  authRegister,
  readStoredSession,
  saveStoredSession,
} from '../services/api.js'

const AuthContext = createContext(null)

function normalizeSession(session) {
  if (!session) {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
    }
  }

  return {
    user: session.user ?? null,
    accessToken: session.accessToken ?? null,
    refreshToken: session.refreshToken ?? null,
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() =>
    normalizeSession(readStoredSession()),
  )

  useEffect(() => {
    const handleSessionUpdated = (event) => {
      setSession(normalizeSession(event.detail))
    }

    const handleLogout = () => {
      setSession(normalizeSession(null))
    }

    window.addEventListener('auth:session-updated', handleSessionUpdated)
    window.addEventListener('auth:logout', handleLogout)

    return () => {
      window.removeEventListener('auth:session-updated', handleSessionUpdated)
      window.removeEventListener('auth:logout', handleLogout)
    }
  }, [])

  const value = useMemo(() => {
    const updateSession = (nextSession) => {
      const normalized = normalizeSession(nextSession)
      setSession(normalized)
      saveStoredSession(normalized.accessToken ? normalized : null)
      return normalized
    }

    return {
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      isAuthenticated: Boolean(session.accessToken),
      async login(credentials) {
        const response = await authLogin(credentials)
        const payload = response?.data ?? response ?? {}
        const nextSession = {
          user:
            payload?.user ??
            (payload?.id
              ? {
                  id: payload.id,
                  name: payload.name ?? '',
                  email: payload.email ?? '',
                }
              : null),
          accessToken: payload?.access_token ?? payload?.accessToken ?? null,
          refreshToken: payload?.refresh_token ?? payload?.refreshToken ?? null,
        }

        updateSession(nextSession)
        return response
      },
      async register(credentials) {
        return authRegister(credentials)
      },
      async logout() {
        try {
          await authLogout()
        } finally {
          updateSession(null)
        }
      },
      setSession: updateSession,
    }
  }, [session.accessToken, session.refreshToken, session.user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.')
  }

  return context
}
