import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'

    let startDate: Date
    let endDate: Date

    if (period === 'week') {
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

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    })

    // Get jap counts for all users in the period
    const japCounts = await prisma.japCount.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    })

    // Calculate totals for each user
    const userStats = users.map(user => {
      const userCounts = japCounts.filter(count => count.userId === user.id)
      const totalCount = userCounts.reduce((sum, count) => sum + count.count, 0)
      
      return {
        username: user.username,
        totalCount,
      }
    })

    const combinedTotal = userStats.reduce((sum, user) => sum + user.totalCount, 0)

    return NextResponse.json({
      totalCount: combinedTotal,
      users: userStats,
    })
  } catch (error) {
    console.error('Error fetching combined stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
