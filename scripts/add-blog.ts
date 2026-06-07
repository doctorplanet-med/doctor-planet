import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
dotenv.config()

async function run() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) { console.error('Missing credentials'); process.exit(1) }
  const client = createClient({ url, authToken })

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "Blog" (
        "id"          TEXT     NOT NULL PRIMARY KEY,
        "title"       TEXT     NOT NULL,
        "slug"        TEXT     NOT NULL UNIQUE,
        "excerpt"     TEXT,
        "content"     TEXT     NOT NULL,
        "image"       TEXT,
        "author"      TEXT     NOT NULL DEFAULT 'Doctor Planet',
        "isPublished" INTEGER  NOT NULL DEFAULT 0,
        "tags"        TEXT,
        "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Blog table created')
  } catch (e: any) {
    if (e.message?.includes('already exists')) console.log('⏭️  Blog table already exists')
    else { console.error('❌', e.message); process.exit(1) }
  }
  client.close()
}
run()
