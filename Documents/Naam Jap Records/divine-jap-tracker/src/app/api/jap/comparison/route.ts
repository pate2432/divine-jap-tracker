import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
      orderBy: {
        username: 'asc',
      },
    })

    if (users.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 users for comparison' },
        { status: 400 }
      )
    }

    // Get last 7 days
    const now = new Date()
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      last7Days.push(date)
    }

    // Get date range for query
    const startDate = last7Days[0]
    const endDate = last7Days[last7Days.length - 1]
    endDate.setHours(23, 59, 59, 999)

    // Fetch all jap counts for all users in the date range in a single query
    const userIds = users.map(u => u.id)
    const allJapCounts = await prisma.japCount.findMany({
      where: {
        userId: { in: userIds },
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

    // Organize data by date
    const comparisonData = []
    
    for (const date of last7Days) {
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const dayData: {
        date: Date
        users: { username: string; count: number; userId: string }[]
        winner: string | null
        total: number
      } = {
        date: date,
        users: [],
        winner: null,
        total: 0,
      }

      // Get counts for this day from the pre-fetched data
      for (const user of users) {
        const japCount = allJapCounts.find(
          count => count.userId === user.id &&
          count.date >= dayStart &&
          count.date <= dayEnd
        )

        const count = japCount ? japCount.count : 0
        dayData.users.push({
          username: user.username,
          count: count,
          userId: user.id,
        })
        dayData.total += count
      }

      // Determine winner for the day
      if (dayData.users.length === 2) {
        if (dayData.users[0].count > dayData.users[1].count) {
          dayData.winner = dayData.users[0].username
        } else if (dayData.users[1].count > dayData.users[0].count) {
          dayData.winner = dayData.users[1].username
        }
        // If equal, winner is null (tie)
      }

      comparisonData.push(dayData)
    }

    // Calculate overall stats
    const userStats = users.map(user => {
      const totalCount = comparisonData.reduce((sum, day) => {
        const userDay = day.users.find(u => u.userId === user.id)
        return sum + (userDay?.count || 0)
      }, 0)
      
      const daysWon = comparisonData.filter(day => day.winner === user.username).length
      const daysTied = comparisonData.filter(day => 
        day.users.length === 2 && 
        day.users[0].count === day.users[1].count && 
        day.users[0].count > 0
      ).length

      return {
        username: user.username,
        userId: user.id,
        totalCount,
        daysWon,
        daysTied,
        averageDaily: Math.round(totalCount / 7),
      }
    })

    // Overall winner
    const overallWinner = userStats.reduce((prev, current) => 
      current.totalCount > prev.totalCount ? current : prev
    )

    return NextResponse.json({
      comparisonData,
      userStats,
      overallWinner: overallWinner.username,
      totalDays: 7,
    })
  } catch (error) {
    console.error('Error fetching comparison data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

