import { createApp } from './app.js'
import { config } from './config.js'
import { openDatabase } from './db/database.js'
import { seedIfEmpty } from './db/seed.js'

const db = openDatabase(config.dbPath)

const seeded = seedIfEmpty(db)
if (seeded > 0) {
  console.log(`Base de datos vacía: ${seeded} ofertas de ejemplo cargadas.`)
}

const app = createApp({
  db,
  corsOrigins: config.corsOrigins,
  allowWrites: config.allowWrites,
})

const server = app.listen(config.port, () => {
  console.log(`API de DevJobs en http://localhost:${config.port}/api`)
  if (!config.allowWrites) {
    console.log('Modo solo lectura: POST, PATCH y DELETE responden 403.')
  }
})

// Cierre ordenado: deja de aceptar conexiones y cierra la base de datos.
function shutdown(): void {
  server.close(() => {
    db.close()
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
