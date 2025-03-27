'use client'

import { useState, useEffect, useRef } from 'react'
import { format, parseISO, startOfDay, differenceInDays, addDays, isBefore, isToday } from 'date-fns'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Candidate } from '@/types/candidate'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'

interface CandidateBarGraphProps {
  candidates: Candidate[]
  onBarClick?: (date: Date) => void
  selectedDate?: Date | null
}

export function CandidateBarGraph({ candidates, onBarClick, selectedDate }: CandidateBarGraphProps) {
  const [dayRange, setDayRange] = useState<number>(30)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [labelVisibility, setLabelVisibility] = useState(true)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  
  // Set today as the default selected date on initial render if nothing is selected
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date()
      onBarClick?.(today)
    }
  }, []);
  
  // Update selectedDateKey when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedDateKey(selectedDate.toISOString().split('T')[0]);
    } else {
      setSelectedDateKey(null);
    }
  }, [selectedDate]);

  // Check for label overlap on resize
  useEffect(() => {
    const checkLabelOverlap = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.offsetWidth
        // Estimate if there will be overlap based on container width and number of days
        const estimatedLabelWidth = 60 // Approximate width of each label in pixels
        const totalLabelsWidth = (dayRange + 1) * estimatedLabelWidth // +1 for past due bar
        
        setLabelVisibility(containerWidth > totalLabelsWidth)
      }
    }
    
    // Check initially and on resize
    checkLabelOverlap()
    window.addEventListener('resize', checkLabelOverlap)
    
    return () => {
      window.removeEventListener('resize', checkLabelOverlap)
    }
  }, [dayRange])

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
  
  // Get past due candidates (before today)
  const pastDueCandidates = candidates.filter(candidate => 
    candidate.nextContact && isBefore(new Date(candidate.nextContact), today) && !isToday(new Date(candidate.nextContact))
  )
  
  // Create data for future dates
  const futureData = Object.entries(candidatesByDate)
    .map(([dateStr, { count, candidates }]) => {
      const date = parseISO(dateStr)
      const daysFromNow = differenceInDays(date, today)
      // Calculate color based on days from now (red to green gradient)
      const maxDays = dayRange // Adjust this value based on your date range
      const colorValue = Math.max(0, Math.min(1, daysFromNow / maxDays))
      const red = Math.round(255 * (1 - colorValue))
      const green = Math.round(255 * colorValue)
      
      // Base fill color
      const baseFill = `rgb(${red}, ${green}, 0)`
      
      // Check if this is the selected date
      const isSelected = dateStr === selectedDateKey
      
      // Use a highlighted fill for selected bars
      const fill = isSelected 
        ? `rgb(${Math.min(red + 40, 255)}, ${Math.min(green + 40, 255)}, 100)` 
        : baseFill
      
      // Add a stroke to selected bars
      const stroke = isSelected ? '#000' : 'none'
      const strokeWidth = isSelected ? 2 : 0
      
      return {
        dateStr,
        date,
        count,
        candidates,
        fill,
        stroke,
        strokeWidth,
        isSelected,
        isPastDue: false
      }
    })
    .filter(item => 
      // Include today and future dates within range
      (isToday(item.date) || item.date > today) && item.date <= endDate
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  
  // Create past due entry
  const pastDueEntry = {
    dateStr: 'past-due',
    date: addDays(today, -1), // Just for display purposes
    count: pastDueCandidates.length,
    candidates: pastDueCandidates,
    fill: 'rgb(220, 50, 50)', // Red color for past due
    stroke: pastDueCandidates.length > 0 && selectedDateKey === 'past-due' ? '#000' : 'none',
    strokeWidth: pastDueCandidates.length > 0 && selectedDateKey === 'past-due' ? 2 : 0,
    isSelected: selectedDateKey === 'past-due',
    isPastDue: true
  }
  
  // Combine past due with future data
  const chartData = [pastDueEntry, ...futureData]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded p-2 shadow-lg">
          <p className="font-semibold">
            {data.isPastDue 
              ? 'Past Due' 
              : format(data.date, 'MMM d, yyyy')}
          </p>
          <p>Candidates: {data.count}</p>
          <div className="mt-1 text-sm max-h-[150px] overflow-y-auto">
            {data.candidates.map((candidate: Candidate) => (
              <div key={candidate.id}>{candidate.name}</div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const handleBarClick = (data: any) => {
    if (!onBarClick) return;
    
    if (data.isPastDue) {
      // Set a special key for past due
      setSelectedDateKey('past-due');
      // We don't have a specific date, so we'll pass the first past due candidate's date
      // or today if there are no past due candidates
      const firstPastDue = pastDueCandidates[0];
      const dateToPass = firstPastDue?.nextContact 
        ? new Date(firstPastDue.nextContact)
        : addDays(today, -1);
      onBarClick(dateToPass);
    } else {
      onBarClick(data.date);
    }
  };

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
              <RadioGroupItem value="15" id="r15" />
              <Label htmlFor="r15">15 Days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30" id="r30" />
              <Label htmlFor="r30">30 Days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="60" id="r60" />
              <Label htmlFor="r60">60 Days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="90" id="r90" />
              <Label htmlFor="r90">90 Days</Label>
            </div>
          </RadioGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]" ref={chartContainerRef}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="date"
                tickFormatter={(date, index) => {
                  if (index === 0) return "Past Due";
                  return labelVisibility ? format(date, 'MMM d') : "";
                }}
                interval={0}
                tick={{ fontSize: labelVisibility ? 12 : 0 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                onClick={(data) => handleBarClick(data.payload)}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    stroke={entry.stroke}
                    strokeWidth={entry.strokeWidth} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 