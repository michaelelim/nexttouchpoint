'use client'

import { useState, useEffect, useRef } from 'react'
import { format, parseISO, startOfDay, differenceInDays, addDays } from 'date-fns'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Candidate } from '@/types/candidate'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'

// Define the Cell component inline since it's missing from the recharts types
const Cell = (props: any) => {
  const { fill, stroke, strokeWidth, x, y, width, height } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      stroke={stroke || 'none'}
      strokeWidth={strokeWidth || 0}
    />
  );
};

interface CandidateBarGraphProps {
  candidates: Candidate[]
  onBarClick?: (date: Date) => void
  selectedDate?: Date | null
}

export function CandidateBarGraph({ candidates, onBarClick, selectedDate }: CandidateBarGraphProps) {
  const [dayRange, setDayRange] = useState<number>(30)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
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
      // Use same normalized format for consistency
      const dateKey = [
        selectedDate.getFullYear(),
        String(selectedDate.getMonth() + 1).padStart(2, '0'),
        String(selectedDate.getDate()).padStart(2, '0')
      ].join('-');
      setSelectedDateKey(dateKey);
    } else {
      setSelectedDateKey(null);
    }
  }, [selectedDate]);

  // Custom isToday function since the import is failing
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Helper function to compare dates without time
  const isSameOrAfterDay = (date: Date, referenceDate: Date) => {
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const normalizedReference = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate()
    );
    return normalizedDate >= normalizedReference;
  };

  // Process candidate counts by next contact date
  const candidatesByDate = candidates.reduce((acc, candidate) => {
    if (!candidate.nextContact) return acc

    // Create a date object from the candidate's nextContact date
    const nextContactDate = new Date(candidate.nextContact);
    
    // Normalize to yyyy-MM-dd format without timezone issues
    const dateKey = [
      nextContactDate.getFullYear(),
      String(nextContactDate.getMonth() + 1).padStart(2, '0'),
      String(nextContactDate.getDate()).padStart(2, '0')
    ].join('-');
    
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
  
  // Generate all dates in the range to ensure they all appear
  const allDatesInRange: Record<string, { candidates: Candidate[], count: number }> = {};
  let currentDate = today;
  
  // Initialize all dates in the range with empty candidate arrays
  while (currentDate <= endDate) {
    const dateKey = [
      currentDate.getFullYear(),
      String(currentDate.getMonth() + 1).padStart(2, '0'),
      String(currentDate.getDate()).padStart(2, '0')
    ].join('-');
    
    allDatesInRange[dateKey] = candidatesByDate[dateKey] || { candidates: [], count: 0 };
    currentDate = addDays(currentDate, 1);
  }
  
  // Create data for dates - use allDatesInRange instead of candidatesByDate to include empty dates
  const chartData = Object.entries(allDatesInRange)
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
        isSelected
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded p-2 shadow-lg">
          <p className="font-semibold">{format(data.date, 'MMM d, yyyy')}</p>
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

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <CardTitle className="text-lg">Candidates by Next Contact Date</CardTitle>
          <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <RadioGroup
              value={dayRange.toString()}
              onValueChange={(value) => setDayRange(parseInt(value))}
              className="flex space-x-3 min-w-max"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="15" id="r15" />
                <Label htmlFor="r15" className="text-xs sm:text-sm">15 Days</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="30" id="r30" />
                <Label htmlFor="r30" className="text-xs sm:text-sm">30 Days</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="60" id="r60" />
                <Label htmlFor="r60" className="text-xs sm:text-sm">60 Days</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="90" id="r90" />
                <Label htmlFor="r90" className="text-xs sm:text-sm">90 Days</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full overflow-x-auto" ref={chartContainerRef}>
          <div className="min-w-[800px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData}
                margin={{ left: 0, right: 0, bottom: 10 }}
              >
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(date, 'MMM d')}
                  interval={0}
                  tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                  height={50}
                />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  onClick={(data) => {
                    if (onBarClick && data.payload.date) {
                      onBarClick(data.payload.date)
                    }
                  }}
                  className="cursor-pointer"
                  label={({ x, y, width, height, value, index }) => {
                    const entry = chartData[index];
                    const textColor = entry?.isSelected ? '#ffffff' : '#000000';
                    return (
                      <text 
                        x={x + width / 2} 
                        y={y + height / 2} 
                        fill={textColor}
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        fontWeight="bold"
                        fontSize={12}
                      >
                        {value}
                      </text>
                    );
                  }}
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
        </div>
      </CardContent>
    </Card>
  )
} 