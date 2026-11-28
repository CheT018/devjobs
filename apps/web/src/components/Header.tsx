import { Link, NavLink } from 'react-router'
import { useTheme } from '../hooks/useTheme'
import styles from './Header.module.css'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'

  return (
    <button className={styles.themeToggle} onClick={toggleTheme} aria-label={label} title={label}>
      <svg
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        {theme === 'light' ? (
          <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
        ) : (
          <>
            <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
            <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
          </>
        )}
      </svg>
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

      <nav className={styles.nav} aria-label="Principal">
        <NavLink
          to="/search"
          className={({ isActive }) => (isActive ? styles.active : undefined)}
        >
          Empleos
        </NavLink>
        <NavLink
          to="/saved"
          className={({ isActive }) => (isActive ? styles.active : undefined)}
        >
          Guardados
        </NavLink>
        <ThemeToggle />
      </nav>
    </header>
  )
}
