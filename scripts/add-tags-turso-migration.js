/**
 * Migration script to add tags column to Product table in Turso
 * Run with: node scripts/add-tags-turso-migration.js
 */

const { createClient } = require('@libsql/client')
require('dotenv').config()

async function runMigration() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  try {
    console.log('Connecting to Turso database...')
    
    // Check if tags column already exists
    const tableInfo = await client.execute('PRAGMA table_info(Product)')
    const hasTagsColumn = tableInfo.rows.some(row => row.name === 'tags')
    
    if (hasTagsColumn) {
      console.log('✓ Tags column already exists in Product table')
    } else {
      // Add tags column
      await client.execute('ALTER TABLE Product ADD COLUMN tags TEXT')
      console.log('✓ Successfully added tags column to Product table')
    }
    
    console.log('✓ Migration completed successfully!')
  } catch (error) {
    console.error('✗ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await client.close()
  }
}

runMigration()
