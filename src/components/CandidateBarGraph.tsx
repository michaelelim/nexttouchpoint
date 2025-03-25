'use client'

import { format, parseISO, startOfDay } from 'date-fns'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Candidate } from '@/types/candidate'

interface CandidateBarGraphProps {
  candidates: Candidate[]
  onBarClick?: (date: Date) => void
}

export function CandidateBarGraph({ candidates, onBarClick }: CandidateBarGraphProps) {
  // Process candidate counts by next contact date
  const candidatesByDate = candidates.reduce((acc, candidate) => {
    if (!candidate.nextContact) return acc

    // Convert to local date string to avoid timezone issues
    const dateKey = new Date(candidate.nextContact).toISOString().split('T')[0]
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        candidates: [],
        count: 0,
      }
    }
    
    acc[dateKey].candidates.push(candidate)
    acc[dateKey].count += 1
    
    return acc
  }, {} as Record<string, { candidates: Candidate[]; count: number }>)

  // Create chart data
  const chartData = Object.entries(candidatesByDate)
    .map(([dateStr, { count, candidates }]) => ({
      date: parseISO(dateStr),
      count,
      candidates,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded p-2 shadow-lg">
          <p className="font-semibold">{format(data.date, 'MMM d, yyyy')}</p>
          <p>Candidates: {data.count}</p>
          <div className="mt-1 text-sm">
            {data.candidates.map((candidate: Candidate) => (
              <div key={candidate.id}>{candidate.name}</div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidates by Next Contact Date</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(date, 'MMM d')}
                interval={0}
              />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="var(--primary)"
                onClick={(data) => {
                  if (onBarClick && data.date) {
                    onBarClick(data.date)
                  }
                }}
                className="cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 