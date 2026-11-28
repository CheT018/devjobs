import { expect, test, type Page } from '@playwright/test'

const jobCards = (page: Page) => page.getByRole('article')

async function searchFromHome(page: Page, text: string) {
  await page.goto('/')
  await page.getByRole('searchbox').fill(text)
  await page.getByRole('button', { name: 'Buscar' }).click()
}

async function openFirstJobDetail(page: Page) {
  const firstJob = jobCards(page).first()
  const title = await firstJob.getByRole('heading', { level: 3 }).innerText()

  await firstJob.getByRole('link', { name: 'Ver detalles' }).click()
  await expect(page).toHaveURL(/\/job\/.+/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)

  return title
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow, 'la página no debe tener scroll horizontal').toBe(0)
}

test.describe('Inicio', () => {
  test('muestra el buscador', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('searchbox')).toBeVisible()
    await expect(page).toHaveTitle(/DevJobs/)
  })

  test('busca desde el inicio y muestra resultados', async ({ page }) => {
    await searchFromHome(page, 'React')

    await expect(page).toHaveURL(/\/search\?text=React/)
    await expect(page.getByRole('searchbox')).toHaveValue('React')
    await expect(jobCards(page).first()).toBeVisible()
  })
})

test.describe('Búsqueda y filtros', () => {
  test('filtra por ubicación', async ({ page }) => {
    await page.goto('/search')
    await expect(jobCards(page).first()).toBeVisible()

    await page.getByRole('combobox', { name: 'Ubicación' }).selectOption({ label: 'Remoto' })

    await expect(page).toHaveURL(/location=Remoto/)
    await expect(jobCards(page).filter({ hasNotText: 'Remoto' })).toHaveCount(0)
    await expect(jobCards(page).first()).toBeVisible()
  })

  test('filtra por nivel de experiencia', async ({ page }) => {
    await page.goto('/search')
    await expect(jobCards(page).first()).toBeVisible()

    await page
      .getByRole('combobox', { name: 'Nivel de experiencia' })
      .selectOption({ label: 'Senior' })

    await expect(page).toHaveURL(/level=senior/)
    await expect(page.locator('article:not([data-level="senior"])')).toHaveCount(0)
    await expect(jobCards(page).first()).toBeVisible()
  })

  test('filtra por modalidad', async ({ page }) => {
    await page.goto('/search')
    await expect(jobCards(page).first()).toBeVisible()

    await page.getByRole('combobox', { name: 'Modalidad' }).selectOption({ label: 'Presencial' })

    await expect(page).toHaveURL(/modality=onsite/)
    await expect(page.locator('article:not([data-modality="onsite"])')).toHaveCount(0)
    await expect(jobCards(page).first()).toBeVisible()
  })

  test('conserva los filtros de la URL al cargar la página', async ({ page }) => {
    await page.goto('/search?technology=python&modality=onsite&level=mid')

    await expect(page.getByRole('combobox', { name: 'Modalidad' })).toHaveValue('onsite')
    await expect(page.getByRole('combobox', { name: 'Tecnología' })).toHaveValue('python')
    await expect(page.getByRole('combobox', { name: 'Nivel de experiencia' })).toHaveValue('mid')
    await expect(jobCards(page).first()).toBeVisible()
    await expect(page.locator('article:not([data-level="mid"])')).toHaveCount(0)
  })

  test('busca al escribir y limpia la búsqueda', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.getByRole('searchbox')
    await searchInput.fill('kubernetes')

    await expect(page).toHaveURL(/text=kubernetes/)
    await expect(page).toHaveTitle(/Resultados: \d+, Página 1 - DevJobs/)

    await page.getByRole('button', { name: 'Limpiar búsqueda' }).click()

    await expect(searchInput).toHaveValue('')
    await expect(page).not.toHaveURL(/text=/)
  })

  test('avisa cuando no hay resultados', async ({ page }) => {
    await page.goto('/search?text=texto-que-no-existe')

    await expect(page.getByText('No se han encontrado empleos')).toBeVisible()
    await expect(jobCards(page)).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Paginación' })).toHaveCount(0)
  })

  test('muestra un error con opción de reintentar si la API falla', async ({ page }) => {
    await page.route('**/api/jobs?*', (route) => route.abort())
    await page.goto('/search')

    await expect(page.getByRole('alert')).toContainText('No se han podido cargar los empleos')

    await page.unroute('**/api/jobs?*')
    await page.getByRole('button', { name: 'Reintentar' }).click()

    await expect(jobCards(page).first()).toBeVisible()
  })

  test('muestra un esqueleto mientras cargan los empleos', async ({ page }) => {
    let releaseResponse!: () => void
    const responseReleased = new Promise<void>((resolve) => (releaseResponse = resolve))
    await page.route('**/api/jobs?*', async (route) => {
      await responseReleased
      await route.continue()
    })
    await page.goto('/search')

    const skeleton = page.getByRole('status').filter({ hasText: 'Buscando empleos...' })
    await expect(skeleton).toBeVisible()
    await expect(jobCards(page)).toHaveCount(0)

    releaseResponse()

    await expect(jobCards(page).first()).toBeVisible()
    await expect(skeleton).toHaveCount(0)
  })
})

