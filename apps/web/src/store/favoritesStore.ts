import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favorites: string[]
  toggleFavorite: (jobId: string) => void
}

// Se guarda en localStorage para que los favoritos sobrevivan a una recarga
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: (jobId) =>
        set((state) => ({
          favorites: state.favorites.includes(jobId)
            ? state.favorites.filter((id) => id !== jobId)
            : [...state.favorites, jobId],
        })),
    }),
    { name: 'devjobs-favorites' },
  ),
)
