import { JobListings } from '../components/JobListings'
import { JobListingsSkeleton } from '../components/JobListingsSkeleton'
import { Pagination } from '../components/Pagination'
import { SearchFormSection } from '../components/SearchFormSection'
import { RESULTS_PER_PAGE } from '../constants/filters'
import { useJobSearch } from '../hooks/useJobSearch'
import styles from './Search.module.css'

export default function SearchPage() {
  const {
    text,
    filters,
    currentPage,
    jobs,
    total,
    totalPages,
    loading,
    failed,
    retry,
    setText,
    setFilters,
  } = useJobSearch()

  const isFirstLoad = loading && jobs.length === 0

  const title = loading
    ? 'Cargando... - DevJobs'
    : `Resultados: ${total}, Página ${currentPage} - DevJobs`

  return (
    <main>
      <title>{title}</title>
      <meta
        name="description"
        content="Explora ofertas de empleo del sector tecnológico y filtra por tecnología, ubicación, modalidad y nivel de experiencia."
      />

      <SearchFormSection
        text={text}
        filters={filters}
        onTextChange={setText}
        onFiltersChange={setFilters}
      />

      <section className={styles.section}>
        <h2 className={styles.heading}>Resultados de búsqueda</h2>

        {failed ? (
          <div className={styles.message} role="alert">
            <p>No se han podido cargar los empleos. Inténtalo de nuevo.</p>
            <button onClick={retry}>Reintentar</button>
          </div>
        ) : isFirstLoad ? (
          <div className={styles.results}>
            <JobListingsSkeleton count={RESULTS_PER_PAGE} label="Buscando empleos..." />
          </div>
        ) : (
          <div className={loading ? styles.resultsLoading : styles.results} aria-busy={loading}>
            <JobListings jobs={jobs} />
          </div>
        )}

        {!failed && <Pagination currentPage={currentPage} totalPages={totalPages} />}
      </section>
    </main>
  )
}
