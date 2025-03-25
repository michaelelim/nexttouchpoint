'use client'

import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'

interface DateFilterProps {
  dateRange: {
    start: Date
    end: Date
  }
  onChange: (range: { start: Date; end: Date }) => void
}

export default function DateFilter({ dateRange, onChange }: DateFilterProps) {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className="w-[300px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.start ? (
              dateRange.end ? (
                <>
                  {format(dateRange.start, 'LLL dd, y')} -{' '}
                  {format(dateRange.end, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.start, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.start}
            selected={{
              from: dateRange.start,
              to: dateRange.end,
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange({
                  start: range.from,
                  end: range.to,
                })
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 