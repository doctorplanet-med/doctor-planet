const { createClient } = require('@libsql/client')

async function addCostPriceColumn() {
    require('dotenv').config()

    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    })

    console.log('🔗 Connected to Turso database')
    console.log('📝 Adding costPrice column to POSSaleItem...\n')

    try {
        // Check if column already exists
        const tableInfo = await client.execute(`PRAGMA table_info(POSSaleItem)`)
        const columns = tableInfo.rows.map(r => r.name)

        if (columns.includes('costPrice')) {
            console.log('✅ costPrice column already exists in POSSaleItem!')
        } else {
            // Add costPrice column (nullable REAL)
            await client.execute(`ALTER TABLE POSSaleItem ADD COLUMN costPrice REAL`)
            console.log('✅ costPrice column added to POSSaleItem successfully!')
        }

        // Verify
        console.log('\n📊 POSSaleItem columns:')
        const info = await client.execute(`PRAGMA table_info(POSSaleItem)`)
        info.rows.forEach(row => {
            console.log(`  - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : 'NULL'} ${row.dflt_value ? `DEFAULT ${row.dflt_value}` : ''}`)
        })

        // Backfill costPrice from the Product table for existing items
        console.log('\n🔄 Backfilling costPrice for existing POSSaleItem records...')
        const result = await client.execute(`
      UPDATE POSSaleItem
      SET costPrice = (
        SELECT p.costPrice FROM Product p WHERE p.id = POSSaleItem.productId
      )
      WHERE costPrice IS NULL
    `)
        console.log(`✅ Updated ${result.rowsAffected} rows with costPrice from Product table.`)

        console.log('\n✅ Migration completed successfully!')
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message)
        process.exit(1)
    }
}

addCostPriceColumn()
    .then(() => {
        console.log('\n🎉 Done!')
        process.exit(0)
    })
    .catch(err => {
        console.error('Fatal error:', err)
        process.exit(1)
    })
