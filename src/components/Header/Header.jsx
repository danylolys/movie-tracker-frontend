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

  const getNavClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link

  return (
    <header className={styles.container}>
      <div className={styles.headerContent}>
        <NavLink to="/" className={styles.logo}>
          Movie<span>Tracker</span>
        </NavLink>

        <nav className={styles.nav}>
          <NavLink to="/" end className={getNavClass}>
            Головна
          </NavLink>

          <NavLink to="/movies" className={getNavClass}>
            Фільми
          </NavLink>

          <NavLink to="/series" className={getNavClass}>
            Серіали
          </NavLink>
        </nav>

        <div className={styles.auth}>
          {isAuthenticated ? (
            <>
              <NavLink to="/watchlist" className={getNavClass}>
                Мій список
              </NavLink>

              <NavLink to="/profile" className={getNavClass}>
                Профіль
              </NavLink>

              <button
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                Вийти
              </button>
            </>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                `${styles.loginButton} ${isActive ? styles.loginActive : ''}`
              }
            >
              Увійти
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header