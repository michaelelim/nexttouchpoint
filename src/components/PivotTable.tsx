'use client'

import { useState, useEffect } from 'react'
import { format, eachDayOfInterval, differenceInDays, parseISO } from 'date-fns'
import { Candidate } from '@/types/candidate'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Mail, Phone, MapPin, Calendar, GraduationCap, Hash, ClipboardList, History } from 'lucide-react'
import { toast } from 'sonner'
import { CandidateBarGraph } from './CandidateBarGraph'
import { Card, CardContent } from './ui/card'

interface PivotTableProps {
  data: Candidate[]
  dateRange: {
    start: Date
    end: Date
  }
  onEditCandidate: (candidate: Candidate) => void
  selectedDate: Date | null
  onDateSelect?: (date: Date | null) => void
}

export default function PivotTable({ data, dateRange, onEditCandidate, selectedDate, onDateSelect }: PivotTableProps) {
  const [selectedDateState, setSelectedDateState] = useState<string | null>(
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  )
  
  // Update internal state when prop changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedDateState(format(selectedDate, 'yyyy-MM-dd'))
    } else {
      setSelectedDateState(null)
    }
  }, [selectedDate])
  
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

  // Filter candidates based on selected date
  const filteredCandidates = selectedDateState
    ? data.filter((candidate) => {
        if (!candidate.nextContact) return false;
        const candidateDate = new Date(candidate.nextContact).toISOString().split('T')[0];
        return candidateDate === selectedDateState;
      })
    : data;

  // Helper function to format date consistently
  const formatDateWithAdjustment = (dateString: string) => {
    // Parse the date string to create a date object with the correct date
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date with local time values to avoid timezone issues
    const date = new Date(year, month - 1, day); 
    return format(date, 'MMMM d, yyyy');
  };

  const handleEditCandidate = (candidate: Candidate) => {
    // If next contact is changed, update status to contacted
    const updatedCandidate = {
      ...candidate,
      status: 'Contacted'
    }
    onEditCandidate(updatedCandidate)
  }

  const handleBarClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    // If clicking the same date again, clear the selection
    if (dateStr === selectedDateState) {
      setSelectedDateState(null)
      if (onDateSelect) {
        onDateSelect(null)
      }
    } else {
      setSelectedDateState(dateStr)
      if (onDateSelect) {
        onDateSelect(date)
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Candidate Follow-Up Dashboard</h1>
      <CandidateBarGraph 
        candidates={data} 
        onBarClick={handleBarClick}
      />
      
      <h2 className="text-xl font-semibold mt-8 mb-4">
        {selectedDateState 
          ? `Candidates to Contact on ${formatDateWithAdjustment(selectedDateState)}`
          : 'Showing All Candidates'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map((candidate) => (
          <Card 
            key={candidate.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleEditCandidate(candidate)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                {/* Header with name and status */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold truncate">{candidate.name}</h3>
                    <Badge className={getStatusColor(candidate.status)}>
                      {candidate.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(candidate.name)
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="flex-1 truncate">{candidate.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(candidate.email)
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="flex-1">{candidate.phone}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(candidate.phone)
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* ID Numbers */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>CAMS: {candidate.camsNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span className="flex-1">EAP: {candidate.eapNumber || 'N/A'}</span>
                    {candidate.eapNumber && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(candidate.eapNumber!)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stream and Next Contact */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>{candidate.stream}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {candidate.nextContact
                        ? format(new Date(candidate.nextContact), 'MMM d')
                        : 'No date'}
                    </span>
                  </div>
                </div>

                {/* Assessment Section */}
                {(candidate.needsAssessment || candidate.assessmentNotes) && (
                  <div className="space-y-2 border-t pt-2">
                    <div className="flex items-start gap-2">
                      <ClipboardList className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Assessment</div>
                        {candidate.needsAssessment && (
                          <Badge variant="secondary" className="mt-1">Needs Assessment</Badge>
                        )}
                        {candidate.assessmentNotes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {candidate.assessmentNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Last Touch Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-2">
                  <History className="h-4 w-4" />
                  <span>Last Contact: {candidate.lastTouchDate 
                    ? format(new Date(candidate.lastTouchDate), 'MMM d, yyyy')
                    : 'Never'}</span>
                </div>

                {/* Footer Information */}
                <div className="flex gap-2 text-sm">
                  {candidate.isEmployed && (
                    <Badge variant="secondary">Employed</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 