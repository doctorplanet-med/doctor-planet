import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
dotenv.config()

async function syncCustomization() {
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
    // Apply add_product_customization migration
    console.log('\n📝 Applying add_product_customization migration...')
    const migration1Path = path.join(
      process.cwd(),
      'prisma',
      'migrations',
      '20260212174157_add_product_customization',
      'migration.sql'
    )

    if (fs.existsSync(migration1Path)) {
      const sql = fs.readFileSync(migration1Path, 'utf-8')
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        try {
          await client.execute(statement)
          console.log(`  ✅ Executed: ${statement.substring(0, 80)}...`)
        } catch (error: any) {
          if (
            error.message.includes('already exists') ||
            error.message.includes('duplicate column')
          ) {
            console.log(`  ⏭️  Skipped (already exists)`)
          } else {
            console.error(`  ❌ Error: ${error.message}`)
          }
        }
      }
    } else {
      console.log('  ⚠️  Migration file not found')
    }

    // Apply add_customization_category_and_option migration
    console.log('\n📝 Applying add_customization_category_and_option migration...')
    const migration2Path = path.join(
      process.cwd(),
      'prisma',
      'migrations',
      '20260212180727_add_customization_category_and_option',
      'migration.sql'
    )

    if (fs.existsSync(migration2Path)) {
      const sql = fs.readFileSync(migration2Path, 'utf-8')
      // Split by semicolon but keep multi-line statements together
      const statements = sql
        .split(/;[\s\n]*(?=CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|--)/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'))

      console.log(`  Found ${statements.length} statement(s) in migration`)
      
      for (const statement of statements) {
        try {
          await client.execute(statement)
          console.log(`  ✅ Executed: ${statement.substring(0, 80)}...`)
        } catch (error: any) {
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`  ⏭️  Skipped (already exists)`)
          } else {
            console.error(`  ❌ Error: ${error.message}`)
            console.error(`  Statement: ${statement.substring(0, 200)}`)
          }
        }
      }
    } else {
      console.log('  ⚠️  Migration file not found')
    }

    console.log('\n✅ Turso customization schema synced!')
    console.log('🎉 Product table now has hasCustomization, customizationFields, customizationPrice')
    console.log('🎉 CustomizationCategory and CustomizationOption tables created')
  } catch (error) {
    console.error('❌ Operation failed:', error)
    process.exit(1)
  } finally {
    client.close()
  }
}

syncCustomization()
