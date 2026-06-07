import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
dotenv.config()

async function run() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) { console.error('Missing credentials'); process.exit(1) }
  const client = createClient({ url, authToken })

  // Remove all existing testimonials
  await client.execute(`DELETE FROM "Testimonial"`)
  console.log('✅ Cleared old testimonials')

  // Insert new Pakistani doctor testimonials
  const testimonials = [
    { name: 'Dr. Rab Nawaz', role: 'General Physician', content: 'Doctor Planet ke scrubs bohat zyada comfortable hain. Long shifts mein bhi fatigue nahi hoti. Highly recommended for all doctors!', rating: 5, order: 1 },
    { name: 'Dr. Shah Afridi', role: 'Surgeon', content: 'OT kit aur scrubs dono zabardast quality ke hain. Delivery bhi fast thi. Doctor Planet is the best medical store in Pakistan.', rating: 5, order: 2 },
    { name: 'Dr. Laiba', role: 'Medical Student, KEMU', content: 'Mujhe apni uniform ke liye bohat achi quality ka fabric mila. Prices bhi reasonable hain. Will definitely order again!', rating: 5, order: 3 },
    { name: 'Dr. Kainat', role: 'House Officer', content: 'Medical crocs bohot comfortable hain, poori duty mein pair nahi dard karte. Shukriya Doctor Planet!', rating: 5, order: 4 },
    { name: 'Dr. Iqra', role: 'Nurse, Services Hospital', content: 'Nursing uniform ki quality aur stitching excellent hai. Colors bhi bilkul waisi hain jaise pictures mein thi. Very satisfied!', rating: 5, order: 5 },
  ]

  for (const t of testimonials) {
    const id = `t${Date.now()}${Math.random().toString(36).slice(2, 6)}`
    await client.execute({
      sql: `INSERT INTO "Testimonial" (id, name, role, content, rating, "isActive", "order", createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [id, t.name, t.role, t.content, t.rating, t.order],
    })
    console.log(`✅ Added: ${t.name}`)
  }

  client.close()
  console.log('\n✅ Testimonials updated!')
}
run()
