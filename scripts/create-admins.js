const { createClient } = require('@libsql/client')
const bcrypt = require('bcryptjs')

async function createAdminAccounts() {
  require('dotenv').config()
  
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  })

  console.log('🔗 Connected to Turso database')
  console.log('📝 Creating admin accounts...\n')

  const hashedPassword = await bcrypt.hash('Admin@123', 12)
  
  const admins = [
    { email: 'admin@doctorplanet.com', name: 'Admin' },
    { email: 'doctorplanet.dawood@gmail.com', name: 'Dawood Admin' },
    { email: 'doctorplanet.usama@gmail.com', name: 'Usama Admin' },
    { email: 'doctorplanet.huzaifa@gmail.com', name: 'Huzaifa Admin' },
  ]

  for (const adminData of admins) {
    try {
      // Check if user exists
      const existing = await client.execute({
        sql: 'SELECT * FROM User WHERE email = ?',
        args: [adminData.email]
      })

      if (existing.rows.length > 0) {
        // Update existing user to ADMIN role
        await client.execute({
          sql: 'UPDATE User SET role = ?, password = ?, isActive = ? WHERE email = ?',
          args: ['ADMIN', hashedPassword, true, adminData.email]
        })
        console.log(`✅ Updated existing user: ${adminData.email} (now ADMIN)`)
      } else {
        // Create new admin user
        const userId = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`
        await client.execute({
          sql: `INSERT INTO User (id, email, name, password, role, isActive, isProfileComplete, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            userId,
            adminData.email,
            adminData.name,
            hashedPassword,
            'ADMIN',
            1, // true
            1, // true
            new Date().toISOString(),
            new Date().toISOString()
          ]
        })
        console.log(`✅ Created new admin: ${adminData.email}`)
      }
    } catch (error) {
      console.error(`❌ Error creating/updating ${adminData.email}:`, error.message)
    }
  }

  console.log('\n📊 Verifying admin accounts...')
  
  // List all admin users
  const adminUsers = await client.execute({
    sql: 'SELECT email, name, role, isActive FROM User WHERE role = ?',
    args: ['ADMIN']
  })

  console.log(`\n✅ Total ADMIN accounts: ${adminUsers.rows.length}`)
  adminUsers.rows.forEach(user => {
    console.log(`  - ${user.email} (${user.name}) - Active: ${user.isActive ? 'Yes' : 'No'}`)
  })

  console.log('\n✅ Done! All admin accounts are ready.')
  console.log('\n🔐 Login credentials:')
  console.log('   Email: doctorplanet.dawood@gmail.com')
  console.log('   Email: doctorplanet.usama@gmail.com')
  console.log('   Email: doctorplanet.huzaifa@gmail.com')
  console.log('   Password: Admin@123')
  
  process.exit(0)
}

createAdminAccounts().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
