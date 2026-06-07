/**
 * Test script to verify tags are being stored and retrieved correctly
 * Run with: node scripts/test-tags.js
 */

const { createClient } = require('@libsql/client')
require('dotenv').config()

async function testTags() {
  // Check environment variables
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ Missing Turso credentials in .env file')
    return
  }

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  try {
    console.log('Fetching products with tags...\n')
    
    const result = await client.execute(
      'SELECT id, name, slug, tags FROM Product WHERE tags IS NOT NULL LIMIT 5'
    )

    if (result.rows.length === 0) {
      console.log('❌ No products found with tags.')
      console.log('   Please add tags to a product in the admin panel first.')
    } else {
      console.log(`✓ Found ${result.rows.length} product(s) with tags:\n`)
      result.rows.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
        console.log(`   Slug: ${product.slug}`)
        console.log(`   Tags (raw): ${product.tags}`)
        if (product.tags) {
          try {
            const parsedTags = JSON.parse(product.tags)
            console.log(`   Tags (parsed): [${parsedTags.join(', ')}]`)
          } catch (e) {
            console.log(`   ⚠️  Error parsing tags: ${e.message}`)
          }
        }
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
  }
}

testTags()
