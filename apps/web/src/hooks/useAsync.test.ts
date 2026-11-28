import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useAsync } from './useAsync'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useAsync', () => {
  test('empieza cargando y después devuelve los datos', async () => {
    const load = vi.fn((key: string) => Promise.resolve(`data for ${key}`))

    const { result } = renderHook(() => useAsync('a', load))

    expect(result.current).toMatchObject({ data: null, error: null, loading: true })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBe('data for a')
    expect(load).toHaveBeenCalledWith('a', expect.any(AbortSignal))
  })

  test('cancela la petición anterior y conserva sus datos mientras carga la siguiente', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const load = vi
      .fn<(key: string, signal: AbortSignal) => Promise<string>>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)

    const { result, rerender } = renderHook(({ key }) => useAsync(key, load), {
      initialProps: { key: 'a' },
    })
    await act(async () => first.resolve('first'))
    expect(result.current).toMatchObject({ data: 'first', loading: false })

    rerender({ key: 'b' })

    const firstSignal = load.mock.calls[0]?.[1]
    expect(firstSignal?.aborted).toBe(true)
    expect(result.current).toMatchObject({ data: 'first', loading: true })

    await act(async () => second.resolve('second'))
    expect(result.current).toMatchObject({ data: 'second', loading: false })
  })

  test('ignora el error de una petición cancelada', async () => {
    const first = deferred<string>()
    const load = vi
      .fn<(key: string, signal: AbortSignal) => Promise<string>>()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce('second')

    const { result, rerender } = renderHook(({ key }) => useAsync(key, load), {
      initialProps: { key: 'a' },
    })
    rerender({ key: 'b' })
    await act(async () => first.reject(new DOMException('Aborted', 'AbortError')))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current).toMatchObject({ data: 'second', error: null })
  })

  test('devuelve el error y repite la petición al reintentar', async () => {
    const failure = new Error('Network error')
    const load = vi
      .fn<(key: string, signal: AbortSignal) => Promise<string>>()
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce('data')

    const { result } = renderHook(() => useAsync('a', load))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current).toMatchObject({ data: null, error: failure })

    act(() => result.current.retry())

    expect(result.current).toMatchObject({ error: null, loading: true })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBe('data')
    expect(load).toHaveBeenCalledTimes(2)
  })
})
