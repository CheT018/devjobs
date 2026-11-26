import { Link, useLocation, useSearchParams } from 'react-router'
import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  // Conserva los filtros de la URL y cambia solo la página
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

      {pages.map((page) => (
        <Link
          key={page}
          to={buildPageUrl(page)}
          className={page === currentPage ? styles.isActive : undefined}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Link>
      ))}

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
