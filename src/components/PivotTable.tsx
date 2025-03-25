'use client'

import { format, eachDayOfInterval, differenceInDays } from 'date-fns'
import { Candidate } from '@/types/candidate'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import CandidateBarGraph from './CandidateBarGraph'

interface PivotTableProps {
  data: Candidate[]
  dateRange: {
    start: Date
    end: Date
  }
  onEditCandidate: (candidate: Candidate) => void
}

export default function PivotTable({ data, dateRange, onEditCandidate }: PivotTableProps) {
  const dates = eachDayOfInterval(dateRange)
  
  // Group candidates by next contact date
  const candidatesByDate = dates.reduce((acc, date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    acc[dateStr] = data.filter(
      candidate => candidate.nextContact && format(candidate.nextContact, 'yyyy-MM-dd') === dateStr
    )
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Candidate Follow-Up Dashboard</h1>
      <CandidateBarGraph data={data} dateRange={dateRange} />
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left align-top text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left align-top text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Candidates
              </th>
              <th className="px-6 py-3 text-left align-top text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {dates.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd')
              const candidates = candidatesByDate[dateStr] || []
              
              return (
                <tr key={dateStr} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 align-top whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {format(date, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 align-top whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {candidates.length} candidates
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-gray-500 dark:text-gray-400">
                    <div className="space-y-4">
                      {candidates.map(candidate => (
                        <div key={candidate.id} className="flex flex-col gap-2 p-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {candidate.name}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(candidate.name)}
                                  className="h-6 w-6"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                                <span className="flex items-center gap-2">
                                  {candidate.email}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(candidate.email)}
                                    className="h-6 w-6"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </span>
                                <span className="flex items-center gap-2">
                                  {candidate.phone}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(candidate.phone)}
                                    className="h-6 w-6"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditCandidate(candidate)}
                            >
                              Edit
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-semibold">Stream:</span> {candidate.stream}
                            </div>
                            <div>
                              <span className="font-semibold">License:</span> {candidate.license}
                            </div>
                            <div>
                              <span className="font-semibold">Location:</span> {candidate.location}
                            </div>
                            <div>
                              <span className="font-semibold">Needs Assessment:</span>{' '}
                              {candidate.needsAssessment ? 'Yes' : 'No'}
                            </div>
                            {candidate.lastTouch && (
                              <div>
                                <span className="font-semibold">Last Touch:</span>{' '}
                                {format(candidate.lastTouch, 'MMM dd, yyyy')}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge className={getStatusColor(candidate.status)}>
                              {candidate.status}
                            </Badge>
                            {candidate.isEmployed && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Employed
                              </Badge>
                            )}
                          </div>

                          {candidate.isEmployed && candidate.payStubs && (
                            <div className="text-sm">
                              <div className="font-semibold mb-1">Pay Stubs:</div>
                              <div className="grid grid-cols-2 gap-2">
                                {candidate.payStubs.firstPayStub && (
                                  <div>1st: {format(candidate.payStubs.firstPayStub, 'MMM dd')}</div>
                                )}
                                {candidate.payStubs.secondPayStub && (
                                  <div>2nd: {format(candidate.payStubs.secondPayStub, 'MMM dd')}</div>
                                )}
                                {candidate.payStubs.thirdPayStub && (
                                  <div>3rd: {format(candidate.payStubs.thirdPayStub, 'MMM dd')}</div>
                                )}
                                {candidate.payStubs.fourthPayStub && (
                                  <div>4th: {format(candidate.payStubs.fourthPayStub, 'MMM dd')}</div>
                                )}
                                {candidate.payStubs.fifthPayStub && (
                                  <div>5th: {format(candidate.payStubs.fifthPayStub, 'MMM dd')}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {candidate.notes && (
                            <div className="text-sm">
                              <span className="font-semibold">Notes:</span> {candidate.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
} 