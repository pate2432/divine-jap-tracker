const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Create Prisma client with connection pooling for serverless
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

exports.handler = async (event, context) => {
  // Set timeout to prevent hanging
  context.callbackWaitsForEmptyEventLoop = false

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Database configuration error',
        message: 'DATABASE_URL environment variable is not set'
      })
    }
  }

  // Optional: Add a secret key check for security
  const secretKey = event.headers['x-secret-key'] || (event.queryStringParameters && event.queryStringParameters.secret)
  const expectedSecret = process.env.INIT_SECRET_KEY || 'your-secret-key-here'

  if (secretKey !== expectedSecret) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Unauthorized' })
    }
  }

  try {
    console.log('🔧 Initializing production database...')
    console.log('📊 DATABASE_URL is set:', !!process.env.DATABASE_URL)

    // Test database connection first
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Check if users already exist
    const existingUsers = await prisma.user.findMany()
    
    if (existingUsers.length > 0) {
      console.log('✅ Users already exist, skipping initialization')
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: 'Users already exist',
          existingUsers: existingUsers.map(u => u.username)
        })
      }
    }

    // Create default users
    console.log('🔐 Hashing passwords...')
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const users = [
      { username: 'ak', password: hashedPassword },
      { username: 'manna', password: hashedPassword }
    ]

    const createdUsers = []
    for (const userData of users) {
      try {
        const user = await prisma.user.create({
          data: userData
        })
        createdUsers.push(user.username)
        console.log(`✅ Created user: ${user.username}`)
      } catch (userError) {
        console.error(`❌ Error creating user ${userData.username}:`, userError)
        // Continue with other users even if one fails
      }
    }

    if (createdUsers.length === 0) {
      throw new Error('Failed to create any users')
    }

    console.log('🎉 Production database initialized successfully!')
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: 'Database initialized successfully',
        createdUsers
      })
    }
  } catch (error) {
    console.error('❌ Error initializing production database:', error)
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to initialize database',
        message: error.message || 'Unknown error occurred',
        errorType: error.name || 'Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      })
    }
  } finally {
    try {
      await prisma.$disconnect()
      console.log('✅ Prisma client disconnected')
    } catch (disconnectError) {
      console.error('⚠️ Error disconnecting Prisma:', disconnectError)
    }
  }
}

