import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Database Migration Endpoint
 * 
 * This endpoint creates database tables using Prisma db push.
 * It's safe to call multiple times - Prisma handles idempotency.
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

    // Test connection first
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
    } catch (connError: any) {
      console.error('❌ Database connection failed:', connError)
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: connError.message || 'Could not connect to database',
          hint: 'Check your DATABASE_URL environment variable'
        },
        { status: 500 }
      )
    }

    // Check if tables already exist
    let tablesExist = false
    try {
      await prisma.user.findFirst({ take: 1 })
      await prisma.japCount.findFirst({ take: 1 })
      tablesExist = true
      console.log('✅ Tables already exist')
    } catch (error: any) {
      // P2021 = Table does not exist
      if (error.code === 'P2021' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        tablesExist = false
        console.log('⚠️ Tables do not exist, creating them...')
      } else {
        // Some other error
        throw error
      }
    }

    // If tables don't exist, create them manually
    if (!tablesExist) {
      console.log('📦 Creating database tables...')
      await createTablesManually()
      console.log('✅ Tables created successfully')
    }

    // Verify tables exist
    try {
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
    } catch (verifyError: any) {
      console.error('❌ Verification failed:', verifyError)
      return NextResponse.json(
        { 
          error: 'Migration completed but verification failed',
          message: verifyError.message || 'Could not verify tables',
          hint: 'Tables may have been created. Try initializing users next.'
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Error running database migration:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
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

async function createTablesManually() {
  try {
    console.log('Creating User table...')
    
    // Create User table with all constraints inline (simpler and more reliable)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ User table created')

    console.log('Creating JapCount table...')

    // Create JapCount table with all constraints inline
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "JapCount" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "count" INTEGER NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "JapCount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    console.log('✅ JapCount table created')

    console.log('Creating indexes...')

    // Create unique index (for the unique constraint on userId + date)
    // Use DO block to check if index exists first (PostgreSQL doesn't support IF NOT EXISTS for all cases)
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'JapCount_userId_date_key'
          ) THEN
            CREATE UNIQUE INDEX "JapCount_userId_date_key" ON "JapCount"("userId", "date");
          END IF;
        END $$;
      `)
      console.log('✅ Unique index created')
    } catch (e: any) {
      // If DO block fails, try simple CREATE
      try {
        await prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS "JapCount_userId_date_key" ON "JapCount"("userId", "date")
        `)
        console.log('✅ Unique index created (fallback)')
      } catch (e2: any) {
        if (!e2.message?.includes('already exists')) {
          console.warn('Unique index warning:', e2.message)
        }
      }
    }

    // Create regular index
    try {
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "JapCount_userId_date_idx" ON "JapCount"("userId", "date")
      `)
      console.log('✅ Regular index created')
    } catch (e: any) {
      if (!e.message?.includes('already exists')) {
        console.warn('Index warning:', e.message)
      }
    }

    console.log('✅ All tables and constraints created successfully')
  } catch (error: any) {
    console.error('❌ Manual table creation failed:', error)
    console.error('SQL Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      sqlState: error.meta?.code,
    })
    throw new Error(`Failed to create tables: ${error.message || 'Unknown error'}`)
  }
}

