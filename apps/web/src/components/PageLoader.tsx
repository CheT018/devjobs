import styles from './PageLoader.module.css'

export function PageLoader() {
  return (
    <div className={styles.container} role="status">
      <div className={styles.spinner} />
      <p className={styles.text}>Cargando contenido...</p>
    </div>
  )
}
