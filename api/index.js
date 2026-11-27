// Punto de entrada de la API en Vercel. Vercel ejecuta como función cada
// archivo de /api, y vercel.json envía aquí todas las rutas /api/*.
// Usa la API ya compilada (`pnpm build` genera apps/api/dist).
import { createApp } from '../apps/api/dist/app.js'
import { openDatabase } from '../apps/api/dist/db/database.js'
import { seedDatabase } from '../apps/api/dist/db/seed.js'

// La demo es de solo lectura: cada instancia crea la base de datos en memoria
// y carga las ofertas de ejemplo al arrancar, así que no necesita disco.
const db = openDatabase(':memory:')
seedDatabase(db)

export default createApp({
  db,
  // Solo ALLOW_WRITES=true activa las escrituras, sin depender de NODE_ENV
  allowWrites: process.env.ALLOW_WRITES === 'true',
})
