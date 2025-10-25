const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function initProductionDatabase() {
  try {
    console.log('🔧 Initializing production database...')

    // Check if users already exist
    const existingUsers = await prisma.user.findMany()
    
    if (existingUsers.length > 0) {
      console.log('✅ Users already exist, skipping initialization')
      return
    }

    // Create default users
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const users = [
      { username: 'ak', password: hashedPassword },
      { username: 'manna', password: hashedPassword }
    ]

    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData
      })
      console.log(`✅ Created user: ${user.username}`)
    }

    console.log('🎉 Production database initialized successfully!')
  } catch (error) {
    console.error('❌ Error initializing production database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initProductionDatabase()
