import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
dotenv.config()

async function run() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) { console.error('Missing Turso credentials'); process.exit(1) }

  const client = createClient({ url, authToken })

  const statements = [
    `CREATE TABLE IF NOT EXISTS "SubCategory" (
      "id"         TEXT    NOT NULL PRIMARY KEY,
      "name"       TEXT    NOT NULL,
      "slug"       TEXT    NOT NULL,
      "categoryId" TEXT    NOT NULL,
      "order"      INTEGER NOT NULL DEFAULT 0,
      "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE,
      UNIQUE ("categoryId", "slug")
    )`,
    `ALTER TABLE "Product" ADD COLUMN "subCategoryId" TEXT REFERENCES "SubCategory"("id")`,
  ]

  for (const sql of statements) {
    try {
      await client.execute(sql)
      console.log('✅', sql.slice(0, 60).trim(), '...')
    } catch (err: any) {
      if (err.message?.includes('already exists') || err.message?.includes('duplicate column')) {
        console.log('⏭️  Already exists — skipping')
      } else {
        console.error('❌', err.message)
        process.exit(1)
      }
    }
  }

  client.close()
  console.log('\n✅ SubCategory migration complete')
}

run()
