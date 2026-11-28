import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  LEVEL_OPTIONS,
  LOCATION_OPTIONS,
  MODALITY_OPTIONS,
  TECHNOLOGY_OPTIONS,
} from '../constants/filters'
import type { SearchFilters } from '../hooks/useJobSearch'
import searchInput from '../styles/searchInput.module.css'
import styles from './SearchFormSection.module.css'

const DEBOUNCE_MS = 500

interface SearchFormSectionProps {
  text: string
  filters: SearchFilters
  onTextChange: (text: string) => void
  onFiltersChange: (filters: SearchFilters) => void
}

function useDebouncedText(committedText: string, onCommit: (text: string) => void) {
  const [inputText, setInputText] = useState(committedText)
  const [lastCommitted, setLastCommitted] = useState(committedText)
  const timeoutId = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Si el texto cambia desde fuera (por ejemplo, al navegar atrás), el input lo refleja
  if (committedText !== lastCommitted) {
    setLastCommitted(committedText)
    setInputText(committedText)
  }

  useEffect(() => () => clearTimeout(timeoutId.current), [])

  const commit = (text: string) => {
    clearTimeout(timeoutId.current)
    setLastCommitted(text)
    onCommit(text)
  }

  return {
    inputText,
    change: (text: string) => {
      setInputText(text)
      clearTimeout(timeoutId.current)
      timeoutId.current = setTimeout(() => commit(text), DEBOUNCE_MS)
    },
    commitNow: (text: string) => {
      setInputText(text)
      commit(text)
    },
  }
}

export function SearchFormSection({
  text,
  filters,
  onTextChange,
  onFiltersChange,
}: SearchFormSectionProps) {
  const { inputText, change, commitNow } = useDebouncedText(text, onTextChange)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    commitNow(inputText)
  }

  const handleFilterChange =
    (name: keyof SearchFilters) => (event: ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ ...filters, [name]: event.target.value })
    }

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Encuentra tu próximo trabajo</h1>
      <p className={styles.lead}>
        Explora ofertas del sector tecnológico y filtra por lo que buscas.
      </p>

      <form className={styles.form} role="search" onSubmit={handleSubmit}>
        <div className={styles.searchBar}>
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
            <path d="M21 21l-6 -6" />
          </svg>

          <input
            className={searchInput.input}
            type="search"
            name="text"
            aria-label="Buscar empleos"
            placeholder="Buscar trabajos, empresas o habilidades"
            value={inputText}
            onChange={(event) => change(event.target.value)}
          />

          <button type="button" aria-label="Limpiar búsqueda" onClick={() => commitNow('')}>
            ✖︎
          </button>
        </div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            name="technology"
            aria-label="Tecnología"
            value={filters.technology}
            onChange={handleFilterChange('technology')}
          >
            <option value="">Tecnología</option>
            {TECHNOLOGY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            name="location"
            aria-label="Ubicación"
            value={filters.location}
            onChange={handleFilterChange('location')}
          >
            <option value="">Ubicación</option>
            {LOCATION_OPTIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            name="modality"
            aria-label="Modalidad"
            value={filters.modality}
            onChange={handleFilterChange('modality')}
          >
            <option value="">Modalidad</option>
            {MODALITY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            name="level"
            aria-label="Nivel de experiencia"
            value={filters.level}
            onChange={handleFilterChange('level')}
          >
            <option value="">Nivel de experiencia</option>
            {LEVEL_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </form>
    </section>
  )
}
