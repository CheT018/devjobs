import { useApplicationsStore } from '../store/applicationsStore'

/** Estado de la candidatura a una oferta. La candidatura se guarda en el navegador. */
export function useApplication(jobId: string) {
  const hasApplied = useApplicationsStore((state) => state.appliedJobIds.includes(jobId))
  const applyToJob = useApplicationsStore((state) => state.apply)

  return {
    hasApplied,
    apply: () => applyToJob(jobId),
  }
}
