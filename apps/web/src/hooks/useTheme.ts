import { useEffect, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

// El script de index.html lee esta misma clave antes de pintar
const STORAGE_KEY = 'devjobs-theme'
const THEME_COLORS: Record<Theme, string> = { light: '#ffffff', dark: '#06182a' }

const root = document.documentElement
const lightQuery = window.matchMedia('(prefers-color-scheme: light)')

function getTheme(): Theme {
  return root.dataset.theme === 'light' ? 'light' : 'dark'
}

function hasStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

function followSystemTheme() {
  if (!hasStoredTheme()) root.dataset.theme = lightQuery.matches ? 'light' : 'dark'
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
  lightQuery.addEventListener('change', followSystemTheme)

  return () => {
    observer.disconnect()
    lightQuery.removeEventListener('change', followSystemTheme)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme)

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  }, [theme])

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    root.dataset.theme = next

    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Sin almacenamiento (modo privado estricto), el cambio dura hasta recargar
    }
  }

  return { theme, toggleTheme }
}
