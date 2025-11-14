import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * Database initialization endpoint
 * This endpoint initializes the database with schema and default users
 * 
 * Security: In production, you should protect this endpoint with a secret key
 */
export async function GET(request: NextRequest) {
  return handleInitRequest(request)
}

export async function POST(request: NextRequest) {
  return handleInitRequest(request)
}

async function handleInitRequest(request: NextRequest) {
  try {
    // Optional: Add secret key check for security
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret') || request.headers.get('x-secret-key')
    const expectedSecret = process.env.INIT_SECRET_KEY

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid secret key' },
        { status: 401 }
      )
    }

    console.log('🔧 Initializing production database...')

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL environment variable is not set' },
        { status: 500 }
      )
    }

    // Test connection and ensure tables exist
    try {
      await prisma.$connect()
      // Try to query User table to check if it exists
      await prisma.user.findFirst()
    } catch (error: any) {
      // If tables don't exist, return helpful error
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database tables do not exist',
            message: 'Please run database migration first. Visit: /api/migrate-db?secret=YOUR_SECRET_KEY',
            hint: 'Tables need to be created before initializing users'
          },
          { status: 500 }
        )
      }
      throw error
    }

    // Check if users already exist
    const existingUsers = await prisma.user.findMany()
    
    if (existingUsers.length > 0) {
      console.log('✅ Users already exist, skipping initialization')
      return NextResponse.json({
        message: 'Users already exist',
        existingUsers: existingUsers.map(u => u.username),
      })
    }

    // Create default users
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const users = [
      { username: 'ak', password: hashedPassword },
      { username: 'manna', password: hashedPassword }
    ]

    const createdUsers: string[] = []
    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData
      })
      createdUsers.push(user.username)
      console.log(`✅ Created user: ${user.username}`)
    }

    console.log('🎉 Production database initialized successfully!')
    
    return NextResponse.json({
      message: 'Database initialized successfully',
      createdUsers,
    })
  } catch (error: any) {
    console.error('❌ Error initializing production database:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    })
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        message: error.message || 'Unknown error',
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.meta,
          stack: error.stack 
        })
      },
      { status: 500 }
    )
  }
}

