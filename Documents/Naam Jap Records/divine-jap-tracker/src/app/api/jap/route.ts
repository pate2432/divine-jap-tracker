import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const username = searchParams.get('username')
    const period = searchParams.get('period') || 'day'
    const date = searchParams.get('date')

    if (!userId || !username) {
      return NextResponse.json(
        { error: 'User ID and username are required' },
        { status: 400 }
      )
    }

    let startDate: Date
    let endDate: Date

    if (date) {
      // Specific date
      const targetDate = new Date(date)
      startDate = new Date(targetDate)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(targetDate)
      endDate.setHours(23, 59, 59, 999)
    } else if (period === 'day') {
      // Today
      const now = new Date()
      startDate = new Date(now)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(now)
      endDate.setHours(23, 59, 59, 999)
    } else if (period === 'week') {
      // This week
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      startDate = startOfWeek
      endDate = new Date(now)
    } else {
      return NextResponse.json(
        { error: 'Invalid period' },
        { status: 400 }
      )
    }

    const japCounts = await prisma.japCount.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    })

    // Calculate statistics
    const totalCount = japCounts.reduce((sum, count) => sum + count.count, 0)
    const averageDaily = period === 'week' ? Math.round(totalCount / 7) : totalCount

    const statistics = {
      totalCount,
      averageDaily,
      bestDay: japCounts.length > 0 ? {
        date: japCounts[0].date,
        count: Math.max(...japCounts.map(c => c.count))
      } : null,
      streak: 0, // Simplified for now
    }

    return NextResponse.json({
      japCounts,
      statistics,
    })
  } catch (error) {
    console.error('Error fetching jap counts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, username, count, date } = await request.json()

    if (!userId || !username || count === undefined) {
      return NextResponse.json(
        { error: 'User ID, username, and count are required' },
        { status: 400 }
      )
    }

    // Ensure count is a valid integer
    if (count === null || count === undefined || count === '') {
      return NextResponse.json(
        { error: 'Count is required' },
        { status: 400 }
      )
    }

    const validCount = parseInt(count)
    if (isNaN(validCount) || validCount < 0) {
      return NextResponse.json(
        { error: 'Count must be a non-negative number' },
        { status: 400 }
      )
    }

    // Don't create records with 0 count unless explicitly requested
    if (validCount === 0) {
      return NextResponse.json({ message: 'No count to record' }, { status: 200 })
    }

    const targetDate = date ? new Date(date) : new Date()
    targetDate.setHours(0, 0, 0, 0)

    // Upsert the jap count for the day
    const japCount = await prisma.japCount.upsert({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
      update: {
        count: validCount,
      },
      create: {
        count: validCount,
        date: targetDate,
        user: {
          connect: { id: userId }
        }
      },
    })

    return NextResponse.json({
      japCount,
      message: 'Jap count updated successfully',
    })
  } catch (error) {
    console.error('Error updating jap count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
