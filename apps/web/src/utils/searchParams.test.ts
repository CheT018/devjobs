import { describe, expect, test } from 'vitest'
import { getCurrentPage } from './searchParams'

function pageOf(query: string) {
  return getCurrentPage(new URLSearchParams(query))
}

describe('getCurrentPage', () => {
  test('lee la página de la URL', () => {
    expect(pageOf('page=3')).toBe(3)
  })

  test('sin parámetro, es la primera página', () => {
    expect(pageOf('')).toBe(1)
  })

  test('corrige valores que no son una página válida', () => {
    expect(pageOf('page=abc')).toBe(1)
    expect(pageOf('page=0')).toBe(1)
    expect(pageOf('page=-2')).toBe(1)
    expect(pageOf('page=2.7')).toBe(2)
  })
})
