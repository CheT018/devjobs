import type { ApiErrorBody } from '@devjobs/shared'
import type { RequestHandler } from 'express'

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export const readOnly: RequestHandler = (req, res, next) => {
  if (READ_METHODS.has(req.method)) {
    next()
    return
  }

  const body: ApiErrorBody = { message: 'Write operations are disabled' }
  res.status(403).json(body)
}
