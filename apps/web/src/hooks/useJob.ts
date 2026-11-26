import { ApiError, getJob } from '../services/jobs'
import { useAsync } from './useAsync'

export function useJob(id: string) {
  const { data, error, loading, retry } = useAsync(id, getJob)

  return {
    job: loading ? null : data,
    loading,
    notFound: error instanceof ApiError && error.status === 404,
    failed: error !== null,
    retry,
  }
}
