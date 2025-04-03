'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { format, startOfDay } from 'date-fns'
import { Candidate } from '@/types/candidate'
import { readExcelFile, exportToExcel } from '@/lib/excel-service'
import PivotTable from './PivotTable'
import ThemeToggle from './ThemeToggle'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Search, Clock, PlusCircle, Archive, Filter } from 'lucide-react'
import CandidateEditDialog from './CandidateEditDialog'
import { toast } from 'sonner'
import { getBackupPath, createBackupFilename } from '@/lib/file-system'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(new Date().setDate(new Date().getDate() + 30)),
  })
  
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    // Default to today's date
    return startOfDay(new Date())
  })
  const [showArchived, setShowArchived] = useState(false)
  const [lastAutoExport, setLastAutoExport] = useState<Date | null>(null);
  const [autoExportEnabled, setAutoExportEnabled] = useState<boolean>(false);

  const filteredCandidates = useMemo(() => {
    let filtered = candidates;
    
    // Filter by archived status
    filtered = filtered.filter(c => showArchived ? true : !c.archived);
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      filtered = filtered.filter(candidate => {
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
    }
    
    return filtered;
  }, [candidates, searchQuery, showArchived]);

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

  const handleAddCandidate = () => {
    // Create a new empty candidate with default values
    const newCandidate: Candidate = {
      id: crypto.randomUUID(),
      name: '',
      email: '',
      phone: '',
      stream: 'A', // default value
      needsAssessment: false,
      license: 'No',
      location: '',
      lastTouchDate: null,
      nextContact: null,
      status: 'Pending',
      category: 'Active Candidate',
      color: 'green',
      notes: '',
      isEmployed: false,
      archived: false
    };
    
    setSelectedCandidate(newCandidate);
    setIsEditDialogOpen(true);
  };

  const handleSaveCandidate = (updatedCandidate: Candidate) => {
    setCandidates(prev => {
      // Check if this is a new candidate
      const isNewCandidate = !prev.some(c => c.id === updatedCandidate.id);
      
      if (isNewCandidate) {
        // Add the new candidate to the list
        return [...prev, updatedCandidate];
      } else {
        // Update existing candidate
        return prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c);
      }
    });
    
    setIsEditDialogOpen(false);
    setSelectedCandidate(null);
  };

  const handleArchiveCandidate = (candidate: Candidate) => {
    // Toggle the archived status
    const updatedCandidate = {
      ...candidate,
      archived: !candidate.archived
    };
    
    setCandidates(prev => 
      prev.map(c => c.id === candidate.id ? updatedCandidate : c)
    );
    
    toast.success(updatedCandidate.archived ? 
      `${candidate.name} has been archived` : 
      `${candidate.name} has been unarchived`
    );
  };

  useEffect(() => {
    if (!autoExportEnabled || candidates.length === 0) return;
    
    // Auto-export every 30 minutes
    const intervalId = setInterval(() => {
      try {
        // Get backup path and create filename
        const backupPath = getBackupPath();
        const filename = createBackupFilename();
        const fullPath = `${backupPath}/${filename}`;
        
        // Create backup folder if it doesn't exist
        if (typeof window !== 'undefined' && window.electron) {
          window.electron.sendMessage('create-backup-folder', { path: backupPath });
          
          // In Electron environment, we would handle the actual file writing here
          // For now, we'll use the regular export function
          exportToExcel(candidates, fullPath);
          setLastAutoExport(new Date());
          toast.success('Auto-backup created successfully');
        } else {
          // In browser environment without Electron, just download the file
          exportToExcel(candidates);
          setLastAutoExport(new Date());
          toast.success('Auto-backup downloaded (browser mode)');
        }
      } catch (error) {
        console.error('Error during auto-export:', error);
        toast.error('Failed to create auto-backup');
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(intervalId);
  }, [autoExportEnabled, candidates]);

  return (
    <div className="w-full mx-auto space-y-4 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
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
            size="sm"
            onClick={handleExport}
            disabled={candidates.length === 0}
          >
            Export Excel
          </Button>
          
          <Button
            variant={autoExportEnabled ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setAutoExportEnabled(!autoExportEnabled)}
            disabled={candidates.length === 0}
          >
            <Clock className="h-4 w-4" />
            <span>Auto Backup</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleAddCandidate}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Candidate</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowArchived(!showArchived)}>
                <div className="flex items-center">
                  <div className={`w-4 h-4 mr-2 rounded-sm border ${showArchived ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                    {showArchived && <span className="text-white text-xs flex items-center justify-center">✓</span>}
                  </div>
                  Show Archived
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {lastAutoExport && (
            <span className="text-xs text-muted-foreground">
              Last backup: {lastAutoExport.toLocaleTimeString()}
            </span>
          )}
          
          <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
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
      
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Follow-ups by Date ({filteredCandidates.length} candidates)
            {showArchived && <Badge variant="outline" className="ml-2">Including Archived</Badge>}
          </h2>
        </div>
        <PivotTable
          data={filteredCandidates}
          dateRange={dateRange}
          onEditCandidate={handleEditCandidate}
          onArchiveCandidate={handleArchiveCandidate}
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