import type { ApiErrorBody, Job, JobSummary, Paginated } from '@devjobs/shared'
import type { Request, Response } from 'express'
import type { JobModel } from '../models/job.js'
import { listJobsQuerySchema } from '../schemas/job.js'

type IdParams = { id: string }

const jobNotFound: ApiErrorBody = { message: 'Job not found' }

export class JobController {
  readonly #model: JobModel

  constructor(model: JobModel) {
    this.#model = model
  }

  // GET /api/jobs
  getAll = (req: Request, res: Response<Paginated<JobSummary>>): void => {
    const { limit, offset, ...filters } = listJobsQuerySchema.parse(req.query)
    const { jobs, total } = this.#model.getAll(filters, { limit, offset })

    res.json({ data: jobs, total, limit, offset })
  }

  // GET /api/jobs/:id
  getById = (req: Request<IdParams>, res: Response<Job | ApiErrorBody>): void => {
    const job = this.#model.getById(req.params.id)

    if (!job) {
      res.status(404).json(jobNotFound)
      return
    }

    res.json(job)
  }

  // POST /api/jobs (el body llega validado por el middleware)
  create = (req: Request, res: Response<Job>): void => {
    const job = this.#model.create(req.body)
    res.status(201).json(job)
  }

  // PATCH /api/jobs/:id
  update = (req: Request<IdParams>, res: Response<Job | ApiErrorBody>): void => {
    const job = this.#model.update(req.params.id, req.body)

    if (!job) {
      res.status(404).json(jobNotFound)
      return
    }

    res.json(job)
  }

  // DELETE /api/jobs/:id
  delete = (req: Request<IdParams>, res: Response<ApiErrorBody>): void => {
    const deleted = this.#model.delete(req.params.id)

    if (!deleted) {
      res.status(404).json(jobNotFound)
      return
    }

    res.status(204).send()
  }
}
