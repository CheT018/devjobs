import { Router } from 'express'
import type { JobController } from '../controllers/jobs.js'
import { validateBody } from '../middlewares/validation.js'
import { createJobSchema, updateJobSchema } from '../schemas/job.js'

export function createJobsRouter(controller: JobController): Router {
  const router = Router()

  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  router.post('/', validateBody(createJobSchema), controller.create)
  router.patch('/:id', validateBody(updateJobSchema), controller.update)
  router.delete('/:id', controller.delete)

  return router
}
