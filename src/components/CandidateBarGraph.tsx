'use client'

import { useState } from 'react'
import { format, parseISO, startOfDay, differenceInDays, addDays } from 'date-fns'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Candidate } from '@/types/candidate'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'

interface CandidateBarGraphProps {
  candidates: Candidate[]
  onBarClick?: (date: Date) => void
}

export function CandidateBarGraph({ candidates, onBarClick }: CandidateBarGraphProps) {
  const [dayRange, setDayRange] = useState<number>(30)

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
  const today = startOfDay(new Date())
  const endDate = addDays(today, dayRange - 1)
  
  const chartData = Object.entries(candidatesByDate)
    .map(([dateStr, { count, candidates }]) => {
      const date = parseISO(dateStr)
      const daysFromNow = differenceInDays(date, today)
      // Calculate color based on days from now (red to green gradient)
      const maxDays = dayRange // Adjust this value based on your date range
      const colorValue = Math.max(0, Math.min(1, daysFromNow / maxDays))
      const red = Math.round(255 * (1 - colorValue))
      const green = Math.round(255 * colorValue)
      const fill = `rgb(${red}, ${green}, 0)`

      return {
        date,
        count,
        candidates,
        fill,
      }
    })
    .filter(item => item.date >= today && item.date <= endDate)
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
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Candidates by Next Contact Date</CardTitle>
          <RadioGroup
            value={dayRange.toString()}
            onValueChange={(value) => setDayRange(parseInt(value))}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10" id="r10" />
              <Label htmlFor="r10">10 Days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="20" id="r20" />
              <Label htmlFor="r20">20 Days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30" id="r30" />
              <Label htmlFor="r30">30 Days</Label>
            </div>
          </RadioGroup>
        </div>
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
                  if (onBarClick && data.payload.date) {
                    onBarClick(data.payload.date)
                  }
                }}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <rect key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 