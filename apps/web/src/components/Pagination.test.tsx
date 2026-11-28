import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, test } from 'vitest'
import { getPageItems, Pagination } from './Pagination'

function renderAt(url: string, currentPage: number, totalPages: number) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </MemoryRouter>,
  )
}

describe('getPageItems', () => {
  test('muestra todas las páginas si caben', () => {
    expect(getPageItems(1, 1)).toEqual([1])
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  test('cerca del principio, recorta solo el final', () => {
    expect(getPageItems(4, 10)).toEqual([1, 2, 3, 4, 5, null, 10])
  })

  test('cerca del final, recorta solo el principio', () => {
    expect(getPageItems(7, 10)).toEqual([1, null, 6, 7, 8, 9, 10])
  })

  test('en medio, muestra la actual con sus vecinas', () => {
    expect(getPageItems(5, 10)).toEqual([1, null, 4, 5, 6, null, 10])
  })

  test('siempre devuelve siete elementos cuando hay más de siete páginas', () => {
    for (let page = 1; page <= 20; page++) {
      expect(getPageItems(page, 20)).toHaveLength(7)
    }
  })
})

describe('Pagination', () => {
  test('no se muestra si solo hay una página', () => {
    renderAt('/search', 1, 1)

    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument()
  })

  test('los enlaces conservan la búsqueda y la página 1 no lleva parámetro', () => {
    renderAt('/search?text=react&page=2', 2, 3)

    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/search?text=react')
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute(
      'href',
      '/search?text=react&page=3',
    )
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
  })

  test('desactiva «Anterior» en la primera página y «Siguiente» en la última', () => {
    const { unmount } = renderAt('/search', 1, 3)
    expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('link', { name: 'Siguiente' })).toHaveAttribute('aria-disabled', 'false')
    unmount()

    renderAt('/search?page=3', 3, 3)
    expect(screen.getByRole('link', { name: 'Siguiente' })).toHaveAttribute('aria-disabled', 'true')
  })
})
