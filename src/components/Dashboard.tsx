'use client'

import { useState, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { Candidate } from '@/types/candidate'
import { readExcelFile, exportToExcel } from '@/lib/excel-service'
import PivotTable from './PivotTable'
import ThemeToggle from './ThemeToggle'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Search } from 'lucide-react'
import CandidateEditDialog from './CandidateEditDialog'

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(new Date().setDate(new Date().getDate() + 7)),
  })
  
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    
    const query = searchQuery.toLowerCase().trim();
    return candidates.filter(candidate => 
      (candidate.name || '').toLowerCase().includes(query) ||
      (candidate.email || '').toLowerCase().includes(query) ||
      (candidate.phone || '').toLowerCase().includes(query) ||
      (candidate.camsNumber ? candidate.camsNumber.toLowerCase().includes(query) : false) ||
      (candidate.eapNumber ? candidate.eapNumber.toLowerCase().includes(query) : false)
    );
  }, [candidates, searchQuery]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const data = await readExcelFile(file)
        setCandidates(data)
      } catch (error) {
        console.error('Error reading Excel file:', error)
        alert('Error reading Excel file. Please make sure it\'s a valid Excel file.')
      }
    }
  }

  const handleExport = () => {
    if (candidates.length > 0) {
      exportToExcel(candidates)
    } else {
      alert('No candidates to export.')
    }
  }

  const handleEditCandidate = (candidate: Candidate, openDialog: boolean = true) => {
    setCandidates(prev => 
      prev.map(c => c.id === candidate.id ? candidate : c)
    )
    
    if (openDialog) {
      setSelectedCandidate(candidate)
      setIsEditDialogOpen(true)
    }
  }

  const handleSaveCandidate = (updatedCandidate: Candidate) => {
    setCandidates(prev => 
      prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c)
    )
    setIsEditDialogOpen(false)
    setSelectedCandidate(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            Import Excel
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={candidates.length === 0}
          >
            Export Excel
          </Button>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ThemeToggle />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Follow-ups by Date ({filteredCandidates.length} candidates)
        </h2>
        <PivotTable
          data={filteredCandidates}
          dateRange={dateRange}
          onEditCandidate={handleEditCandidate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>

      {selectedCandidate && (
        <CandidateEditDialog
          candidate={selectedCandidate}
          open={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedCandidate(null)
          }}
          onSave={handleSaveCandidate}
        />
      )}
    </div>
  )
} 