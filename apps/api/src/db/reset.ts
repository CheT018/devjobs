// Script de `pnpm seed`: borra las ofertas y vuelve a cargar los datos de ejemplo.
import { config } from '../config.js'
import { openDatabase } from './database.js'
import { seedDatabase } from './seed.js'

const db = openDatabase(config.dbPath)

db.exec('DELETE FROM jobs')
const total = seedDatabase(db)
db.close()

console.log(`Base de datos restablecida en ${config.dbPath}: ${total} ofertas cargadas.`)
