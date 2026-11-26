import crypto from 'node:crypto'
import type {
  CreateJobInput,
  Job,
  JobContent,
  JobFilters,
  JobLevel,
  JobModality,
  JobSummary,
  UpdateJobInput,
} from '@devjobs/shared'
import type { Db } from '../db/database.js'

// La base de datos guarda columnas planas (modality, level) y las tecnologías
// en otra tabla; la API las expone anidadas en `data`. El modelo hace ese mapeo.
interface JobRow {
  id: string
  title: string
  company: string
  location: string
  description: string
  modality: JobModality
  level: JobLevel
  technologies: string
}

const SELECT_JOBS = `
  SELECT
    j.id, j.title, j.company, j.location, j.description, j.modality, j.level,
    (
      SELECT json_group_array(technology)
      FROM (SELECT technology FROM job_technologies WHERE job_id = j.id ORDER BY position)
    ) AS technologies
  FROM jobs j
`

function toJobSummary(row: JobRow): JobSummary {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    description: row.description,
    data: {
      technology: JSON.parse(row.technologies) as string[],
      modality: row.modality,
      level: row.level,
    },
  }
}

// Escapa los comodines de LIKE para que el texto se busque de forma literal.
function toLikePattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, '\\$&')}%`
}

function buildWhere(filters: JobFilters): { where: string; params: string[] } {
  const conditions: string[] = []
  const params: string[] = []

  if (filters.text) {
    const pattern = toLikePattern(filters.text)
    conditions.push(`(
      j.title LIKE ? ESCAPE '\\'
      OR j.company LIKE ? ESCAPE '\\'
      OR j.description LIKE ? ESCAPE '\\'
      OR EXISTS (
        SELECT 1 FROM job_technologies
        WHERE job_id = j.id AND technology LIKE ? ESCAPE '\\'
      )
    )`)
    params.push(pattern, pattern, pattern, pattern)
  }

  if (filters.technology) {
    conditions.push(
      'EXISTS (SELECT 1 FROM job_technologies WHERE job_id = j.id AND technology = ? COLLATE NOCASE)',
    )
    params.push(filters.technology)
  }

  if (filters.location) {
    conditions.push('j.location = ? COLLATE NOCASE')
    params.push(filters.location)
  }

  if (filters.modality) {
    conditions.push('j.modality = ?')
    params.push(filters.modality)
  }

  if (filters.level) {
    conditions.push('j.level = ?')
    params.push(filters.level)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  return { where, params }
}

export class JobModel {
  readonly #db: Db

  constructor(db: Db) {
    this.#db = db
  }

  getAll(
    filters: JobFilters,
    { limit, offset }: { limit: number; offset: number },
  ): { jobs: JobSummary[]; total: number } {
    const { where, params } = buildWhere(filters)

    const { total } = this.#db
      .prepare(`SELECT COUNT(*) AS total FROM jobs j ${where}`)
      .get(...params) as { total: number }

    const rows = this.#db
      .prepare(`${SELECT_JOBS} ${where} ORDER BY j.rowid LIMIT ? OFFSET ?`)
      .all(...params, limit, offset) as JobRow[]

    return { jobs: rows.map(toJobSummary), total }
  }

  getById(id: string): Job | undefined {
    const row = this.#db.prepare(`${SELECT_JOBS} WHERE j.id = ?`).get(id) as JobRow | undefined
    if (!row) return undefined

    const content = this.#db
      .prepare(
        'SELECT description, responsibilities, requirements, about FROM job_content WHERE job_id = ?',
      )
      .get(id) as JobContent | undefined

    return { ...toJobSummary(row), ...(content ? { content } : {}) }
  }

  create(input: CreateJobInput): Job {
    const id = crypto.randomUUID()
    this.insert({ id, ...input })
    return this.getById(id)!
  }

  /** Inserta una oferta con un id ya definido. Lo usa también el seed. */
  insert(job: Job): void {
    this.#db.transaction(() => {
      this.#db
        .prepare(
          `INSERT INTO jobs (id, title, company, location, description, modality, level)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          job.id,
          job.title,
          job.company,
          job.location,
          job.description,
          job.data.modality,
          job.data.level,
        )

      this.#replaceTechnologies(job.id, job.data.technology)

      if (job.content) {
        this.#upsertContent(job.id, job.content)
      }
    })()
  }

  update(id: string, input: UpdateJobInput): Job | undefined {
    const existing = this.getById(id)
    if (!existing) return undefined

    this.#db.transaction(() => {
      const columns = {
        title: input.title,
        company: input.company,
        location: input.location,
        description: input.description,
        modality: input.data?.modality,
        level: input.data?.level,
      }

      const changes = Object.entries(columns).filter(([, value]) => value !== undefined)

      if (changes.length > 0) {
        const assignments = changes.map(([column]) => `${column} = ?`).join(', ')
        const values = changes.map(([, value]) => value)
        this.#db.prepare(`UPDATE jobs SET ${assignments} WHERE id = ?`).run(...values, id)
      }

      if (input.data?.technology !== undefined) {
        this.#replaceTechnologies(id, input.data.technology)
      }

      if (input.content !== undefined) {
        // Los campos de contenido que no llegan conservan su valor anterior
        this.#upsertContent(id, {
          description: input.content.description ?? existing.content?.description ?? '',
          responsibilities:
            input.content.responsibilities ?? existing.content?.responsibilities ?? '',
          requirements: input.content.requirements ?? existing.content?.requirements ?? '',
          about: input.content.about ?? existing.content?.about ?? '',
        })
      }
    })()

    return this.getById(id)
  }

  delete(id: string): boolean {
    const result = this.#db.prepare('DELETE FROM jobs WHERE id = ?').run(id)
    return result.changes > 0
  }

  count(): number {
    const { total } = this.#db.prepare('SELECT COUNT(*) AS total FROM jobs').get() as {
      total: number
    }
    return total
  }

  #replaceTechnologies(jobId: string, technologies: string[]): void {
    this.#db.prepare('DELETE FROM job_technologies WHERE job_id = ?').run(jobId)

    const insert = this.#db.prepare(
      'INSERT OR IGNORE INTO job_technologies (job_id, technology, position) VALUES (?, ?, ?)',
    )
    technologies.forEach((technology, position) => insert.run(jobId, technology, position))
  }

  #upsertContent(jobId: string, content: JobContent): void {
    this.#db
      .prepare(
        `INSERT INTO job_content (job_id, description, responsibilities, requirements, about)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (job_id) DO UPDATE SET
           description = excluded.description,
           responsibilities = excluded.responsibilities,
           requirements = excluded.requirements,
           about = excluded.about`,
      )
      .run(jobId, content.description, content.responsibilities, content.requirements, content.about)
  }
}
