import type { JobSummary } from '@devjobs/shared'
import { Link } from 'react-router'
import { useApplication } from '../hooks/useApplication'
import { useFavoritesStore } from '../store/favoritesStore'
import styles from './JobCard.module.css'

function JobCardApplyButton({ jobId }: { jobId: string }) {
  const { hasApplied, apply } = useApplication(jobId)

  return (
    <button
      className={hasApplied ? 'button-apply-job is-applied' : 'button-apply-job'}
      onClick={apply}
      disabled={hasApplied}
    >
      {hasApplied ? 'Aplicado' : 'Aplicar'}
    </button>
  )
}

function JobCardFavoriteButton({ jobId }: { jobId: string }) {
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(jobId))
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

  const label = isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'

  return (
    <button
      onClick={() => toggleFavorite(jobId)}
      className={styles.btnFavorite}
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
    >
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isFavorite ? '#f43f5e' : 'none'}
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
      </svg>
    </button>
  )
}

export function JobCard({ job }: { job: JobSummary }) {
  const detailPath = `/job/${job.id}`

  return (
    <article
      className="job-listing-card"
      data-modality={job.data.modality}
      data-level={job.data.level}
    >
      <div>
        <h3>
          <Link className={styles.title} to={detailPath}>
            {job.title}
          </Link>
        </h3>
        <small>
          {job.company} | {job.location}
        </small>
        <p>{job.description}</p>
      </div>

      <div className={styles.actions}>
        <Link to={detailPath} className={styles.details}>
          Ver detalles
        </Link>
        <JobCardApplyButton jobId={job.id} />
        <JobCardFavoriteButton jobId={job.id} />
      </div>
    </article>
  )
}
