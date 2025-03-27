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
    
    return candidates.filter(candidate => {
      // Check if it's a direct match in any standard field
      // This catches both primitive fields and any custom fields added during Excel import
      for (const [key, value] of Object.entries(candidate)) {
        // Skip non-searchable fields like dates and objects
        if (value === null || value === undefined) continue;
        if (typeof value === 'boolean') continue;
        
        // Format dates for searching
        if (value instanceof Date) {
          if (format(value, 'MMM d, yyyy').toLowerCase().includes(query)) {
            return true;
          }
          continue;
        }
        
        // Skip complex objects (but we'll handle them separately)
        if (typeof value === 'object') continue;
        
        // Convert value to string and check if it includes the query
        const strValue = String(value).toLowerCase();
        if (strValue.includes(query)) {
          return true;
        }
      }
      
      // Additional checks for nested fields
      if (candidate.payStubs) {
        // Convert any date fields in payStubs to strings for searching
        const payStubDates = [
          candidate.payStubs.firstPayStub,
          candidate.payStubs.secondPayStub,
          candidate.payStubs.thirdPayStub,
          candidate.payStubs.fourthPayStub,
          candidate.payStubs.fifthPayStub
        ].filter(Boolean);
        
        for (const date of payStubDates) {
          if (date && format(new Date(date), 'MMM d, yyyy').toLowerCase().includes(query)) {
            return true;
          }
        }
      }
      
      // Check any additional fields that might have been added during import
      // This catches fields that aren't in the Candidate type definition but exist in the data
      const candidateAny = candidate as any;
      for (const key in candidateAny) {
        if (
          !Object.prototype.hasOwnProperty.call(candidateAny, key) ||
          key in candidate // Skip fields we already checked
        ) continue;
        
        const value = candidateAny[key];
        if (value === null || value === undefined) continue;
        
        // Convert to string and search
        const strValue = String(value).toLowerCase();
        if (strValue.includes(query)) {
          return true;
        }
      }
      
      return false;
    });
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
          
          <div className="relative w-64 ml-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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