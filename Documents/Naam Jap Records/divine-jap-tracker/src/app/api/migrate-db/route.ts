import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Database Migration Endpoint
 * 
 * This endpoint creates database tables if they don't exist.
 * It's safe to call multiple times - it won't recreate existing tables.
 * 
 * Security: Protected by secret key (same as init-db)
 */
export async function GET(request: NextRequest) {
  return handleMigrationRequest(request)
}

export async function POST(request: NextRequest) {
  return handleMigrationRequest(request)
}

async function handleMigrationRequest(request: NextRequest) {
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

    console.log('🔧 Running database migration...')

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL environment variable is not set' },
        { status: 500 }
      )
    }

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Try to query User table - if it doesn't exist, we'll get an error
    try {
      await prisma.user.findFirst()
      console.log('✅ User table exists')
    } catch (error: any) {
      // If table doesn't exist, we need to create it
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log('⚠️ Tables do not exist. Creating tables...')
        
        // Use Prisma's $executeRaw to create tables
        // This is a workaround since we can't run migrations in serverless
        await createTables()
        
        console.log('✅ Tables created successfully')
      } else {
        throw error
      }
    }

    // Verify tables exist by checking both User and JapCount
    const userCount = await prisma.user.count()
    const japCountCount = await prisma.japCount.count()

    return NextResponse.json({
      message: 'Database migration completed successfully',
      tables: {
        User: 'exists',
        JapCount: 'exists',
      },
      counts: {
        users: userCount,
        japCounts: japCountCount,
      },
    })
  } catch (error: any) {
    console.error('❌ Error running database migration:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to run database migration',
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

async function createTables() {
  // Create User table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "username" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )
  `)

  // Create JapCount table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "JapCount" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "count" INTEGER NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "JapCount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)

  // Create indexes
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "JapCount_userId_date_key" ON "JapCount"("userId", "date")
  `)

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "JapCount_userId_date_idx" ON "JapCount"("userId", "date")
  `)
}

