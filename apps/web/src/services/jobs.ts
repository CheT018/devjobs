import type { ApiErrorBody, Job, JobSummary, Paginated } from '@devjobs/shared'

const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { signal })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null
    throw new ApiError(response.status, body?.message ?? response.statusText)
  }

  return (await response.json()) as T
}

/** Busca ofertas. `query` son los parámetros de la API ya serializados. */
export function searchJobs(query: string, signal?: AbortSignal): Promise<Paginated<JobSummary>> {
  return request(query ? `/jobs?${query}` : '/jobs', signal)
}

export function getJob(id: string, signal?: AbortSignal): Promise<Job> {
  return request(`/jobs/${encodeURIComponent(id)}`, signal)
}
