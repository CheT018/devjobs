// Contrato de la API de DevJobs. Solo tipos: no genera código en tiempo de ejecución.

export type JobModality = 'remote' | 'onsite' | 'hybrid'
export type JobLevel = 'junior' | 'mid' | 'senior'

export interface JobData {
  technology: string[]
  modality: JobModality
  level: JobLevel
}

export interface JobContent {
  description: string
  responsibilities: string
  requirements: string
  about: string
}

/** Oferta tal como aparece en los listados, sin el contenido detallado. */
export interface JobSummary {
  id: string
  title: string
  company: string
  location: string
  description: string
  data: JobData
}

/** Oferta completa, tal como la devuelve el detalle. */
export interface Job extends JobSummary {
  content?: JobContent
}

export type CreateJobInput = Omit<Job, 'id'>

export interface UpdateJobInput {
  title?: string
  company?: string
  location?: string
  description?: string
  data?: Partial<JobData>
  content?: Partial<JobContent>
}

export interface JobFilters {
  text?: string
  technology?: string
  location?: string
  modality?: JobModality
  level?: JobLevel
}

export interface JobListQuery extends JobFilters {
  limit?: number
  offset?: number
}

export interface Paginated<T> {
  data: T[]
  /** Total de resultados que cumplen los filtros, no solo los de esta página. */
  total: number
  limit: number
  offset: number
}

export interface ApiErrorBody {
  message: string
  errors?: { field: string; message: string }[]
}
