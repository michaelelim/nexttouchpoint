'use client'

import { useState } from 'react'
import { format, eachDayOfInterval, differenceInDays, parseISO } from 'date-fns'
import { Candidate } from '@/types/candidate'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { CandidateBarGraph } from './CandidateBarGraph'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

interface PivotTableProps {
  data: Candidate[]
  dateRange: {
    start: Date
    end: Date
  }
  onEditCandidate: (candidate: Candidate) => void
  selectedDate: Date | null
}

export default function PivotTable({ data, dateRange, onEditCandidate, selectedDate }: PivotTableProps) {
  const [selectedDateState, setSelectedDate] = useState<string | null>(null)
  
  const dates = eachDayOfInterval({
    start: dateRange.start,
    end: dateRange.end
  })
  
  // Group candidates by next contact date
  const candidatesByDate = dates.reduce((acc, date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    acc[dateStr] = data.filter(candidate => {
      if (!candidate.nextContact) return false
      // Convert to local date string first to avoid timezone issues
      const localDate = new Date(candidate.nextContact).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
      })
      // Parse back to Date object to get consistent formatting
      const [month, day, year] = localDate.split('/')
      const candidateDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      return candidateDateStr === dateStr
    })
    return acc
  }, {} as Record<string, Candidate[]>)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'contacted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'follow up':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'not interested':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'converted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const filteredDates = selectedDateState 
    ? [selectedDateState] 
    : dates.map(date => format(date, 'yyyy-MM-dd'))

  // Filter candidates based on selected date
  const filteredCandidates = selectedDate
    ? data.filter((candidate) => {
        if (!candidate.nextContact) return false;
        
        // Convert both dates to YYYY-MM-DD format for comparison
        const candidateDate = new Date(candidate.nextContact).toISOString().split('T')[0];
        const selectedDateStr = selectedDate.toISOString().split('T')[0];
        
        return candidateDate === selectedDateStr;
      })
    : data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Candidate Follow-Up Dashboard</h1>
      <CandidateBarGraph 
        candidates={data} 
        onBarClick={(date) => setSelectedDate(format(date, 'yyyy-MM-dd'))}
      />
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Stream</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Contact</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Employed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.phone}</TableCell>
                <TableCell>{candidate.stream}</TableCell>
                <TableCell>{candidate.license}</TableCell>
                <TableCell>{candidate.location}</TableCell>
                <TableCell>{candidate.status}</TableCell>
                <TableCell>
                  {candidate.nextContact
                    ? format(new Date(candidate.nextContact), 'MMM d, yyyy')
                    : ''}
                </TableCell>
                <TableCell>{candidate.needsAssessment ? 'Yes' : 'No'}</TableCell>
                <TableCell>{candidate.isEmployed ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 