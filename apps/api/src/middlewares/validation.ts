import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'

/**
 * Valida el body con el schema indicado y lo sustituye por los datos ya
 * validados. Si no cumple, el ZodError llega al middleware de errores.
 */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body)
    next()
  }
}
