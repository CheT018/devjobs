import assert from 'node:assert/strict'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { after, before, describe, test } from 'node:test'
import type { ApiErrorBody, Job, JobSummary, Paginated } from '@devjobs/shared'
import { createApp } from '../src/app.js'
import { openDatabase, type Db } from '../src/db/database.js'
import { seedDatabase } from '../src/db/seed.js'

const SEED_TOTAL = 34
const FIRST_JOB_ID = '7a4d1d8b-1e45-4d8c-9f1a-8c2f9a9121a4'
const SECOND_JOB_ID = 'd35b2c89-5d60-4f26-b19a-6cfb2f1a0f57'
const UNKNOWN_ID = 'id-que-no-existe'

let db: Db
let server: Server
let baseUrl: string

before(async () => {
  db = openDatabase(':memory:')
  seedDatabase(db)

  const app = createApp({ db, corsOrigins: ['http://localhost:5173'] })

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve())
  })

  const { port } = server.address() as AddressInfo
  baseUrl = `http://localhost:${port}`
})

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
  db.close()
})

async function request<T>(
  method: string,
  path: string,
  expectedStatus: number,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  assert.equal(response.status, expectedStatus, `${method} ${path}`)

  return (response.status === 204 ? null : await response.json()) as T
}

const listJobs = (query = '') => request<Paginated<JobSummary>>('GET', `/api/jobs${query}`, 200)

const validJob = {
  title: 'Desarrollador Frontend',
  company: 'Acme Corp',
  location: 'Remoto',
  description: 'Buscamos desarrollador con experiencia en React y TypeScript',
  data: {
    technology: ['react', 'typescript'],
    modality: 'remote',
    level: 'junior',
  },
}

describe('GET /api/jobs', () => {
  test('devuelve la primera página con el total de ofertas', async () => {
    const json = await listJobs()

    assert.equal(json.total, SEED_TOTAL)
    assert.equal(json.limit, 10)
    assert.equal(json.offset, 0)
    assert.equal(json.data.length, 10)
    assert.equal(json.data[0]?.id, FIRST_JOB_ID)
  })

  test('el listado no incluye el contenido detallado', async () => {
    const json = await listJobs('?limit=1')

    assert.ok(!('content' in json.data[0]!))
  })

  test('respeta limit y offset sin alterar el total', async () => {
    const json = await listJobs('?limit=2&offset=1')

    assert.equal(json.data.length, 2)
    assert.equal(json.limit, 2)
    assert.equal(json.offset, 1)
    assert.equal(json.total, SEED_TOTAL)
    assert.equal(json.data[0]?.id, SECOND_JOB_ID)
  })

  test('filtra por tecnología sin distinguir mayúsculas', async () => {
    const json = await listJobs('?technology=React')

    assert.ok(json.total > 0)
    assert.equal(json.total, json.data.length)
    assert.ok(json.data.every((job) => job.data.technology.includes('react')))
  })

  test('filtra por nivel, modalidad y ubicación', async () => {
    const byLevel = await listJobs('?level=senior&limit=50')
    assert.ok(byLevel.total > 0)
    assert.ok(byLevel.data.every((job) => job.data.level === 'senior'))

    const byModality = await listJobs('?modality=remote&limit=50')
    assert.ok(byModality.total > 0)
    assert.ok(byModality.data.every((job) => job.data.modality === 'remote'))

    const byLocation = await listJobs(`?location=${encodeURIComponent('ciudad de méxico')}`)
    assert.ok(byLocation.total > 0)
    assert.ok(byLocation.data.every((job) => job.location === 'Ciudad de México'))
  })

  test('busca texto en título, empresa, descripción y tecnologías', async () => {
    const byTitle = await listJobs('?text=senior&limit=50')
    assert.ok(byTitle.data.some((job) => job.title.toLowerCase().includes('senior')))

    const byCompany = await listJobs('?text=tech%20solutions')
    assert.ok(byCompany.data.some((job) => job.company === 'Tech Solutions Inc.'))

    const byTechnology = await listJobs('?text=kubernetes&limit=50')
    assert.ok(byTechnology.total > 0)
  })

  test('trata los comodines de SQL como texto literal', async () => {
    const json = await listJobs('?text=%25')

    assert.equal(json.total, 0)
  })

  test('combina filtros y devuelve vacío si nada coincide', async () => {
    const json = await listJobs('?technology=react&text=no-existe-este-texto')

    assert.equal(json.total, 0)
    assert.deepEqual(json.data, [])
  })

  test('rechaza parámetros de consulta no válidos', async () => {
    await request('GET', '/api/jobs?limit=0', 400)
    await request('GET', '/api/jobs?limit=1000', 400)
    await request('GET', '/api/jobs?offset=-1', 400)
    await request('GET', '/api/jobs?level=lead', 400)
  })
})

describe('GET /api/jobs/:id', () => {
  test('devuelve la oferta completa, con su contenido', async () => {
    const job = await request<Job>('GET', `/api/jobs/${SECOND_JOB_ID}`, 200)

    assert.equal(job.id, SECOND_JOB_ID)
    assert.ok(job.content?.description)
    assert.ok(job.content?.responsibilities)
  })

  test('responde 404 si el id no existe', async () => {
    const json = await request<ApiErrorBody>('GET', `/api/jobs/${UNKNOWN_ID}`, 404)

    assert.equal(json.message, 'Job not found')
  })
})

describe('POST /api/jobs', () => {
  test('crea la oferta y la devuelve con un id generado', async () => {
    const created = await request<Job>('POST', '/api/jobs', 201, validJob)

    assert.ok(created.id.length > 0)
    assert.equal(created.title, validJob.title)
    assert.deepEqual(created.data, validJob.data)

    const stored = await request<Job>('GET', `/api/jobs/${created.id}`, 200)
    assert.deepEqual(stored, created)
  })

  test('guarda el contenido detallado cuando se envía', async () => {
    const content = {
      description: 'Descripción larga',
      responsibilities: '- Una\n- Dos',
      requirements: '- Tres',
      about: 'Sobre la empresa',
    }

    const created = await request<Job>('POST', '/api/jobs', 201, { ...validJob, content })

    assert.deepEqual(created.content, content)
  })

  test('normaliza las tecnologías a minúsculas y sin duplicados', async () => {
    const created = await request<Job>('POST', '/api/jobs', 201, {
      ...validJob,
      data: { ...validJob.data, technology: [' React ', 'react', 'Node'] },
    })

    assert.deepEqual(created.data.technology, ['react', 'node'])
  })

  test('responde 400 con el detalle de los campos no válidos', async () => {
    const json = await request<ApiErrorBody>('POST', '/api/jobs', 400, {
      ...validJob,
      title: 'ab',
      data: { ...validJob.data, level: 'lead' },
    })

    assert.equal(json.message, 'Validation error')

    const fields = json.errors?.map((error) => error.field)
    assert.deepEqual(fields, ['title', 'data.level'])
  })

  test('responde 400 si falta un campo obligatorio o el tipo es incorrecto', async () => {
    const { title: _title, ...withoutTitle } = validJob

    await request('POST', '/api/jobs', 400, withoutTitle)
    await request('POST', '/api/jobs', 400, { ...validJob, title: 12345 })
    await request('POST', '/api/jobs', 400, { ...validJob, title: 'a'.repeat(101) })
  })

  test('responde 400 si el body no es JSON válido', async () => {
    const response = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ esto no es json',
    })

    assert.equal(response.status, 400)
  })
})

describe('PATCH /api/jobs/:id', () => {
  test('actualiza solo los campos enviados', async () => {
    const created = await request<Job>('POST', '/api/jobs', 201, validJob)

    const updated = await request<Job>('PATCH', `/api/jobs/${created.id}`, 200, {
      title: 'Frontend Architect',
      data: { level: 'senior' },
    })

    assert.equal(updated.title, 'Frontend Architect')
    assert.equal(updated.data.level, 'senior')

    assert.equal(updated.company, created.company)
    assert.equal(updated.data.modality, created.data.modality)
    assert.deepEqual(updated.data.technology, created.data.technology)
  })

  test('reemplaza las tecnologías y completa el contenido por partes', async () => {
    const created = await request<Job>('POST', '/api/jobs', 201, validJob)

    await request<Job>('PATCH', `/api/jobs/${created.id}`, 200, {
      data: { technology: ['vue'] },
      content: { about: 'Primera versión' },
    })

    const updated = await request<Job>('PATCH', `/api/jobs/${created.id}`, 200, {
      content: { requirements: '- Experiencia' },
    })

    assert.deepEqual(updated.data.technology, ['vue'])
    assert.equal(updated.content?.about, 'Primera versión')
    assert.equal(updated.content?.requirements, '- Experiencia')
  })

  test('responde 400 con datos no válidos y 404 si el id no existe', async () => {
    await request('PATCH', `/api/jobs/${FIRST_JOB_ID}`, 400, { title: 'ab' })
    await request('PATCH', `/api/jobs/${UNKNOWN_ID}`, 404, { title: 'Nuevo título' })
  })
})

describe('DELETE /api/jobs/:id', () => {
  test('elimina la oferta', async () => {
    const created = await request<Job>('POST', '/api/jobs', 201, validJob)

    await request('DELETE', `/api/jobs/${created.id}`, 204)
    await request('GET', `/api/jobs/${created.id}`, 404)
  })

  test('responde 404 si el id no existe', async () => {
    await request('DELETE', `/api/jobs/${UNKNOWN_ID}`, 404)
  })
})

describe('Aplicación', () => {
  test('expone un health check', async () => {
    const json = await request<{ status: string }>('GET', '/api/health', 200)

    assert.equal(json.status, 'ok')
  })

  test('responde 404 en rutas desconocidas', async () => {
    await request('GET', '/api/no-existe', 404)
  })

  test('solo envía cabeceras CORS a los orígenes permitidos', async () => {
    const allowed = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5173' },
    })
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173')

    const blocked = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'https://otro-sitio.example' },
    })
    assert.equal(blocked.headers.get('access-control-allow-origin'), null)
  })
})
