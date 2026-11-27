import { Link, NavLink } from 'react-router'
import { useAuthStore } from '../store/authStore'
import styles from './Header.module.css'

function HeaderUserButton() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  return isLoggedIn ? (
    <button onClick={logout} className={styles.btnLogin}>
      Cerrar sesión
    </button>
  ) : (
    <button onClick={login} className={styles.btnLogin}>
      Iniciar sesión
    </button>
  )
}

export function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <svg
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        DevJobs
      </Link>

      <nav aria-label="Principal">
        <NavLink
          to="/search"
          className={({ isActive }) => (isActive ? styles.navLinkActive : undefined)}
        >
          Empleos
        </NavLink>
      </nav>

      <HeaderUserButton />
    </header>
  )
}
