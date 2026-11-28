import type { Job } from '@devjobs/shared'
import { JobModel } from '../models/job.js'
import type { Db } from './database.js'
import seedData from './seed-data.json' with { type: 'json' }

const seedJobs = seedData as Job[]

export function seedDatabase(db: Db): number {
  const model = new JobModel(db)

  db.transaction(() => {
    for (const job of seedJobs) {
      model.insert(job)
    }
  })()

  return seedJobs.length
}

export function seedIfEmpty(db: Db): number {
  return new JobModel(db).count() === 0 ? seedDatabase(db) : 0
}
