/**
 * Updated AuthContext.jsx — uses real backend API
 * Replace: src/context/AuthContext.jsx
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'stc_token'
const USER_KEY  = 'stc_user'

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(loadUser)
  const [loading, setLoading] = useState(false)

  const persist = (userData, token) => {
    setUser(userData)
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      if (token) localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  // Validate token on app load
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    authAPI.getMe()
      .then(res => persist(res.data.user, token))
      .catch(() => persist(null))
  }, [])

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      persist(res.data.user, res.data.token)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (name, email, password) => {
    setLoading(true)
    try {
      const res = await authAPI.register({ name, email, password })
      persist(res.data.user, res.data.token)
    } finally {
      setLoading(false)
    }
  }

  const socialSignIn = async (email, name, uid) => {
    setLoading(true)
    try {
      const res = await authAPI.socialLogin({ email, name, uid })
      persist(res.data.user, res.data.token)
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => persist(null)

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    persist(updated, localStorage.getItem(TOKEN_KEY))
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, socialSignIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
