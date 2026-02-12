import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

dotenv.config()

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function addSizeGuideTable() {
  console.log('🚀 Adding SizeGuide table to Turso database...\n')

  try {
    // Create SizeGuide table
    console.log('📝 Creating SizeGuide table...')
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS SizeGuide (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        images TEXT NOT NULL,
        content TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ SizeGuide table created successfully!')

    // Add some default size guide entries
    console.log('\n📝 Adding default size guide entries...')
    
    const defaultGuides = [
      {
        id: 'sg_' + Date.now() + '_1',
        title: 'How to Measure',
        description: 'Learn how to take accurate measurements for the perfect fit',
        category: 'general',
        images: JSON.stringify([]),
        content: JSON.stringify({
          type: 'text',
          text: `For the most accurate fit, take your measurements while wearing lightweight clothing:

**Chest**: Measure around the fullest part of your chest, keeping the tape horizontal.

**Waist**: Measure around your natural waistline, keeping the tape comfortably loose.

**Hips**: Measure around the fullest part of your hips.

**Inseam**: Measure from the crotch to the bottom of your ankle.

If you're between sizes, we recommend sizing up for a more comfortable fit during long shifts.`
        }),
        order: 1,
        isActive: 1
      },
      {
        id: 'sg_' + Date.now() + '_2',
        title: 'Scrub Tops Size Chart',
        description: 'Find your perfect scrub top size',
        category: 'scrubs-tops',
        images: JSON.stringify([]),
        content: JSON.stringify({
          type: 'table',
          headers: ['Size', 'Chest (inches)', 'Length (inches)'],
          rows: [
            ['XS', '32-34"', '25"'],
            ['S', '35-37"', '26"'],
            ['M', '38-40"', '27"'],
            ['L', '41-43"', '28"'],
            ['XL', '44-46"', '29"'],
            ['2XL', '47-49"', '30"']
          ]
        }),
        order: 2,
        isActive: 1
      },
      {
        id: 'sg_' + Date.now() + '_3',
        title: 'Scrub Pants Size Chart',
        description: 'Find your perfect scrub pants size',
        category: 'scrubs-pants',
        images: JSON.stringify([]),
        content: JSON.stringify({
          type: 'table',
          headers: ['Size', 'Waist (inches)', 'Inseam (inches)'],
          rows: [
            ['XS', '26-28"', '29"'],
            ['S', '29-31"', '30"'],
            ['M', '32-34"', '31"'],
            ['L', '35-37"', '32"'],
            ['XL', '38-40"', '33"'],
            ['2XL', '41-43"', '34"']
          ]
        }),
        order: 3,
        isActive: 1
      },
      {
        id: 'sg_' + Date.now() + '_4',
        title: 'Shoe Size Chart',
        description: 'Find your perfect medical shoe size',
        category: 'shoes',
        images: JSON.stringify([]),
        content: JSON.stringify({
          type: 'table',
          headers: ['EU Size', 'Foot Length (cm)', 'US Size'],
          rows: [
            ['36', '22.5 cm', '5'],
            ['37', '23 cm', '6'],
            ['38', '23.5 cm', '7'],
            ['39', '24 cm', '8'],
            ['40', '24.5 cm', '9'],
            ['41', '25 cm', '10'],
            ['42', '25.5 cm', '11'],
            ['43', '26 cm', '12'],
            ['44', '26.5 cm', '13']
          ]
        }),
        order: 4,
        isActive: 1
      }
    ]

    for (const guide of defaultGuides) {
      await turso.execute({
        sql: `INSERT INTO SizeGuide (id, title, description, category, images, content, "order", isActive, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [guide.id, guide.title, guide.description, guide.category, guide.images, guide.content, guide.order, guide.isActive]
      })
      console.log(`✅ Added: ${guide.title}`)
    }

    console.log('\n✅ Done! SizeGuide table and default entries added successfully.')
    console.log('\n📊 Summary:')
    console.log('  - SizeGuide table created')
    console.log('  - 4 default size guide entries added')
    console.log('\n💡 Next steps:')
    console.log('  1. Run: npx prisma generate')
    console.log('  2. Restart your dev server')
    console.log('  3. Access admin panel to manage size guides')

  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️  SizeGuide table already exists')
    } else {
      console.error('❌ Error:', error.message)
      throw error
    }
  } finally {
    turso.close()
  }
}

addSizeGuideTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
