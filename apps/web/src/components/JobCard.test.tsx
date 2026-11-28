import type { JobSummary } from '@devjobs/shared'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, test } from 'vitest'
import { useApplicationsStore } from '../store/applicationsStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { JobCard } from './JobCard'

const JOB: JobSummary = {
  id: 'job-1',
  title: 'Desarrollador Frontend',
  company: 'Acme',
  location: 'Remoto',
  description: 'Construye interfaces con React.',
  data: { technology: ['react', 'typescript'], modality: 'remote', level: 'junior' },
}

function renderCard() {
  render(
    <MemoryRouter>
      <JobCard job={JOB} />
    </MemoryRouter>,
  )
  return userEvent.setup()
}

describe('JobCard', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favorites: [] })
    useApplicationsStore.setState({ appliedJobIds: [] })
  })

  test('muestra la oferta y enlaza a su detalle', () => {
    renderCard()

    expect(screen.getByRole('link', { name: JOB.title })).toHaveAttribute('href', '/job/job-1')
    expect(screen.getByText('Acme | Remoto')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Etiquetas' })).toHaveTextContent('Junior')
  })

  test('marca y desmarca la oferta como favorita y lo guarda en el navegador', async () => {
    const user = renderCard()

    await user.click(screen.getByRole('button', { name: 'Agregar a favoritos' }))

    const remove = screen.getByRole('button', { name: 'Quitar de favoritos' })
    expect(remove).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('devjobs-favorites')).toContain('job-1')

    await user.click(remove)

    expect(screen.getByRole('button', { name: 'Agregar a favoritos' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(useFavoritesStore.getState().favorites).toEqual([])
  })

  test('al aplicar, el botón queda desactivado y la candidatura no se duplica', async () => {
    const user = renderCard()

    await user.click(screen.getByRole('button', { name: 'Aplicar' }))

    expect(screen.getByRole('button', { name: 'Aplicado' })).toBeDisabled()
    useApplicationsStore.getState().apply('job-1')
    expect(useApplicationsStore.getState().appliedJobIds).toEqual(['job-1'])
  })
})
