import { Link, NavLink } from 'react-router'
import styles from './Header.module.css'

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
    </header>
  )
}
