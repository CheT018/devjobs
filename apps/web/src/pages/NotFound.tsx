import { Link } from 'react-router'
import styles from './NotFound.module.css'

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <title>Página no encontrada - DevJobs</title>

      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <Link to="/" className={styles.link}>
        Volver al inicio
      </Link>
    </main>
  )
}
