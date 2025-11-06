/**
 * Timezone utility functions for handling user-specific timezones
 */

// User timezone mapping
export const USER_TIMEZONES: Record<string, string> = {
  manna: 'Asia/Kolkata', // IST - UTC+5:30
  ak: 'America/Toronto', // EST/EDT - UTC-5:00 or UTC-4:00
}

/**
 * Get timezone for a user
 */
export function getUserTimezone(username: string): string {
  return USER_TIMEZONES[username.toLowerCase()] || Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Get today's date at midnight in a specific timezone
 * Returns a Date object that represents midnight (00:00:00) in that timezone
 */
export function getTodayInTimezone(timezone: string): Date {
  const now = new Date()
  
  // Get the current date string in YYYY-MM-DD format in the target timezone
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  const [year, month, day] = dateStr.split('-').map(Number)
  
  // Create a date string for this date at midnight in ISO format
  // We'll use a trick: create the date in the target timezone's local representation
  // and then convert it properly
  
  // Create a date at noon UTC for this date (noon avoids DST issues)
  const noonUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
  
  // Get what time this noon UTC is in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  
  const parts = formatter.formatToParts(noonUTC)
  const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '12')
  
  // Calculate offset: if noon UTC is 5:30 PM (17:30) in IST, offset is +5.5 hours
  // So midnight IST = noon UTC - 5.5 hours = 6:30 AM UTC
  // But we want: if noon UTC is 17:30 in IST, then 00:00 IST = noon UTC - 17.5 hours = 6:30 PM previous day UTC
  // Actually simpler: if noon UTC is X hours in target timezone, then midnight target = noon UTC - X hours
  
  const offsetHours = tzHour - 12 // This gives us the offset from noon
  const midnightUTC = new Date(noonUTC.getTime() - offsetHours * 3600 * 1000)
  
  // Fine-tune to get exactly midnight by checking what time midnightUTC is in target timezone
  const verifyParts = formatter.formatToParts(midnightUTC)
  const verifyHour = parseInt(verifyParts.find(p => p.type === 'hour')?.value || '0')
  const verifyMinute = parseInt(verifyParts.find(p => p.type === 'minute')?.value || '0')
  
  if (verifyHour !== 0 || verifyMinute !== 0) {
    // Adjust by the difference
    const adjustMs = (verifyHour * 3600 + verifyMinute * 60) * 1000
    const adjusted = new Date(midnightUTC.getTime() - adjustMs)
    
    // Final verification
    const finalParts = formatter.formatToParts(adjusted)
    const finalHour = parseInt(finalParts.find(p => p.type === 'hour')?.value || '0')
    if (finalHour === 0) {
      return adjusted
    }
  }
  
  midnightUTC.setHours(0, 0, 0, 0)
  return midnightUTC
}

/**
 * Get the last 7 days (including today) in a specific timezone
 */
export function getLast7DaysInTimezone(timezone: string): Date[] {
  const today = getTodayInTimezone(timezone)
  const days: Date[] = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    days.push(date)
  }
  
  return days
}

/**
 * Format date for display in user's timezone
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    ...options,
  }).format(date)
}
