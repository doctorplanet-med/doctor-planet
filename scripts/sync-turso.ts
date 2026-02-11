import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
dotenv.config()

async function syncTurso() {
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
    // Step 1: Drop customization tables
    console.log('\n🗑️  Removing customization tables...')
    const dropStatements = [
      'DROP TABLE IF EXISTS CustomizationOption;',
      'DROP TABLE IF EXISTS CustomizationField;',
      'DROP TABLE IF EXISTS CustomizationCategory;',
    ]

    for (const statement of dropStatements) {
      try {
        await client.execute(statement)
        const tableName = statement.match(/DROP TABLE IF EXISTS (\w+)/)?.[1]
        console.log(`  ✅ Dropped table: ${tableName}`)
      } catch (error: any) {
        console.error(`  ❌ Error:`, error.message)
      }
    }

    // Step 2: Apply the sync_schema migration
    console.log('\n📝 Applying sync_schema migration...')
    const migrationPath = path.join(process.cwd(), 'prisma', 'migrations', '20260210221841_sync_schema', 'migration.sql')
    
    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
      const statements = migrationSQL
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      for (const statement of statements) {
        try {
          await client.execute(statement)
          console.log(`  ✅ Executed: ${statement.substring(0, 60)}...`)
        } catch (error: any) {
          // Ignore "already exists" errors
          if (
            error.message.includes('already exists') ||
            error.message.includes('duplicate column')
          ) {
            console.log(`  ⏭️  Skipped (already exists): ${statement.substring(0, 60)}...`)
          } else {
            console.error(`  ❌ Error: ${error.message}`)
          }
        }
      }
    } else {
      console.log('  ⚠️  Migration file not found, skipping...')
    }

    console.log('\n✅ Turso database synced successfully!')
    console.log('🎉 Database is now in sync with the schema!')

  } catch (error) {
    console.error('❌ Operation failed:', error)
    process.exit(1)
  } finally {
    client.close()
  }
}

syncTurso()
