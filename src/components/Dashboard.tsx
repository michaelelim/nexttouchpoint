'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Candidate } from '@/types/candidate'
import { readExcelFile, exportToExcel } from '@/lib/excel-service'
import PivotTable from './PivotTable'
import ThemeToggle from './ThemeToggle'
import { Button } from './ui/button'
import CandidateEditDialog from './CandidateEditDialog'

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(new Date().setDate(new Date().getDate() + 7)),
  })
  
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsEditDialogOpen(true)
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
        <ThemeToggle />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Follow-ups by Date ({candidates.length} candidates)
        </h2>
        <PivotTable
          data={candidates}
          dateRange={dateRange}
          onEditCandidate={handleEditCandidate}
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