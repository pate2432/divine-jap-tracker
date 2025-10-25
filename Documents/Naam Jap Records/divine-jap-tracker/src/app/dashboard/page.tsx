'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Download, LogOut, Heart, Star } from 'lucide-react'
import DigitalMala from '@/components/DigitalMala'
import { exportToPDF } from '@/lib/pdfExport'
import { getDailyQuote } from '@/lib/quotes'

interface User {
  id: string
  username: string
}

interface JapCount {
  id: string
  userId: string
  count: number
  date: Date
  createdAt: Date
}

interface DailyRecord {
  date: Date
  count: number
}

interface Statistics {
  totalCount: number
  averageDaily: number
  bestDay: { date: Date; count: number } | null
  streak: number
}

interface CombinedStats {
  totalCount: number
  users: { username: string; totalCount: number }[]
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [todayCount, setTodayCount] = useState(0)
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [combinedStats, setCombinedStats] = useState<CombinedStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dailyQuote, setDailyQuote] = useState(getDailyQuote())
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/')
    }
  }, [router])

  const fetchDashboardData = useCallback(async (currentUser: User) => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch today's count
      const todayResponse = await fetch(`/api/jap?userId=${currentUser.id}&username=${currentUser.username}&period=day`)
      const todayData = await todayResponse.json()
      if (todayData.japCounts && todayData.japCounts.length > 0) {
        setTodayCount(todayData.japCounts[0].count)
      } else {
        setTodayCount(0)
      }

      // Fetch statistics
      const statsResponse = await fetch(`/api/jap?userId=${currentUser.id}&username=${currentUser.username}&period=week`)
      const statsData = await statsResponse.json()
      setStatistics(statsData.statistics)

      // Fetch combined stats
      const combinedResponse = await fetch(`/api/jap/combined?period=week`)
      const combinedData = await combinedResponse.json()
      setCombinedStats(combinedData)

      // Fetch daily records for the last 7 days
      const now = new Date()
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        last7Days.push(date)
      }

      const dailyRecordsData = []
      for (const date of last7Days) {
        const dateStr = date.toISOString()
        try {
          const response = await fetch(`/api/jap?userId=${currentUser.id}&username=${currentUser.username}&period=day&date=${dateStr}`)
          if (response.ok) {
            const data = await response.json()
            if (data.japCounts && data.japCounts.length > 0) {
              dailyRecordsData.push({
                date: date,
                count: data.japCounts[0].count,
              })
            } else {
              dailyRecordsData.push({
                date: date,
                count: 0,
              })
            }
          } else {
            dailyRecordsData.push({
              date: date,
              count: 0,
            })
          }
        } catch (error) {
          console.error(`Error fetching daily record for ${date.toISOString()}:`, error)
          dailyRecordsData.push({
            date: date,
            count: 0,
          })
        }
      }
      setDailyRecords(dailyRecordsData)

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user && !dataFetchedRef.current) {
      dataFetchedRef.current = true
      fetchDashboardData(user)
    }
  }, [user, fetchDashboardData])

  // Reset the ref when user changes
  useEffect(() => {
    dataFetchedRef.current = false
  }, [user])

  const handleSubmitJap = async (count: number) => {
    if (!user) return

    const now = new Date()
    const userDate = new Date(now)
    userDate.setHours(0, 0, 0, 0)

    try {
      const response = await fetch('/api/jap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          count,
          date: userDate.toISOString(),
        }),
      })

      if (response.ok) {
        await fetchDashboardData(user)
        // Check for motivational message
        if (count > 0 && count % 108 === 0) {
          setMotivationalMessage(`Great job, ${user.username}! You've completed ${count} japs today! Keep going!`)
        } else if (count > 0 && count % 1000 === 0) {
          setMotivationalMessage(`Amazing, ${user.username}! You've reached ${count} japs! Your dedication is inspiring!`)
        } else {
          setMotivationalMessage(null)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit jap count.')
      }
    } catch (err) {
      console.error('Error submitting jap count:', err)
      setError('An unexpected error occurred.')
    }
  }

  const handleEditCount = async (date: Date, newCount: number) => {
    if (!user) return

    // Don't send API calls for 0 counts
    if (newCount === 0) {
      return
    }

    const editableDate = new Date(date)
    editableDate.setHours(0, 0, 0, 0)

    // Allow editing for the last 7 days
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = Math.abs(today.getTime() - editableDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 6) {
      alert('You can only edit counts for the last 7 days.')
      return
    }

    try {
      const response = await fetch('/api/jap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          count: newCount,
          date: editableDate.toISOString(),
        }),
      })

      if (response.ok) {
        await fetchDashboardData(user)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update jap count.')
      }
    } catch (err) {
      console.error('Error updating jap count:', err)
      setError('An unexpected error occurred.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800">
        <p className="text-lg">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Divine Jap Tracker</h1>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </header>

      {motivationalMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 text-center"
        >
          {motivationalMessage}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Daily Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md col-span-full text-center"
        >
          <p className="text-lg italic text-gray-700">
            &ldquo;{dailyQuote.text}&rdquo;
          </p>
          <p className="text-sm text-gray-500 mt-2">- {dailyQuote.author}</p>
        </motion.div>

        {/* Today's Jap Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Today&apos;s Jap Count</h2>
          <DigitalMala currentCount={todayCount} onCountChange={handleSubmitJap} />
          <p className="text-lg text-gray-600 mt-4">Total today: {todayCount}</p>
        </motion.div>

        {/* User Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Divine Together</h2>
          {combinedStats && (
            <div className="text-center">
              <p className="text-4xl font-bold text-pink-600 mb-4">
                {combinedStats.totalCount.toLocaleString()}
              </p>
              <div className="flex justify-around w-full mt-4">
                {combinedStats.users.map((u, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-300 shadow-lg">
                      <Image
                        src={`/${u.username}.jpg`}
                        alt={`${u.username} profile`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-lg font-medium text-gray-800 mt-2 capitalize">{u.username}</p>
                    <p className="text-md text-gray-600">{u.totalCount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Last 7 Days Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md lg:col-span-1"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyRecords.map(record => ({
              date: record.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              count: record.count
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                itemStyle={{ color: '#374151' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ec4899"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily Nam Jap Records (Last 7 Days) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6 rounded-xl shadow-lg border border-purple-100 col-span-full"
        >
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">📿</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Daily Nam Jap Records (Last 7 Days)
            </h2>
          </div>
          <div className="space-y-3">
            {dailyRecords.map((record, index) => {
              const isToday = record.date.toDateString() === new Date().toDateString()
              const isYesterday = record.date.toDateString() === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
              
              return (
                <div 
                  key={index} 
                  className={`flex justify-between items-center p-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
                    isToday 
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300' 
                      : isYesterday
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                      : 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      isToday 
                        ? 'bg-gradient-to-r from-pink-400 to-purple-400' 
                        : isYesterday
                        ? 'bg-gradient-to-r from-blue-400 to-indigo-400'
                        : 'bg-gradient-to-r from-gray-300 to-slate-300'
                    }`}></div>
                    <span className={`font-semibold ${
                      isToday 
                        ? 'text-purple-800' 
                        : isYesterday
                        ? 'text-blue-800'
                        : 'text-gray-700'
                    }`}>
                      {record.date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {isToday && (
                        <span className="ml-2 px-2 py-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs font-bold rounded-full">
                          Today
                        </span>
                      )}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={record.count}
                    onChange={(e) => {
                      const value = e.target.value
                      const numValue = value === '' ? 0 : parseInt(value) || 0
                      // Update the local state immediately for UI responsiveness
                      setDailyRecords(prev => prev.map((r, i) => 
                        i === index ? { ...r, count: numValue } : r
                      ))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      const numValue = value === '' ? 0 : parseInt(value) || 0
                      handleEditCount(record.date, numValue)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value
                        const numValue = value === '' ? 0 : parseInt(value) || 0
                        handleEditCount(record.date, numValue)
                      }
                    }}
                    className={`w-28 p-3 border-2 rounded-lg text-center text-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isToday 
                        ? 'border-pink-300 bg-white text-purple-800 focus:border-pink-500 focus:ring-pink-200' 
                        : isYesterday
                        ? 'border-blue-300 bg-white text-blue-800 focus:border-blue-500 focus:ring-blue-200'
                        : 'border-gray-300 bg-white text-gray-800 focus:border-purple-400 focus:ring-purple-200'
                    }`}
                    placeholder="0"
                  />
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Export Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => {
              if (combinedStats) {
                const userStats = {
                  [user.username]: {
                    totalCount: dailyRecords.reduce((sum, record) => sum + record.count, 0),
                    counts: dailyRecords.map(record => ({
                      id: record.date.toISOString(),
                      userId: user.id,
                      count: record.count,
                      date: record.date,
                      createdAt: record.date
                    }))
                  }
                }
                exportToPDF({
                  userStats,
                  combinedTotal: combinedStats.totalCount,
                  period: 'week'
                })
              }
            }}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Export to PDF</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
