import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
dotenv.config()

async function run() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) { console.error('Missing Turso credentials'); process.exit(1) }

  const client = createClient({ url, authToken })
  try {
    await client.execute(`ALTER TABLE "Product" ADD COLUMN "isNewArrival" INTEGER NOT NULL DEFAULT 0`)
    console.log('✅ Added isNewArrival column to Product')
  } catch (err: any) {
    if (err.message?.includes('duplicate column')) {
      console.log('⏭️  Column already exists')
    } else {
      console.error('❌', err.message); process.exit(1)
    }
  }
  client.close()
}
run()
