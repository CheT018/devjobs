import styles from './Footer.module.css'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className={styles.footer}>
      <small className={styles.text}>
        &copy; {CURRENT_YEAR} DevJobs. Proyecto de portafolio: las ofertas son de ejemplo.
      </small>
    </footer>
  )
}
