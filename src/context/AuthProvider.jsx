
import { useState } from 'react'

import AuthContext from './AuthContext'

const API_URL = 'http://localhost:5194/api'

function getTokenPayload(token) {
  if (!token) return null

  try {
    return JSON.parse(
      atob(
        token.split('.')[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/')
      )
    )
  } catch {
    return null
  }
}

function getUserIdFromToken(token) {
  const payload = getTokenPayload(token)

  return (
    payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    payload?.nameid ||
    payload?.sub ||
    payload?.userId ||
    null
  )
}

function getRoleFromToken(token) {
  const payload = getTokenPayload(token)

  if (!payload) return null

  return (
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    payload.role ||
    payload.roles ||
    null
  )
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('token')
  )

  const userId = getUserIdFromToken(token)
  const role = getRoleFromToken(token)

  const isAdmin = Array.isArray(role)
    ? role.includes('Administrator')
    : role === 'Administrator'

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        data.message || data.error || 'Помилка авторизації'
      )
    }

    localStorage.setItem('token', data.token)
    setToken(data.token)
  }

  const register = async (email, password) => {
    const response = await fetch(`${API_URL}/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        data.message || data.error || 'Помилка реєстрації'
      )
    }

    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        role,
        isAdmin,
        isAuthenticated: !!token,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider