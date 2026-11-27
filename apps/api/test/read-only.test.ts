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

let db: Db
let server: Server
let baseUrl: string

before(async () => {
  db = openDatabase(':memory:')
  seedDatabase(db)

  // Sin allowWrites: la app arranca en modo solo lectura
  const app = createApp({ db })

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

function send(method: string, path: string, body?: unknown): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('Modo solo lectura', () => {
  test('las rutas de lectura siguen funcionando', async () => {
    const list = await send('GET', '/api/jobs')
    assert.equal(list.status, 200)

    const detail = await send('GET', `/api/jobs/${FIRST_JOB_ID}`)
    assert.equal(detail.status, 200)
    assert.equal(((await detail.json()) as Job).id, FIRST_JOB_ID)
  })

  test('POST, PATCH y DELETE responden 403', async () => {
    const attempts = [
      send('POST', '/api/jobs', { title: 'Oferta nueva' }),
      send('PATCH', `/api/jobs/${FIRST_JOB_ID}`, { title: 'Título cambiado' }),
      send('DELETE', `/api/jobs/${FIRST_JOB_ID}`),
    ]

    for (const response of await Promise.all(attempts)) {
      assert.equal(response.status, 403, response.url)
      const json = (await response.json()) as ApiErrorBody
      assert.equal(json.message, 'Write operations are disabled')
    }
  })

  test('rechaza la escritura antes de validar el body o buscar el id', async () => {
    const invalidBody = await send('POST', '/api/jobs', { title: 'ab' })
    assert.equal(invalidBody.status, 403)

    const unknownId = await send('DELETE', '/api/jobs/id-que-no-existe')
    assert.equal(unknownId.status, 403)
  })

  test('los datos no cambian tras los intentos de escritura', async () => {
    const list = await send('GET', '/api/jobs')
    assert.equal(((await list.json()) as Paginated<JobSummary>).total, SEED_TOTAL)

    const detail = await send('GET', `/api/jobs/${FIRST_JOB_ID}`)
    assert.notEqual(((await detail.json()) as Job).title, 'Título cambiado')
  })
})
