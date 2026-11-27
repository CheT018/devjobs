import { Router } from 'express'
import type { JobController } from '../controllers/jobs.js'
import { readOnly } from '../middlewares/read-only.js'
import { validateBody } from '../middlewares/validation.js'
import { createJobSchema, updateJobSchema } from '../schemas/job.js'

interface JobsRouterOptions {
  allowWrites: boolean
}

export function createJobsRouter(controller: JobController, { allowWrites }: JobsRouterOptions): Router {
  const router = Router()

  // Va antes que las rutas, para cortar las escrituras sin llegar a validar el body
  if (!allowWrites) router.use(readOnly)

  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  router.post('/', validateBody(createJobSchema), controller.create)
  router.patch('/:id', validateBody(updateJobSchema), controller.update)
  router.delete('/:id', controller.delete)

  return router
}
