import { z } from 'zod'
import { PAGINATION } from '../config.js'

const modalitySchema = z.enum(['remote', 'onsite', 'hybrid'])
const levelSchema = z.enum(['junior', 'mid', 'senior'])

const shortText = (field: string, max = 100) =>
  z
    .string({ error: `${field} must be a string` })
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} must be at most ${max} characters`)

const longText = z.string().trim().max(10_000)

const jobDataSchema = z.object({
  technology: z
    .array(z.string().trim().toLowerCase().min(1).max(40), {
      error: 'technology must be an array of strings',
    })
    .max(30),
  modality: modalitySchema,
  level: levelSchema,
})

const jobContentSchema = z.object({
  description: longText,
  responsibilities: longText,
  requirements: longText,
  about: longText,
})

export const createJobSchema = z.object({
  title: shortText('title').min(3, 'title must be at least 3 characters'),
  company: shortText('company'),
  location: shortText('location'),
  description: shortText('description', 1000),
  data: jobDataSchema,
  content: jobContentSchema.optional(),
})

// En una actualización parcial todos los campos son opcionales, también los
// anidados: se puede cambiar solo el nivel o solo un apartado del contenido.
export const updateJobSchema = createJobSchema.partial().extend({
  data: jobDataSchema.partial().optional(),
  content: jobContentSchema.partial().optional(),
})

const optionalFilter = z.string().trim().max(100).optional()

export const listJobsQuerySchema = z.object({
  text: optionalFilter,
  technology: optionalFilter,
  location: optionalFilter,
  modality: modalitySchema.optional(),
  level: levelSchema.optional(),
  limit: z.coerce.number().int().min(1).max(PAGINATION.maxLimit).default(PAGINATION.defaultLimit),
  offset: z.coerce.number().int().min(0).default(0),
})
