import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
dotenv.config()

async function run() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) { console.error('Missing credentials'); process.exit(1) }
  const client = createClient({ url, authToken })

  for (const col of [
    `ALTER TABLE "Product" ADD COLUMN "isCollection" INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE "Product" ADD COLUMN "isBestSelling" INTEGER NOT NULL DEFAULT 0`,
  ]) {
    try {
      await client.execute(col)
      console.log('✅', col.slice(0, 60))
    } catch (e: any) {
      if (e.message?.includes('duplicate column')) console.log('⏭️  Already exists')
      else { console.error('❌', e.message); process.exit(1) }
    }
  }
  client.close()
  console.log('✅ Done')
}
run()
