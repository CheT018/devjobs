import type { Job } from '@devjobs/shared'
import DOMPurify from 'dompurify'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import snarkdown from 'snarkdown'
import { JobTags } from '../components/JobTags'
import { useApplication } from '../hooks/useApplication'
import { useJob } from '../hooks/useJob'
import styles from './Detail.module.css'

function JobSection({ title, content }: { title: string; content?: string }) {
  const html = useMemo(() => DOMPurify.sanitize(snarkdown(content ?? '')), [content])

  if (!content) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={`${styles.sectionContent} prose`} dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  )
}

function DetailApplyButton({ jobId }: { jobId: string }) {
  const { hasApplied, apply } = useApplication(jobId)

  return (
    <button onClick={apply} disabled={hasApplied} className={styles.applyButton}>
      {hasApplied ? 'Aplicado' : 'Aplicar ahora'}
    </button>
  )
}

function JobDetail({ job }: { job: Job }) {
  return (
    <>
      <title>{`${job.title} en ${job.company} - DevJobs`}</title>
      <meta name="description" content={job.description} />

      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <Link to="/search" className={styles.breadcrumbButton}>
            Empleos
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{job.title}</span>
        </nav>
      </div>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{job.title}</h1>
          <p className={styles.meta}>
            {job.company} · {job.location}
          </p>
          <JobTags data={job.data} />
        </div>
        <DetailApplyButton jobId={job.id} />
      </header>

      <JobSection title="Descripción del puesto" content={job.content?.description} />
      <JobSection title="Responsabilidades" content={job.content?.responsibilities} />
      <JobSection title="Requisitos" content={job.content?.requirements} />
      <JobSection title="Acerca de la empresa" content={job.content?.about} />
    </>
  )
}

export default function DetailPage() {
  const { id = '' } = useParams()
  const { job, loading, notFound, failed, retry } = useJob(id)

  if (loading) {
    return (
      <main className={styles.page}>
        <title>Cargando... - DevJobs</title>
        <div className={styles.loading}>
          <p className={styles.loadingText}>Cargando...</p>
        </div>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className={styles.page}>
        <title>Oferta no encontrada - DevJobs</title>
        <div className={styles.error}>
          <h1 className={styles.errorTitle}>Oferta no encontrada</h1>
          <Link to="/search" className={styles.errorButton}>
            Ver todos los empleos
          </Link>
        </div>
      </main>
    )
  }

  if (failed || !job) {
    return (
      <main className={styles.page}>
        <title>Error - DevJobs</title>
        <div className={styles.error} role="alert">
          <h1 className={styles.errorTitle}>No se ha podido cargar la oferta</h1>
          <button onClick={retry}>Reintentar</button>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <JobDetail job={job} />
    </main>
  )
}