test.describe('Paginación', () => {
  test('cambia de página conservando la búsqueda', async ({ page }) => {
    await page.goto('/search')
    await page.getByRole('combobox', { name: 'Modalidad' }).selectOption({ label: 'Presencial' })
    await expect(page).toHaveURL(/modality=onsite/)
    await expect(page).toHaveTitle(/Página 1 - DevJobs/)

    const pagination = page.getByRole('navigation', { name: 'Paginación' })
    await expect(pagination).toBeVisible()

    const firstTitle = await jobCards(page).first().getByRole('heading', { level: 3 }).innerText()

    await pagination.getByRole('link', { name: 'Siguiente' }).click()

    await expect(page).toHaveURL(/modality=onsite/)
    await expect(page).toHaveURL(/page=2/)
    await expect(page).toHaveTitle(/Página 2 - DevJobs/)
    await expect(pagination.getByRole('link', { name: '2', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(jobCards(page).first().getByRole('heading', { level: 3 })).not.toHaveText(
      firstTitle,
    )
  })

  test('acorta la lista de páginas con puntos suspensivos', async ({ page }) => {
    await page.route('**/api/jobs?*', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, json: { ...(await response.json()), total: 200 } })
    })
    await page.goto('/search?page=10')

    const pagination = page.getByRole('navigation', { name: 'Paginación' })
    await expect(pagination.getByRole('link')).toHaveText(['', '1', '9', '10', '11', '20', ''])
    await expect(pagination.getByText('…')).toHaveCount(2)
    await expectNoHorizontalScroll(page)
  })
})

