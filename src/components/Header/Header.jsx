import { NavLink, useNavigate } from 'react-router-dom'

import useAuth from '../../context/useAuth'

import styles from './Header.module.css'

function Header() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className={styles.container}>
      <nav className={styles.nav}>
        <NavLink to="/" end className={({ isActive }) =>
          isActive ? styles.active : ''
        }>
          Головна
        </NavLink>

        <NavLink to="/movies" className={({ isActive }) =>
          isActive ? styles.active : ''
        }>
          Фільми
        </NavLink>

        <NavLink to="/series" className={({ isActive }) =>
          isActive ? styles.active : ''
        }>
          Серіали
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) =>
          isActive ? styles.active : ''
        }>
          Профіль
        </NavLink>
        <NavLink to="/watchlist" className={({ isActive }) =>
          isActive ? styles.active : ''
        }>
          Мій список
        </NavLink>
      </nav>

      <div className={styles.auth}>
        {isAuthenticated ? (
          <button onClick={handleLogout}>
            Вийти
          </button>
        ) : (
          <NavLink
            to="/auth"
            className={({ isActive }) =>
              isActive ? styles.active : ''
            }
          >
            Увійти
          </NavLink>
        )}
      </div>
    </header>
  )
}

export default Header