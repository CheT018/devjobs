import type { JobLevel } from '@devjobs/shared'
import { useSearchParams } from 'react-router'
import { LEVEL_OPTIONS, RESULTS_PER_PAGE } from '../constants/filters'
import { searchJobs } from '../services/jobs'
import { getCurrentPage } from '../utils/searchParams'
import { useAsync } from './useAsync'

export interface SearchFilters {
  technology: string
  location: string
  level: JobLevel | ''
}

function toLevel(value: string | null): JobLevel | '' {
  return LEVEL_OPTIONS.find((option) => option.value === value)?.value ?? ''
}

// La URL es la única fuente de verdad de la búsqueda
export function useJobSearch() {
  const [searchParams, setSearchParams] = useSearchParams()

  const text = searchParams.get('text') ?? ''
  const filters: SearchFilters = {
    technology: searchParams.get('technology') ?? '',
    location: searchParams.get('location') ?? '',
    level: toLevel(searchParams.get('level')),
  }
  const currentPage = getCurrentPage(searchParams)

  const query = new URLSearchParams()
  for (const [name, value] of Object.entries({ text, ...filters })) {
    if (value) query.set(name, value)
  }
  query.set('limit', String(RESULTS_PER_PAGE))
  query.set('offset', String((currentPage - 1) * RESULTS_PER_PAGE))

  const { data, error, loading, retry } = useAsync(query.toString(), searchJobs)

  const total = data?.total ?? 0

  // Cambiar la búsqueda vuelve siempre a la primera página
  const updateParams = (changes: Record<string, string>, options?: { replace: boolean }) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)

      for (const [name, value] of Object.entries(changes)) {
        if (value) next.set(name, value)
        else next.delete(name)
      }

      next.delete('page')
      return next
    }, options)
  }

  return {
    text,
    filters,
    currentPage,
    jobs: data?.data ?? [],
    total,
    totalPages: Math.ceil(total / RESULTS_PER_PAGE),
    loading,
    failed: error !== null,
    retry,
    setText: (newText: string) => updateParams({ text: newText }, { replace: true }),
    setFilters: (newFilters: SearchFilters) => updateParams({ ...newFilters }),
  }
}
