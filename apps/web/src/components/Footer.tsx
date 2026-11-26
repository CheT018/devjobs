const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer>
      <small>&copy; {CURRENT_YEAR} DevJobs. Todos los derechos reservados.</small>
    </footer>
  )
}
