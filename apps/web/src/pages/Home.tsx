import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import searchInput from '../styles/searchInput.module.css'
import styles from './Home.module.css'

export default function HomePage() {
  const navigate = useNavigate()

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const searchTerm = String(new FormData(event.currentTarget).get('search') ?? '').trim()

    navigate(searchTerm ? `/search?text=${encodeURIComponent(searchTerm)}` : '/search')
  }

  return (
    <main>
      <title>DevJobs - Empleos para desarrolladores</title>

      <section className={styles.hero}>
        <img className={styles.heroImage} src="/background.webp" alt="" width="200" />

        <h1 className={styles.title}>Encuentra el trabajo de tus sueños</h1>

        <p className={styles.lead}>
          Busca ofertas de desarrollo por tecnología, ubicación, modalidad y nivel de experiencia.
        </p>

        <form className={styles.form} role="search" onSubmit={handleSearch}>
          <div className={styles.searchBar}>
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
              <path d="M21 21l-6 -6" />
            </svg>

            <input
              className={searchInput.input}
              name="search"
              required
              type="search"
              aria-label="Buscar empleos"
              placeholder="Buscar empleos por título, habilidad o empresa"
            />

            <button type="submit">Buscar</button>
          </div>
        </form>
      </section>

      <section className={styles.features}>
        <header className={styles.featuresHeader}>
          <h2>Qué puedes hacer en DevJobs</h2>
          <p>
            Un portal de empleo para desarrolladores, pensado para encontrar rápido la oferta que
            encaja contigo.
          </p>
        </header>

        <footer className={styles.featureGrid}>
          <article className={styles.feature}>
            <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32" aria-hidden="true">
              <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.37V200ZM104,112a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,112Z" />
            </svg>
            <h3>Busca y filtra</h3>
            <p>Busca por título, empresa o tecnología y filtra por ubicación, modalidad y nivel.</p>
          </article>

          <article className={styles.feature}>
            <svg
              aria-hidden="true"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
            </svg>
            <h3>Guarda tus favoritos</h3>
            <p>Marca las ofertas que te interesan; siguen ahí cuando vuelves.</p>
          </article>

          <article className={styles.feature}>
            <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32" aria-hidden="true">
              <path d="M240,208H224V96a16,16,0,0,0-16-16H144V32a16,16,0,0,0-24.88-13.32L39.12,72A16,16,0,0,0,32,85.34V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM208,96V208H144V96ZM48,85.34,128,32V208H48ZM112,112v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm-32,0v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm0,56v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm32,0v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Z" />
            </svg>
            <h3>Conoce el puesto</h3>
            <p>Cada oferta detalla responsabilidades, requisitos y la empresa.</p>
          </article>
        </footer>
      </section>
    </main>
  )
}
