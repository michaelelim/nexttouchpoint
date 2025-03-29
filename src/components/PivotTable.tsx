'use client'

import { useState, useEffect, useRef } from 'react'
import { format, eachDayOfInterval, differenceInDays, parseISO } from 'date-fns'
import { Candidate } from '@/types/candidate'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Copy, Mail, Phone, MapPin, Calendar, GraduationCap, Hash, 
  ClipboardList, History, Circle, ChevronUp, ChevronDown,
  LayoutGrid, Calendar as CalendarIcon, Pencil, Check, X
} from 'lucide-react'
import { toast } from 'sonner'
import { CandidateBarGraph } from './CandidateBarGraph'
import { Card, CardContent } from './ui/card'
import EmailTemplateDropdown from './EmailTemplateDropdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as UICalendar } from "@/components/ui/calendar"

type SortOption = 'name_asc' | 'name_desc' | 'last_contact_asc' | 'last_contact_desc';
type ColumnLayout = '1' | '2' | '3';

interface PivotTableProps {
  data: Candidate[]
  dateRange: {
    start: Date
    end: Date
  }
  onEditCandidate: (candidate: Candidate, openDialog?: boolean) => void
  selectedDate: Date | null
  onDateSelect?: (date: Date | null) => void
}

export default function PivotTable({ data, dateRange, onEditCandidate, selectedDate, onDateSelect }: PivotTableProps) {
  const [selectedDateState, setSelectedDateState] = useState<string | null>(
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  )
  const [sortOption, setSortOption] = useState<SortOption>('name_asc')
  const [columnLayout, setColumnLayout] = useState<ColumnLayout>('3')
  const [editingNextContactId, setEditingNextContactId] = useState<string | null>(null)
  const [tempNextContactDate, setTempNextContactDate] = useState<Date | null>(null)
  
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

  const getCardBackgroundColor = (status: string, candidateColor?: string) => {
    // If color is provided directly, use it
    if (candidateColor) {
      switch (candidateColor.toLowerCase()) {
        case 'green': return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
        case 'yellow': return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
        case 'red': return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
        case 'purple': return 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800'
        case 'gray': return 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800'
        case 'brown': return 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800'
      }
    }

    // Otherwise fall back to status-based coloring
    switch (status.toLowerCase()) {
      case 'active candidate':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      case 'difficult to reach':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
      case 'unable to contact':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      case 'got a job':
        return 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800'
      case 'active hold':
        return 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800'
      case 'bjo':
        return 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800'
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  // Filter candidates based on selected date and remove empty candidates
  let filteredCandidates = selectedDateState
    ? data.filter((candidate) => {
        if (!candidate.nextContact) return false;
        const candidateDate = new Date(candidate.nextContact).toISOString().split('T')[0];
        return candidateDate === selectedDateState;
      })
    : data;
    
  // Filter out empty candidates (where all fields are blank or default)
  filteredCandidates = filteredCandidates.filter(candidate => {
    // Check if this is an empty candidate entry
    const hasName = candidate.name && candidate.name.trim() !== '';
    const hasEmail = candidate.email && candidate.email.trim() !== '';
    const hasPhone = candidate.phone && candidate.phone.trim() !== '';
    
    // Only include candidates that have at least a name, email, or phone
    return hasName || hasEmail || hasPhone;
  });

  // Sort candidates based on selected sort option
  filteredCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortOption === 'name_asc') {
      return a.name.localeCompare(b.name);
    } else if (sortOption === 'name_desc') {
      return b.name.localeCompare(a.name);
    } else if (sortOption === 'last_contact_asc') {
      // Sort by last contact date, oldest first (nulls at the top)
      if (!a.lastTouchDate) return -1;
      if (!b.lastTouchDate) return 1;
      return new Date(a.lastTouchDate).getTime() - new Date(b.lastTouchDate).getTime();
    } else if (sortOption === 'last_contact_desc') {
      // Sort by last contact date, newest first (nulls at the bottom)
      if (!a.lastTouchDate) return 1;
      if (!b.lastTouchDate) return -1;
      return new Date(b.lastTouchDate).getTime() - new Date(a.lastTouchDate).getTime();
    }
    return 0;
  });

  // Helper function to format date consistently
  const formatDateWithAdjustment = (dateString: string) => {
    // Parse the date string to create a date object with the correct date
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date with local time values to avoid timezone issues
    const date = new Date(year, month - 1, day); 
    return format(date, 'MMMM d, yyyy');
  };

  const handleEditCandidate = (candidate: Candidate) => {
    onEditCandidate(candidate, true);
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

  const handleStartEditingNextContact = (candidateId: string, currentDate: Date | null) => {
    setEditingNextContactId(candidateId);
    setTempNextContactDate(currentDate);
  };

  const handleCancelEditingNextContact = () => {
    setEditingNextContactId(null);
    setTempNextContactDate(null);
  };

  const handleSaveNextContactDate = (candidate: Candidate) => {
    // Update the candidate with the new next contact date
    const now = new Date();
    const isCurrentOrPast = tempNextContactDate 
      ? (tempNextContactDate <= now) 
      : false;
    
    const updatedCandidate = {
      ...candidate,
      nextContact: tempNextContactDate,
      lastTouchDate: now,
      status: isCurrentOrPast ? 'Pending' : 'Contacted',
    };
    
    onEditCandidate(updatedCandidate);
    setEditingNextContactId(null);
    setTempNextContactDate(null);
  };

  const statusOptions = [
    { label: 'Active Candidate', value: 'Active Candidate', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' },
    { label: 'Difficult to Reach', value: 'Difficult to Reach', color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' },
    { label: 'Unable to Contact', value: 'Unable to Contact', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' },
    { label: 'Got a Job', value: 'Got a Job', color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800' },
    { label: 'Active Hold', value: 'Active Hold', color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800' },
    { label: 'BJO', value: 'BJO', color: 'text-amber-700', bgColor: 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800' },
  ];

  const handleChangeStatus = (candidate: Candidate, newCategory: string) => {
    // Determine the corresponding color for the new category
    let newColor: string | undefined;
    switch (newCategory.toLowerCase()) {
      case 'active candidate': newColor = 'green'; break;
      case 'difficult to reach': newColor = 'yellow'; break;
      case 'unable to contact': newColor = 'red'; break;
      case 'got a job': newColor = 'purple'; break;
      case 'active hold': newColor = 'gray'; break;
      case 'bjo': newColor = 'brown'; break;
    }
    
    // Create a new candidate object with category and color changed
    const updatedCandidate = {
      ...candidate,
      category: newCategory,
      color: newColor // Update the color field to match the category
    };
    
    // Update the candidate without triggering the edit dialog
    onEditCandidate(updatedCandidate, false);
  };

  // Add a category mapping for the status values
  const getCategoryFromStatus = (status: string): string => {
    // Convert status to lowercase for case-insensitive matching
    const lowerStatus = status.toLowerCase();
    
    // Predefined category statuses
    if (lowerStatus === 'active candidate' || 
        lowerStatus === 'difficult to reach' || 
        lowerStatus === 'unable to contact' || 
        lowerStatus === 'got a job' || 
        lowerStatus === 'active hold' ||
        lowerStatus === 'bjo') {
      return status; // The status is already a category
    }
    
    // Default mapping for other statuses
    if (lowerStatus.includes('pending')) return 'Active Candidate';
    if (lowerStatus.includes('contacted')) return 'Active Candidate'; 
    if (lowerStatus.includes('follow up')) return 'Active Candidate';
    if (lowerStatus.includes('not interested')) return 'Unable to Contact';
    if (lowerStatus.includes('converted') || lowerStatus.includes('job')) return 'Got a Job';
    
    return 'Active Candidate'; // Default category
  };

  // Get the current category of a candidate
  const getCandidateCategory = (candidate: Candidate): string => {
    // If candidate has a color field, map it to the corresponding category (prioritize color over category)
    if (candidate.color) {
      switch (candidate.color.toLowerCase()) {
        case 'green': return 'Active Candidate';
        case 'yellow': return 'Difficult to Reach';
        case 'red': return 'Unable to Contact';
        case 'purple': return 'Got a Job';
        case 'gray': return 'Active Hold';
        case 'brown': return 'BJO';
        default: return 'Active Candidate';
      }
    }
    
    // Next, check if candidate has a category field
    if (candidate.category) {
      return candidate.category;
    }
    
    // Otherwise, infer from status (for backward compatibility)
    return getCategoryFromStatus(candidate.status);
  };

  // Get grid classes based on column layout
  const getGridClasses = () => {
    switch (columnLayout) {
      case '1': return 'grid-cols-1';
      case '2': return 'grid-cols-1 md:grid-cols-2';
      case '3': 
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Helper function to get category badge color based on category and color field
  const getCategoryBadgeColor = (category: string, candidateColor?: string) => {
    // If color is provided directly, use it
    if (candidateColor) {
      switch (candidateColor.toLowerCase()) {
        case 'green': return 'border-green-500 text-green-700 dark:text-green-400'
        case 'yellow': return 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
        case 'red': return 'border-red-500 text-red-700 dark:text-red-400'
        case 'purple': return 'border-purple-500 text-purple-700 dark:text-purple-400'
        case 'gray': return 'border-gray-500 text-gray-700 dark:text-gray-400'
        case 'brown': return 'border-amber-700 text-amber-800 dark:text-amber-400'
      }
    }

    // Otherwise fall back to category-based coloring
    switch (category) {
      case 'Active Candidate': return 'border-green-500 text-green-700 dark:text-green-400'
      case 'Difficult to Reach': return 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
      case 'Unable to Contact': return 'border-red-500 text-red-700 dark:text-red-400'
      case 'Got a Job': return 'border-purple-500 text-purple-700 dark:text-purple-400'
      case 'BJO': return 'border-amber-700 text-amber-800 dark:text-amber-400'
      default: return 'border-gray-500 text-gray-700 dark:text-gray-400'
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <h1 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">Candidate Follow-Up Dashboard</h1>
      <div className="w-full overflow-x-auto pb-4">
        <CandidateBarGraph 
          candidates={data} 
          onBarClick={handleBarClick}
          selectedDate={selectedDate}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 sm:mt-8 mb-4 gap-2">
        <h2 className="text-base sm:text-xl font-semibold">
          {selectedDateState 
            ? `Candidates to Contact on ${formatDateWithAdjustment(selectedDateState)}`
            : 'Showing All Candidates'}
        </h2>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Column Layout Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <LayoutGrid className="h-4 w-4" />
                <span>{columnLayout}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={columnLayout} onValueChange={(value) => setColumnLayout(value as ColumnLayout)}>
                <DropdownMenuRadioItem value="1">
                  <div className="flex items-center gap-2">
                    <span>1 Column</span>
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="2">
                  <div className="flex items-center gap-2">
                    <span>2 Columns</span>
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="3">
                  <div className="flex items-center gap-2">
                    <span>3 Columns</span>
                  </div>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <ChevronUp className="h-4 w-4" />
                <ChevronDown className="h-4 w-4" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <DropdownMenuRadioItem value="name_asc">
                  <div className="flex items-center gap-2">
                    <span>Name (A-Z)</span>
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name_desc">
                  <div className="flex items-center gap-2">
                    <span>Name (Z-A)</span>
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="last_contact_asc">
                  <div className="flex items-center gap-2">
                    <span>Last Contact (Oldest first)</span>
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="last_contact_desc">
                  <div className="flex items-center gap-2">
                    <span>Last Contact (Newest first)</span>
                  </div>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className={`grid ${getGridClasses()} gap-2 sm:gap-4`}>
        {filteredCandidates.map((candidate) => {
          const currentCategory = getCandidateCategory(candidate);
          const isEditingNextContact = editingNextContactId === candidate.id;
          
          return (
            <Card 
              key={candidate.id}
              className={`hover:shadow-lg transition-shadow border ${getCardBackgroundColor(currentCategory, candidate.color)}`}
            >
              <CardContent className="p-2 sm:p-4">
                <div className="flex flex-col space-y-1 sm:space-y-2">
                  {/* Header with name and status */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold truncate">{candidate.name}</h3>
                      <div className="flex flex-wrap gap-1 items-center mt-1">
                        {/* Status Badge - Shows the process status */}
                        <Badge className={getStatusColor(candidate.status)}>
                          {candidate.status}
                        </Badge>
                        
                        {/* Category Badge - Shows the contact category */}
                        <div className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${
                          getCategoryBadgeColor(currentCategory, candidate.color)
                        }`}>
                          {currentCategory}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                              <Circle className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {statusOptions.map(option => (
                              <DropdownMenuItem
                                key={option.value}
                                className={`flex items-center gap-2 ${option.value === currentCategory ? 'bg-muted' : ''}`}
                                onClick={(e) => {
                                  handleChangeStatus(candidate, option.value);
                                }}
                              >
                                <div className={`w-3 h-3 rounded-full ${option.color}`} />
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <EmailTemplateDropdown candidate={candidate} />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(candidate.name)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEditCandidate(candidate)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Contact Information and ID (combined row) */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="flex-1 truncate">{candidate.email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1"
                          onClick={() => copyToClipboard(candidate.email)}
                        >
                          <Copy className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="flex-1 truncate">{candidate.phone}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1"
                          onClick={() => copyToClipboard(candidate.phone)}
                        >
                          <Copy className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Hash className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">CAMS: {candidate.camsNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Hash className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">EAP: {candidate.eapNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stream and Next Contact */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-t pt-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <GraduationCap className="h-3 w-3" />
                      <span>{candidate.stream}</span>
                    </div>
                    
                    {/* Next Contact Date - Editable */}
                    <div className="flex items-center gap-1 text-muted-foreground relative">
                      <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                      
                      {isEditingNextContact ? (
                        // Editing mode
                        <div className="flex-1 flex items-center">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-full justify-start px-2 py-1 text-xs font-normal"
                              >
                                {tempNextContactDate 
                                  ? format(tempNextContactDate, 'MMM d') 
                                  : 'Select date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <UICalendar
                                mode="single"
                                selected={tempNextContactDate || undefined}
                                onSelect={(date) => setTempNextContactDate(date || null)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          
                          <div className="flex ml-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleSaveNextContactDate(candidate)}
                            >
                              <Check className="h-3 w-3 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={handleCancelEditingNextContact}
                            >
                              <X className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <>
                          <span className="flex-1">
                            {candidate.nextContact
                              ? format(new Date(candidate.nextContact), 'MMM d')
                              : 'No date'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => 
                              handleStartEditingNextContact(
                                candidate.id, 
                                candidate.nextContact 
                                  ? new Date(candidate.nextContact) 
                                  : null
                              )
                            }
                          >
                            <Pencil className="h-2.5 w-2.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Last Touch Date */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <History className="h-3 w-3" />
                    <span>Last Contact: {candidate.lastTouchDate 
                      ? format(new Date(candidate.lastTouchDate), 'MMM d, yyyy')
                      : 'Never'}</span>
                  </div>

                  {/* Assessment Notes - only if available */}
                  {candidate.assessmentNotes && (
                    <div className="text-xs text-muted-foreground border-t pt-1 line-clamp-1">
                      <span className="font-medium">Notes: </span>
                      {candidate.assessmentNotes}
                    </div>
                  )}
                  
                  {/* Notes section - only if available */}
                  {candidate.notes && (
                    <div className="text-xs text-muted-foreground border-t mt-1 pt-1 line-clamp-2">
                      <span className="font-medium">Notes: </span>
                      {candidate.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 