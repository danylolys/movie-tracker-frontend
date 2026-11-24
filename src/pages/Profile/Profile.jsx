import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useAuth from '../../context/useAuth'
import { apiFetch } from '../../services/api'

import styles from './Profile.module.css'

function getUserId(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

    const decoded = atob(base64)
    const bytes = Uint8Array.from(
      decoded,
      char => char.charCodeAt(0)
    )

    const data = JSON.parse(
      new TextDecoder().decode(bytes)
    )

    return (
      data.nameid ||
      data.sub ||
      data['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    )
  } catch {
    return null
  }
}

function Profile() {
  const { token, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const userId = token ? getUserId(token) : null

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return
    }

    let cancelled = false

    const fetchUser = async () => {
      try {
        const response = await apiFetch(`/Users/${userId}`)

        if (!response.ok) {
          throw new Error('Не вдалося завантажити профіль.')
        }

        const data = await response.json()

        if (!cancelled) {
          setUser(data)
          setUsername(data.username)
          setEmail(data.email)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, userId])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (saving || !userId) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiFetch(`/Users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: username,
          email: email
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Не вдалося оновити профіль.'
        )
      }

      setUser(data)
      setUsername(data.username)
      setEmail(data.email)

      setSuccess('Профіль успішно оновлено.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!isAuthenticated) {
    return null
  }

  if (!userId) {
    return (
      <div className={styles.message}>
        Не вдалося отримати ID користувача.
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.message}>
        Завантаження профілю...
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className={styles.message}>
        {error}
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className={styles.profile}>
      <div className={styles.container}>
        <h1 className={styles.title}>Мій профіль</h1>

        <section className={styles.card}>
          <div className={styles.header}>
            <div className={styles.avatar}>
              {username.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{user.username}</h2>
              <p>{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <h3>Особиста інформація</h3>

            <div className={styles.field}>
              <label htmlFor="username">
                Ім'я користувача
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className={styles.error}>{error}</p>
            )}

            {success && (
              <p className={styles.success}>{success}</p>
            )}

            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              {saving ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </form>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              Вийти з акаунта
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Profile