const DEFAULT_CORS_ORIGINS = 'http://localhost:5173'

export const config = {
  port: Number(process.env.PORT ?? 3000),
  // Ruta del archivo SQLite. ':memory:' crea una base de datos temporal.
  dbPath: process.env.DB_PATH ?? 'data/jobs.db',
  corsOrigins: (process.env.CORS_ORIGINS ?? DEFAULT_CORS_ORIGINS)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 50,
}
