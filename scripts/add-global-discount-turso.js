const { createClient } = require('@libsql/client')

async function addGlobalDiscountTable() {
  require('dotenv').config()
  
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  })

  console.log('🔗 Connected to Turso database')
  console.log('📝 Adding GlobalDiscount table...\n')

  try {
    // Check if table already exists
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='GlobalDiscount'
    `)

    if (tables.rows.length > 0) {
      console.log('✅ GlobalDiscount table already exists!')
    } else {
      // Create GlobalDiscount table
      await client.execute(`
        CREATE TABLE GlobalDiscount (
          id TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
          isActive BOOLEAN NOT NULL DEFAULT 0,
          percentage REAL NOT NULL DEFAULT 0,
          startDate DATETIME,
          endDate DATETIME,
          createdBy TEXT,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL
        )
      `)
      console.log('✅ GlobalDiscount table created successfully!')

      // Create default record
      await client.execute({
        sql: `INSERT INTO GlobalDiscount (id, isActive, percentage, updatedAt) VALUES (?, ?, ?, ?)`,
        args: ['main', 0, 0, new Date().toISOString()]
      })
      console.log('✅ Default record created (inactive, 0%)')
    }

    // Verify table structure
    console.log('\n📊 Table structure:')
    const tableInfo = await client.execute(`PRAGMA table_info(GlobalDiscount)`)
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : 'NULL'} ${row.dflt_value ? `DEFAULT ${row.dflt_value}` : ''}`)
    })

    // Check current data
    console.log('\n📋 Current data:')
    const data = await client.execute(`SELECT * FROM GlobalDiscount`)
    if (data.rows.length > 0) {
      data.rows.forEach(row => {
        console.log(`  - ID: ${row.id}`)
        console.log(`    Active: ${row.isActive ? 'Yes' : 'No'}`)
        console.log(`    Percentage: ${row.percentage}%`)
        console.log(`    Start Date: ${row.startDate || 'Not set'}`)
        console.log(`    End Date: ${row.endDate || 'Not set'}`)
      })
    } else {
      console.log('  No data yet')
    }

    console.log('\n✅ Migration completed successfully!')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

addGlobalDiscountTable()
  .then(() => {
    console.log('\n🎉 Done!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
