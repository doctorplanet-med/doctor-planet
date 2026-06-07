import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

dotenv.config()

async function run() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url || !authToken) {
    console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set')
    process.exit(1)
  }

  const client = createClient({ url, authToken })

  try {
    await client.execute(
      'ALTER TABLE Category ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0'
    )
    console.log('✅ Added "order" column to Category table')
  } catch (err: any) {
    if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
      console.log('⏭️  "order" column already exists — skipping')
    } else {
      console.error('❌ Migration failed:', err.message)
      process.exit(1)
    }
  } finally {
    client.close()
  }
}

run()
