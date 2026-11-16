import { NavLink } from 'react-router-dom'

import styles from './Header.module.css'

function Header() {
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
      </nav>
    </header>
  )
}

export default Header