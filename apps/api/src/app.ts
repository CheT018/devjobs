import cors from 'cors'
import express, { type Express } from 'express'
import { JobController } from './controllers/jobs.js'
import type { Db } from './db/database.js'
import { errorHandler, notFoundHandler } from './middlewares/errors.js'
import { JobModel } from './models/job.js'
import { createJobsRouter } from './routes/jobs.js'

interface AppOptions {
  db: Db
  corsOrigins?: string[]
  /** Si es false, las rutas de escritura responden 403. */
  allowWrites?: boolean
}

/** Crea la aplicación Express sin ponerla a escuchar, para poder testearla. */
export function createApp({ db, corsOrigins = [], allowWrites = false }: AppOptions): Express {
  const app = express()

  app.disable('x-powered-by')
  app.use(cors({ origin: corsOrigins }))
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  const jobController = new JobController(new JobModel(db))
  app.use('/api/jobs', createJobsRouter(jobController, { allowWrites }))

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
