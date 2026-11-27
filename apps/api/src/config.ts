const DEFAULT_CORS_ORIGINS = 'http://localhost:5173'

/**
 * Las escrituras (POST, PATCH, DELETE) se desactivan por defecto en producción.
 * ALLOW_WRITES=true o ALLOW_WRITES=false fuerza el comportamiento.
 */
function resolveAllowWrites(): boolean {
  const value = process.env.ALLOW_WRITES?.trim()
  if (value) return value === 'true'
  return process.env.NODE_ENV !== 'production'
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  // Ruta del archivo SQLite. ':memory:' crea una base de datos temporal.
  dbPath: process.env.DB_PATH ?? 'data/jobs.db',
  corsOrigins: (process.env.CORS_ORIGINS ?? DEFAULT_CORS_ORIGINS)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  allowWrites: resolveAllowWrites(),
}

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 50,
}
