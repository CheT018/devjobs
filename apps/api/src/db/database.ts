import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

export type Db = Database.Database

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    modality TEXT NOT NULL CHECK (modality IN ('remote', 'onsite', 'hybrid')),
    level TEXT NOT NULL CHECK (level IN ('junior', 'mid', 'senior'))
  );

  CREATE TABLE IF NOT EXISTS job_technologies (
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    technology TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (job_id, technology)
  );

  CREATE INDEX IF NOT EXISTS idx_job_technologies_technology
    ON job_technologies (technology);

  CREATE TABLE IF NOT EXISTS job_content (
    job_id TEXT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    responsibilities TEXT NOT NULL,
    requirements TEXT NOT NULL,
    about TEXT NOT NULL
  );
`

export function openDatabase(dbPath: string): Db {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true })
  }

  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)

  return db
}
