import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ApplicationsState {
  appliedJobIds: string[]
  apply: (jobId: string) => void
}

export const useApplicationsStore = create<ApplicationsState>()(
  persist(
    (set) => ({
      appliedJobIds: [],
      apply: (jobId) =>
        set((state) => ({
          appliedJobIds: state.appliedJobIds.includes(jobId)
            ? state.appliedJobIds
            : [...state.appliedJobIds, jobId],
        })),
    }),
    { name: 'devjobs-applications' },
  ),
)
