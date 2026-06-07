import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

dotenv.config()

async function createTables() {
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
    // Add Product columns
    console.log('\n📝 Adding Product columns...')
    const productAlters = [
      `ALTER TABLE Product ADD COLUMN hasCustomization INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE Product ADD COLUMN customizationFields TEXT`,
      `ALTER TABLE Product ADD COLUMN customizationPrice REAL`,
    ]

    for (const sql of productAlters) {
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

    // Create CustomizationCategory table
    console.log('\n📝 Creating CustomizationCategory table...')
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS CustomizationCategory (
          id TEXT NOT NULL PRIMARY KEY,
          productId TEXT NOT NULL,
          name TEXT NOT NULL,
          "order" INTEGER NOT NULL DEFAULT 0,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL,
          FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
        )
      `)
      console.log('  ✅ CustomizationCategory table created')
    } catch (error: any) {
      console.error('  ❌', error.message)
    }

    // Create CustomizationOption table
    console.log('\n📝 Creating CustomizationOption table...')
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS CustomizationOption (
          id TEXT NOT NULL PRIMARY KEY,
          categoryId TEXT NOT NULL,
          name TEXT NOT NULL,
          "order" INTEGER NOT NULL DEFAULT 0,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL,
          FOREIGN KEY (categoryId) REFERENCES CustomizationCategory(id) ON DELETE CASCADE
        )
      `)
      console.log('  ✅ CustomizationOption table created')
    } catch (error: any) {
      console.error('  ❌', error.message)
    }

    console.log('\n✅ Done! Turso database updated.')
    console.log('🎉 You can now create products with customization.')
  } catch (error) {
    console.error('❌ Operation failed:', error)
    process.exit(1)
  } finally {
    client.close()
  }
}

createTables()
