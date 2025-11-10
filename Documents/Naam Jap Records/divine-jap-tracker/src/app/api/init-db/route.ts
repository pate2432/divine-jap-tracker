import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Database initialization endpoint
 * This endpoint initializes the database with schema and default users
 * 
 * Security: In production, you should protect this endpoint with a secret key
 */
export async function POST(request: NextRequest) {
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
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        message: error.message 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

