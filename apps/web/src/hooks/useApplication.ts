import { useApplicationsStore } from '../store/applicationsStore'
import { useAuthStore } from '../store/authStore'

/** Estado de la candidatura a una oferta. Solo se puede aplicar con sesión iniciada. */
export function useApplication(jobId: string) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const isApplied = useApplicationsStore((state) => state.appliedJobIds.includes(jobId))
  const applyToJob = useApplicationsStore((state) => state.apply)

  return {
    isLoggedIn,
    hasApplied: isLoggedIn && isApplied,
    apply: () => {
      if (isLoggedIn) applyToJob(jobId)
    },
  }
}
