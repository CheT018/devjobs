import { useCallback, useEffect, useState } from 'react'

interface Settled<T> {
  requestId: string
  data: T | null
  error: unknown
}

// `load` debe ser una función estable: si cambia en cada render, la petición se repite sin fin
export function useAsync<T>(
  key: string,
  load: (key: string, signal: AbortSignal) => Promise<T>,
) {
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const [attempt, setAttempt] = useState(0)
  const requestId = `${attempt}:${key}`

  useEffect(() => {
    const controller = new AbortController()

    load(key, controller.signal)
      .then((data) => setSettled({ requestId, data, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setSettled({ requestId, data: null, error })
        }
      })

    return () => controller.abort()
  }, [key, load, requestId])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  const isCurrent = settled?.requestId === requestId

  return {
    // Mientras llega una respuesta nueva se conservan los datos de la anterior
    data: settled?.data ?? null,
    error: isCurrent ? settled.error : null,
    loading: !isCurrent,
    retry,
  }
}
