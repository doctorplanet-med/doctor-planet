import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

dotenv.config()

async function addReturnFields() {
  const dbUrl = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!dbUrl || !authToken) {
    console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set')
    process.exit(1)
  }

  console.log('🔄 Connecting to Turso database...')
  const client = createClient({
    url: dbUrl,
    authToken: authToken,
  })

  try {
    // Add return fields to Order table
    console.log('\n📝 Adding return fields to Order table...')
    const orderAlters = [
      `ALTER TABLE "Order" ADD COLUMN isReturned INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE "Order" ADD COLUMN returnReason TEXT`,
      `ALTER TABLE "Order" ADD COLUMN returnedAt DATETIME`,
      `ALTER TABLE "Order" ADD COLUMN returnedBy TEXT`,
    ]

    for (const sql of orderAlters) {
      try {
        await client.execute(sql)
        console.log(`  ✅ ${sql.substring(0, 60)}...`)
      } catch (error: any) {
        if (error.message.includes('duplicate column')) {
          console.log(`  ⏭️  Column already exists`)
        } else {
          console.error(`  ❌ ${error.message}`)
        }
      }
    }

    // Add customization fields to OrderItem table
    console.log('\n📝 Adding customization fields to OrderItem table...')
    const orderItemAlters = [
      `ALTER TABLE OrderItem ADD COLUMN customization TEXT`,
      `ALTER TABLE OrderItem ADD COLUMN customizationPrice REAL`,
    ]

    for (const sql of orderItemAlters) {
      try {
        await client.execute(sql)
        console.log(`  ✅ ${sql.substring(0, 60)}...`)
      } catch (error: any) {
        if (error.message.includes('duplicate column')) {
          console.log(`  ⏭️  Column already exists`)
        } else {
          console.error(`  ❌ ${error.message}`)
        }
      }
    }

    // Add return fields to POSSale table
    console.log('\n📝 Adding return fields to POSSale table...')
    const posSaleAlters = [
      `ALTER TABLE POSSale ADD COLUMN isReturned INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE POSSale ADD COLUMN returnReason TEXT`,
      `ALTER TABLE POSSale ADD COLUMN returnedAt DATETIME`,
      `ALTER TABLE POSSale ADD COLUMN returnedBy TEXT`,
      `ALTER TABLE POSSale ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    ]

    for (const sql of posSaleAlters) {
      try {
        await client.execute(sql)
        console.log(`  ✅ ${sql.substring(0, 60)}...`)
      } catch (error: any) {
        if (error.message.includes('duplicate column')) {
          console.log(`  ⏭️  Column already exists`)
        } else {
          console.error(`  ❌ ${error.message}`)
        }
      }
    }

    // Add customization fields to POSSaleItem table
    console.log('\n📝 Adding customization fields to POSSaleItem table...')
    const posSaleItemAlters = [
      `ALTER TABLE POSSaleItem ADD COLUMN customization TEXT`,
      `ALTER TABLE POSSaleItem ADD COLUMN customizationPrice REAL`,
    ]

    for (const sql of posSaleItemAlters) {
      try {
        await client.execute(sql)
        console.log(`  ✅ ${sql.substring(0, 60)}...`)
      } catch (error: any) {
        if (error.message.includes('duplicate column')) {
          console.log(`  ⏭️  Column already exists`)
        } else {
          console.error(`  ❌ ${error.message}`)
        }
      }
    }

    console.log('\n✅ Done! Database updated with return and customization fields.')
    console.log('📊 Summary:')
    console.log('  - Order: Added return tracking fields')
    console.log('  - OrderItem: Added customization fields')
    console.log('  - POSSale: Added return tracking fields')
    console.log('  - POSSaleItem: Added customization fields')
  } catch (error) {
    console.error('❌ Operation failed:', error)
    process.exit(1)
  } finally {
    client.close()
  }
}

addReturnFields()
