'use client'

import { format, differenceInDays, parseISO } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Candidate } from '@/types/candidate'

interface CandidateBarGraphProps {
  data: Candidate[]
  dateRange: {
    start: Date
    end: Date
  }
}

export default function CandidateBarGraph({ data, dateRange }: CandidateBarGraphProps) {
  const today = new Date()

  // Process data for the chart
  const candidateCounts = data.reduce((acc, candidate) => {
    if (candidate.nextContact) {
      const dateStr = format(candidate.nextContact, 'yyyy-MM-dd')
      acc[dateStr] = (acc[dateStr] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(candidateCounts)
    .map(([date, count]) => {
      const parsedDate = parseISO(date)
      const daysFromToday = differenceInDays(parsedDate, today)
      return {
        date: format(parsedDate, 'MMM dd'),
        fullDate: parsedDate,
        candidates: count,
        daysFromToday
      }
    })
    .sort((a, b) => a.daysFromToday - b.daysFromToday)

  const getBarColor = (daysFromToday: number) => {
    // Normalize days to a 0-1 scale for color interpolation
    const maxDays = 14 // Assuming two weeks as max range
    const normalizedDays = Math.min(Math.max(daysFromToday, 0), maxDays) / maxDays
    
    // RGB values for gradient from red (255,59,48) to green (52,199,89)
    const r = Math.round(255 - (255 - 52) * normalizedDays)
    const g = Math.round(59 + (199 - 59) * normalizedDays)
    const b = Math.round(48 + (89 - 48) * normalizedDays)
    
    return `rgb(${r},${g},${b})`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {payload[0].value} candidate{payload[0].value !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-48 mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
          />
          <YAxis 
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="candidates" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry.daysFromToday)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 