test.describe('Detalle y candidatura', () => {
  test('muestra el contenido de la oferta', async ({ page }) => {
    await page.goto('/search')
    const title = await openFirstJobDetail(page)

    await expect(page).toHaveTitle(new RegExp(title))
    await expect(page.getByRole('heading', { name: 'Descripción del puesto' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Responsabilidades' })).toBeVisible()
    await expect(page.getByRole('listitem').first()).toBeVisible()
  })

  test('muestra nivel, modalidad y tecnologías en la tarjeta y el detalle', async ({ page }) => {
    await page.goto('/search')

    const expectedTags = ['Senior', 'Remoto', 'react', 'node', 'javascript']
    const cardTags = jobCards(page).first().getByRole('list', { name: 'Etiquetas' })
    await expect(cardTags.getByRole('listitem')).toHaveText(expectedTags)

    await openFirstJobDetail(page)
    const detailTags = page.getByRole('list', { name: 'Etiquetas' })
    await expect(detailTags.getByRole('listitem')).toHaveText(expectedTags)
  })

  test('permite aplicar desde el detalle', async ({ page }) => {
    await searchFromHome(page, 'JavaScript')
    await expect(page).toHaveURL(/\/search\?text=JavaScript/)

    await expect(jobCards(page).first().getByRole('button', { name: 'Aplicar' })).toBeEnabled()

    await openFirstJobDetail(page)
    await page.getByRole('button', { name: 'Aplicar ahora' }).click()
    await expect(page.getByRole('button', { name: 'Aplicado' })).toBeDisabled()
  })

  test('la candidatura se refleja en el listado y en el detalle', async ({ page }) => {
    await page.goto('/search')

    const firstJob = jobCards(page).first()
    await firstJob.getByRole('button', { name: 'Aplicar' }).click()
    await expect(firstJob.getByRole('button', { name: 'Aplicado' })).toBeVisible()

    await openFirstJobDetail(page)
    await expect(page.getByRole('button', { name: 'Aplicado' })).toBeVisible()
  })

  test('permite marcar y desmarcar una oferta como favorita', async ({ page }) => {
    await page.goto('/search')

    const firstJob = jobCards(page).first()
    await firstJob.getByRole('button', { name: 'Agregar a favoritos' }).click()

    const removeButton = firstJob.getByRole('button', { name: 'Quitar de favoritos' })
    await expect(removeButton).toHaveAttribute('aria-pressed', 'true')

    await removeButton.click()
    await expect(firstJob.getByRole('button', { name: 'Agregar a favoritos' })).toBeVisible()
  })

  test('conserva favoritos y candidaturas al recargar la página', async ({ page }) => {
    await page.goto('/search')

    const firstJob = jobCards(page).first()
    await firstJob.getByRole('button', { name: 'Agregar a favoritos' }).click()
    await firstJob.getByRole('button', { name: 'Aplicar' }).click()
    await expect(firstJob.getByRole('button', { name: 'Aplicado' })).toBeVisible()

    await page.reload()

    await expect(firstJob.getByRole('button', { name: 'Quitar de favoritos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(firstJob.getByRole('button', { name: 'Aplicado' })).toBeDisabled()
  })

  test('avisa si la oferta no existe', async ({ page }) => {
    await page.goto('/job/id-que-no-existe')

    await expect(page.getByRole('heading', { name: 'Oferta no encontrada' })).toBeVisible()
  })
})

test.describe('Guardados', () => {
  test('avisa cuando no hay favoritos ni candidaturas', async ({ page }) => {
    await page.goto('/saved')

    await expect(page.getByText('Aún no tienes favoritos')).toBeVisible()

    await page.getByRole('link', { name: 'Candidaturas' }).click()
    await expect(page).toHaveURL(/\/saved\?tab=applications/)
    await expect(page.getByText('Aún no has aplicado a ninguna oferta')).toBeVisible()
  })

  test('muestra los favoritos y quita los que se desmarcan', async ({ page }) => {
    await page.goto('/search')

    const firstJob = jobCards(page).first()
    const title = await firstJob.getByRole('heading', { level: 3 }).innerText()
    await firstJob.getByRole('button', { name: 'Agregar a favoritos' }).click()

    await page.getByRole('link', { name: 'Guardados' }).click()
    await expect(page).toHaveURL(/\/saved$/)
    await expect(jobCards(page)).toHaveCount(1)
    await expect(jobCards(page).first()).toContainText(title)

    await jobCards(page).first().getByRole('button', { name: 'Quitar de favoritos' }).click()
    await expect(page.getByText('Aún no tienes favoritos')).toBeVisible()
  })

  test('muestra las candidaturas en su pestaña', async ({ page }) => {
    await page.goto('/search')

    const firstJob = jobCards(page).first()
    const title = await firstJob.getByRole('heading', { level: 3 }).innerText()
    await firstJob.getByRole('button', { name: 'Aplicar' }).click()
    await expect(firstJob.getByRole('button', { name: 'Aplicado' })).toBeVisible()

    await page.goto('/saved?tab=applications')
    await expect(page.getByRole('link', { name: 'Candidaturas' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(jobCards(page)).toHaveCount(1)
    await expect(jobCards(page).first()).toContainText(title)

    await page.getByRole('link', { name: 'Favoritos' }).click()
    await expect(page.getByText('Aún no tienes favoritos')).toBeVisible()
  })

  test('pagina los favoritos y vuelve atrás al vaciar la última página', async ({ page }) => {
    await page.goto('/search')
    await expect(jobCards(page)).toHaveCount(10)
    for (const card of await jobCards(page).all()) {
      await card.getByRole('button', { name: 'Agregar a favoritos' }).click()
    }

    await page.goto('/search?page=2')
    await jobCards(page).first().getByRole('button', { name: 'Agregar a favoritos' }).click()
    await expect(
      jobCards(page).first().getByRole('button', { name: 'Quitar de favoritos' }),
    ).toBeVisible()

    await page.goto('/saved?page=2')
    await expect(page.getByRole('link', { name: '2', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(jobCards(page)).toHaveCount(1)

    await jobCards(page).first().getByRole('button', { name: 'Quitar de favoritos' }).click()
    await expect(jobCards(page)).toHaveCount(10)
    await expect(page.getByRole('navigation', { name: 'Paginación' })).toHaveCount(0)
  })
})

test.describe('Diseño adaptable', () => {
  test('ninguna página tiene scroll horizontal', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('searchbox')).toBeVisible()
    await expectNoHorizontalScroll(page)

    await page.goto('/search')
    await expect(jobCards(page).first()).toBeVisible()
    await expectNoHorizontalScroll(page)

    await openFirstJobDetail(page)
    await expect(page.getByRole('button', { name: 'Aplicar ahora' })).toBeVisible()
    await expectNoHorizontalScroll(page)

    await page.getByRole('button', { name: 'Aplicar ahora' }).click()
    await page.goto('/saved?tab=applications')
    await expect(jobCards(page).first()).toBeVisible()
    await expectNoHorizontalScroll(page)

    await page.goto('/ruta-que-no-existe')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expectNoHorizontalScroll(page)
  })
})

test.describe('Navegación', () => {
  test('muestra la página 404 en rutas desconocidas', async ({ page }) => {
    await page.goto('/ruta-que-no-existe')

    await expect(page.getByRole('heading', { name: '404 - Página no encontrada' })).toBeVisible()

    await page.getByRole('link', { name: 'Volver al inicio' }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})
