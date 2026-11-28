import { config } from '../config.js'
import { openDatabase } from './database.js'
import { seedDatabase } from './seed.js'

const db = openDatabase(config.dbPath)

db.exec('DELETE FROM jobs')
const total = seedDatabase(db)
db.close()

console.log(`Base de datos restablecida en ${config.dbPath}: ${total} ofertas cargadas.`)
