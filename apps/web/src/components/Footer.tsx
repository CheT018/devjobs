const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer>
      <small>
        &copy; {CURRENT_YEAR} DevJobs. Proyecto de portafolio: las ofertas son de ejemplo.
      </small>
    </footer>
  )
}
