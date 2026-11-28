import { Link } from 'react-router'
import { JobListings } from '../components/JobListings'
import { Pagination } from '../components/Pagination'
import { useSavedJobs, type SavedTab } from '../hooks/useSavedJobs'
import styles from './Saved.module.css'

const TABS: { value: SavedTab; label: string; empty: string }[] = [
  {
    value: 'favorites',
    label: 'Favoritos',
    empty: 'Aún no tienes favoritos. Marca una oferta con el corazón para verla aquí.',
  },
  {
    value: 'applications',
    label: 'Candidaturas',
    empty: 'Aún no has aplicado a ninguna oferta.',
  },
]

export default function SavedPage() {
  const { tab, currentPage, jobs, totalPages, loading, isEmpty, failed, retry } = useSavedJobs()
  const activeTab = TABS.find(({ value }) => value === tab)!

  return (
    <main className={styles.page}>
      <title>{`${activeTab.label} - DevJobs`}</title>

      <h1 className={styles.heading}>Guardados</h1>

      <nav className={styles.tabs} aria-label="Guardados">
        {TABS.map(({ value, label }) => (
          <Link
            key={value}
            to={value === 'favorites' ? '/saved' : `/saved?tab=${value}`}
            aria-current={value === tab ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>

      {failed ? (
        <div className={styles.message} role="alert">
          <p>No se han podido cargar las ofertas. Inténtalo de nuevo.</p>
          <button onClick={retry}>Reintentar</button>
        </div>
      ) : isEmpty ? (
        <div className={styles.message}>
          <p>{activeTab.empty}</p>
          <Link to="/search" className={styles.link}>
            Buscar empleos
          </Link>
        </div>
      ) : jobs.length === 0 ? (
        <p className={styles.message}>Cargando...</p>
      ) : (
        <>
          <div className={loading ? styles.resultsLoading : styles.results} aria-busy={loading}>
            <JobListings jobs={jobs} />
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </main>
  )
}
