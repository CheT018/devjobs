import type { JobSummary } from '@devjobs/shared'
import { JobCard } from './JobCard'
import styles from './JobListings.module.css'

export function JobListings({ jobs }: { jobs: JobSummary[] }) {
  return (
    <div className="jobs-listings">
      {jobs.length === 0 && (
        <p className={styles.empty}>
          No se han encontrado empleos que coincidan con los criterios de búsqueda.
        </p>
      )}

      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
