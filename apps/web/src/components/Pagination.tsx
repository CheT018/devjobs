import { Link, useLocation, useSearchParams } from 'react-router'
import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

const MAX_ITEMS = 7

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

// Siempre devuelve MAX_ITEMS elementos (o menos si no hay tantas páginas), para que la
// barra no cambie de ancho al moverse entre páginas. null es un hueco con puntos suspensivos.
export function getPageItems(currentPage: number, totalPages: number): (number | null)[] {
  if (totalPages <= MAX_ITEMS) return range(1, totalPages)

  if (currentPage <= 4) return [...range(1, 5), null, totalPages]
  if (currentPage >= totalPages - 3) return [1, null, ...range(totalPages - 4, totalPages)]

  return [1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages]
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  if (totalPages <= 1) return null

  const items = getPageItems(currentPage, totalPages)
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)

    if (page > 1) params.set('page', String(page))
    else params.delete('page')

    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <Link
        to={buildPageUrl(currentPage - 1)}
        className={isFirstPage ? styles.isDisabled : undefined}
        aria-label="Anterior"
        aria-disabled={isFirstPage}
        tabIndex={isFirstPage ? -1 : undefined}
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6l-6 6l6 6" />
        </svg>
      </Link>

      {items.map((page, index) =>
        page === null ? (
          <span key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={page}
            to={buildPageUrl(page)}
            className={page === currentPage ? styles.isActive : undefined}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        ),
      )}

      <Link
        to={buildPageUrl(currentPage + 1)}
        className={isLastPage ? styles.isDisabled : undefined}
        aria-label="Siguiente"
        aria-disabled={isLastPage}
        tabIndex={isLastPage ? -1 : undefined}
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6l-6 6" />
        </svg>
      </Link>
    </nav>
  )
}
