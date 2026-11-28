import type { JobSummary, Paginated } from '@devjobs/shared'
import { useSearchParams } from 'react-router'
import { RESULTS_PER_PAGE } from '../constants/filters'
import { searchJobs } from '../services/jobs'
import { useApplicationsStore } from '../store/applicationsStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { getCurrentPage } from '../utils/searchParams'
import { useAsync } from './useAsync'

export type SavedTab = 'favorites' | 'applications'

const NO_JOBS: Paginated<JobSummary> = { data: [], total: 0, limit: RESULTS_PER_PAGE, offset: 0 }

function loadSavedJobs(query: string, signal: AbortSignal) {
  return query ? searchJobs(query, signal) : Promise.resolve(NO_JOBS)
}

export function useSavedJobs() {
  const [searchParams] = useSearchParams()
  const tab: SavedTab = searchParams.get('tab') === 'applications' ? 'applications' : 'favorites'

  const favoriteIds = useFavoritesStore((state) => state.favorites)
  const appliedIds = useApplicationsStore((state) => state.appliedJobIds)
  const ids = tab === 'favorites' ? favoriteIds : appliedIds

  // Al quitar el último favorito de la última página, se muestra la anterior en vez de una vacía
  const lastPage = Math.max(1, Math.ceil(ids.length / RESULTS_PER_PAGE))
  const currentPage = Math.min(getCurrentPage(searchParams), lastPage)

  const query =
    ids.length > 0
      ? new URLSearchParams({
          ids: ids.join(','),
          limit: String(RESULTS_PER_PAGE),
          offset: String((currentPage - 1) * RESULTS_PER_PAGE),
        }).toString()
      : ''

  const { data, error, loading, retry } = useAsync(query, loadSavedJobs)

  const jobs = data?.data ?? []
  const total = data?.total ?? 0

  return {
    tab,
    currentPage,
    jobs,
    totalPages: Math.ceil(total / RESULTS_PER_PAGE),
    loading,
    isEmpty: ids.length === 0 || (!loading && jobs.length === 0),
    failed: error !== null,
    retry,
  }
}
