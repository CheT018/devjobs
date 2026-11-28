import { useApplicationsStore } from '../store/applicationsStore'

export function useApplication(jobId: string) {
  const hasApplied = useApplicationsStore((state) => state.appliedJobIds.includes(jobId))
  const applyToJob = useApplicationsStore((state) => state.apply)

  return {
    hasApplied,
    apply: () => applyToJob(jobId),
  }
}
