const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  // Optional: Add a secret key check for security
  const secretKey = event.headers['x-secret-key'] || event.queryStringParameters?.secret
  const expectedSecret = process.env.INIT_SECRET_KEY || 'your-secret-key-here'

  if (secretKey !== expectedSecret) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    }
  }

  try {
    console.log('🔧 Initializing production database...')

    // Check if users already exist
    const existingUsers = await prisma.user.findMany()
    
    if (existingUsers.length > 0) {
      console.log('✅ Users already exist, skipping initialization')
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Users already exist',
          existingUsers: existingUsers.map(u => u.username)
        })
      }
    }

    // Create default users
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const users = [
      { username: 'ak', password: hashedPassword },
      { username: 'manna', password: hashedPassword }
    ]

    const createdUsers = []
    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData
      })
      createdUsers.push(user.username)
      console.log(`✅ Created user: ${user.username}`)
    }

    console.log('🎉 Production database initialized successfully!')
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Database initialized successfully',
        createdUsers
      })
    }
  } catch (error) {
    console.error('❌ Error initializing production database:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to initialize database',
        message: error.message
      })
    }
  } finally {
    await prisma.$disconnect()
  }
}

