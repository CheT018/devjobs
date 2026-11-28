import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { SearchFilters } from '../hooks/useJobSearch'
import { SearchFormSection } from './SearchFormSection'

const NO_FILTERS: SearchFilters = { technology: '', location: '', modality: '', level: '' }

interface ParentProps {
  initialText: string
  onTextChange: (text: string) => void
  onFiltersChange: (filters: SearchFilters) => void
}

// Hace lo mismo que la página: guarda el texto aplicado y se lo devuelve al formulario
function Parent({ initialText, onTextChange, onFiltersChange }: ParentProps) {
  const [text, setText] = useState(initialText)

  return (
    <SearchFormSection
      text={text}
      filters={NO_FILTERS}
      onTextChange={(newText) => {
        onTextChange(newText)
        setText(newText)
      }}
      onFiltersChange={onFiltersChange}
    />
  )
}

// fireEvent en vez de user-event: user-event espera a temporizadores reales y se
// bloquea con los temporizadores simulados que necesita el debounce
function renderForm(initialText = '') {
  const onTextChange = vi.fn()
  const onFiltersChange = vi.fn()
  render(
    <Parent
      initialText={initialText}
      onTextChange={onTextChange}
      onFiltersChange={onFiltersChange}
    />,
  )
  const input = screen.getByRole('searchbox', { name: 'Buscar empleos' })

  return {
    onTextChange,
    onFiltersChange,
    input,
    type: (value: string) => fireEvent.change(input, { target: { value } }),
  }
}

describe('SearchFormSection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('aplica el texto 500 ms después de la última pulsación', () => {
    const { type, onTextChange } = renderForm()

    type('re')
    vi.advanceTimersByTime(300)
    type('react')
    vi.advanceTimersByTime(499)
    expect(onTextChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onTextChange).toHaveBeenCalledExactlyOnceWith('react')
  })

  test('al enviar el formulario aplica el texto sin esperar y una sola vez', () => {
    const { input, type, onTextChange } = renderForm()

    type('node')
    fireEvent.submit(input)
    expect(onTextChange).toHaveBeenCalledExactlyOnceWith('node')

    vi.advanceTimersByTime(1000)
    expect(onTextChange).toHaveBeenCalledOnce()
  })

  test('el botón de limpiar vacía el campo y la búsqueda', () => {
    const { input, onTextChange } = renderForm('react')

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))

    expect(input).toHaveValue('')
    expect(onTextChange).toHaveBeenCalledExactlyOnceWith('')
  })

  test('refleja el texto cuando cambia desde fuera, por ejemplo al navegar atrás', () => {
    const props = { filters: NO_FILTERS, onTextChange: vi.fn(), onFiltersChange: vi.fn() }
    const { rerender } = render(<SearchFormSection text="react" {...props} />)
    const input = screen.getByRole('searchbox', { name: 'Buscar empleos' })
    expect(input).toHaveValue('react')

    rerender(<SearchFormSection text="python" {...props} />)

    expect(input).toHaveValue('python')
  })

  test('al cambiar un filtro conserva los demás', () => {
    const { onFiltersChange } = renderForm()

    fireEvent.change(screen.getByRole('combobox', { name: 'Modalidad' }), {
      target: { value: 'remote' },
    })

    expect(onFiltersChange).toHaveBeenCalledExactlyOnceWith({ ...NO_FILTERS, modality: 'remote' })
  })
})
