import { create } from 'zustand'

interface FavoritesState {
  favorites: string[]
  toggleFavorite: (jobId: string) => void
}

export const useFavoritesStore = create<FavoritesState>()((set) => ({
  favorites: [],
  toggleFavorite: (jobId) =>
    set((state) => ({
      favorites: state.favorites.includes(jobId)
        ? state.favorites.filter((id) => id !== jobId)
        : [...state.favorites, jobId],
    })),
}))
