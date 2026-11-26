import { create } from 'zustand'

interface ApplicationsState {
  appliedJobIds: string[]
  apply: (jobId: string) => void
}

export const useApplicationsStore = create<ApplicationsState>()((set) => ({
  appliedJobIds: [],
  apply: (jobId) =>
    set((state) => ({
      appliedJobIds: state.appliedJobIds.includes(jobId)
        ? state.appliedJobIds
        : [...state.appliedJobIds, jobId],
    })),
}))
