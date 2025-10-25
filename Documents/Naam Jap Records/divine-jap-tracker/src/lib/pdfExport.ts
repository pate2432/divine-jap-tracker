import jsPDF from 'jspdf'

export const exportToPDF = async (data: {
  userStats: Record<string, { totalCount: number; counts: { id: string; userId: string; count: number; date: Date; createdAt: Date }[] }>
  combinedTotal: number
  period: string
}) => {
  const pdf = new jsPDF()

  // Add title
  pdf.setFontSize(24)
  pdf.setTextColor(248, 181, 193) // Lotus pink
  pdf.text('Divine Jap Tracker Report', 20, 30)

  // Add subtitle
  pdf.setFontSize(16)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Period: ${data.period.charAt(0).toUpperCase() + data.period.slice(1)}`, 20, 45)
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55)

  // Add combined total
  pdf.setFontSize(18)
  pdf.setTextColor(192, 132, 252) // Soft purple
  pdf.text(`Divine Together Count: ${data.combinedTotal.toLocaleString()}`, 20, 75)

  // Add user statistics
  let yPosition = 95
  pdf.setFontSize(14)
  pdf.setTextColor(0, 0, 0)

  Object.entries(data.userStats).forEach(([username, stats]) => {
    pdf.text(`${username.charAt(0).toUpperCase() + username.slice(1)}:`, 20, yPosition)
    pdf.text(`Total Count: ${stats.totalCount.toLocaleString()}`, 40, yPosition)
    yPosition += 15
    pdf.text(`Average Daily: ${Math.round(stats.totalCount / Math.max(stats.counts.length, 1))}`, 40, yPosition)
    yPosition += 20
  })

  // Add spiritual message
  yPosition += 20
  pdf.setFontSize(12)
  pdf.setTextColor(100, 100, 100)
  pdf.text('"May your spiritual journey continue to blossom with divine grace."', 20, yPosition)
  pdf.text('Radhe Radhe 🙏', 20, yPosition + 10)

  // Save the PDF
  pdf.save(`divine-jap-report-${data.period}-${new Date().toISOString().split('T')[0]}.pdf`)
}
