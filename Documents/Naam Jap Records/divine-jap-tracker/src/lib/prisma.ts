import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton for Serverless Environments
 * 
 * In serverless environments (like Netlify), we need to reuse the same
 * PrismaClient instance across function invocations to avoid connection
 * pool exhaustion.
 * 
 * This pattern ensures:
 * - Single connection pool across all API routes
 * - Proper connection management
 * - Better performance in serverless
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Connection pooling for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Handle graceful shutdown
if (typeof window === 'undefined') {
  // Server-side only
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

