import type { ApiErrorBody } from '@devjobs/shared'
import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'

export const notFoundHandler: RequestHandler = (req, res) => {
  const body: ApiErrorBody = { message: `Route not found: ${req.method} ${req.path}` }
  res.status(404).json(body)
}

function isHttpError(error: unknown): error is { status: number; expose?: boolean } {
  return typeof error === 'object' && error !== null && 'status' in error
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    const body: ApiErrorBody = {
      message: 'Validation error',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    }
    res.status(400).json(body)
    return
  }

  // Errores del propio Express, como un JSON mal formado en el body
  if (isHttpError(error) && error.status >= 400 && error.status < 500) {
    const body: ApiErrorBody = { message: 'Invalid request' }
    res.status(error.status).json(body)
    return
  }

  console.error(error)
  const body: ApiErrorBody = { message: 'Internal server error' }
  res.status(500).json(body)
}
