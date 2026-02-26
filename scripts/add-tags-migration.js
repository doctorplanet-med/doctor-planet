/**
 * Migration script to add tags column to Product table
 * Run with: node scripts/add-tags-migration.js
 */

const Database = require('better-sqlite3')
const path = require('path')

// Get database path from environment or use default
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'dev.db')
console.log('Using database:', dbPath)

try {
  const db = new Database(dbPath)
  
  // Check if tags column already exists
  const tableInfo = db.prepare("PRAGMA table_info(Product)").all()
  const hasTagsColumn = tableInfo.some(col => col.name === 'tags')
  
  if (hasTagsColumn) {
    console.log('✓ Tags column already exists in Product table')
  } else {
    // Add tags column
    db.prepare('ALTER TABLE Product ADD COLUMN tags TEXT').run()
    console.log('✓ Successfully added tags column to Product table')
  }
  
  db.close()
  console.log('✓ Migration completed successfully!')
} catch (error) {
  console.error('✗ Migration failed:', error.message)
  process.exit(1)
}
