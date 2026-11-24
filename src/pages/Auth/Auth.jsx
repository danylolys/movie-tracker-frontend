import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useAuth from '../../context/useAuth'

import styles from './Auth.module.css'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
        navigate('/')
      } else {
        const data = await register(email, password)

        setMessage(data.message || 'Реєстрація успішна')

        setIsLogin(true)
        setPassword('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const changeMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setMessage('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>
          {isLogin ? 'Вхід' : 'Реєстрація'}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введіть email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Пароль</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введіть пароль"
              required
            />
          </div>

          {error && (
            <p className={styles.error}>{error}</p>
          )}

          {message && (
            <p className={styles.success}>{message}</p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading
              ? 'Зачекайте...'
              : isLogin
                ? 'Увійти'
                : 'Зареєструватися'}
          </button>
        </form>

        <div className={styles.switchMode}>
          {isLogin
            ? 'Ще не маєте акаунта?'
            : 'Вже маєте акаунт?'}

          <button type="button" onClick={changeMode}>
            {isLogin ? 'Зареєструватися' : 'Увійти'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth