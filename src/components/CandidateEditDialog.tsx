'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Candidate } from '@/types/candidate'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarIcon, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface CandidateEditDialogProps {
  candidate: Candidate
  open: boolean
  onClose: () => void
  onSave: (candidate: Candidate) => void
}

const STREAM_OPTIONS = ['A', 'B', 'C']
const LICENSE_OPTIONS = ['No', 'G1', 'G2', 'Full G']
const LOCATION_OPTIONS = ['Ajax', 'Pickering', 'Whitby', 'Oshawa', 'Other']
const CATEGORY_OPTIONS = [
  { label: 'Active Candidate', value: 'Active Candidate', color: 'green' },
  { label: 'Difficult to Reach', value: 'Difficult to Reach', color: 'yellow' },
  { label: 'Unable to Contact', value: 'Unable to Contact', color: 'red' },
  { label: 'Got a Job', value: 'Got a Job', color: 'purple' },
  { label: 'Active Hold', value: 'Active Hold', color: 'gray' },
  { label: 'BJO', value: 'BJO', color: 'brown' },
];

export default function CandidateEditDialog({
  candidate,
  open,
  onClose,
  onSave,
}: CandidateEditDialogProps) {
  const [editedCandidate, setEditedCandidate] = useState<Candidate>(candidate)
  const [activeTab, setActiveTab] = useState<string>("info")
  const [nextContactPopoverOpen, setNextContactPopoverOpen] = useState(false)
  const [firstPayPopoverOpen, setFirstPayPopoverOpen] = useState(false)
  const [secondPayPopoverOpen, setSecondPayPopoverOpen] = useState(false)
  const [thirdPayPopoverOpen, setThirdPayPopoverOpen] = useState(false)
  const [fourthPayPopoverOpen, setFourthPayPopoverOpen] = useState(false)
  const [fifthPayPopoverOpen, setFifthPayPopoverOpen] = useState(false)

  const handleSave = () => {
    onSave(editedCandidate)
  }

  const handleNextContactChange = (date: Date | undefined) => {
    setEditedCandidate((prev) => {
      const now = new Date()
      // Check if the date is today or in the past
      const isCurrentOrPast = date ? (date <= now) : false
      
      return {
        ...prev,
        nextContact: date || null,
        lastTouchDate: now,
        status: isCurrentOrPast ? 'Pending' : 'Contacted'
      }
    })
    // Close the popover after selecting a date
    setNextContactPopoverOpen(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const DatePickerField = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string
    value: Date | null
    onChange: (date: Date | null) => void
  }) => (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`col-span-3 justify-start text-left font-normal ${!value && 'text-muted-foreground'}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={(date: Date | undefined) => onChange(date || null)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )

  const InfoField = ({ 
    label, 
    value, 
    copyable = false 
  }: { 
    label: string
    value: string
    copyable?: boolean
  }) => (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right">{label}</Label>
      <div className="col-span-3 flex items-center gap-2">
        <Input value={value} readOnly={copyable} className="flex-1" />
        {copyable && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(value)}
            className="h-10 w-10"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="info">Candidate Info</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-0">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-3 max-h-[65vh] overflow-y-auto px-2">
              {/* Left Column */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      value={editedCandidate.name}
                      onChange={(e) =>
                        setEditedCandidate((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(editedCandidate.name)}
                      className="h-10 w-10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={editedCandidate.email}
                      onChange={(e) =>
                        setEditedCandidate((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(editedCandidate.email)}
                      className="h-10 w-10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      value={editedCandidate.phone}
                      onChange={(e) =>
                        setEditedCandidate((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(editedCandidate.phone)}
                      className="h-10 w-10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* CAMS and EAP on the same line */}
                <div className="grid grid-cols-2 gap-x-3">
                  <div className="space-y-2">
                    <Label htmlFor="camsNumber">CAMS #</Label>
                    <Input
                      id="camsNumber"
                      value={editedCandidate.camsNumber || ''}
                      onChange={(e) =>
                        setEditedCandidate((prev) => ({ ...prev, camsNumber: e.target.value }))
                      }
                      placeholder="Enter CAMS number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eapNumber">EAP #</Label>
                    <div className="flex gap-2">
                      <Input
                        id="eapNumber"
                        value={editedCandidate.eapNumber || ''}
                        onChange={(e) =>
                          setEditedCandidate((prev) => ({ ...prev, eapNumber: e.target.value }))
                        }
                        placeholder="Enter EAP number"
                      />
                      {editedCandidate.eapNumber && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(editedCandidate.eapNumber!)}
                          className="h-10 w-10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stream and License on the same line */}
                <div className="grid grid-cols-2 gap-x-3">
                  <div className="space-y-2">
                    <Label>Stream</Label>
                    <Select
                      value={editedCandidate.stream}
                      onValueChange={(value) =>
                        setEditedCandidate((prev) => ({ ...prev, stream: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stream" />
                      </SelectTrigger>
                      <SelectContent>
                        {STREAM_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>License</Label>
                    <Select
                      value={editedCandidate.license}
                      onValueChange={(value) =>
                        setEditedCandidate((prev) => ({ ...prev, license: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select license" />
                      </SelectTrigger>
                      <SelectContent>
                        {LICENSE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={editedCandidate.location}
                    onValueChange={(value) =>
                      setEditedCandidate((prev) => ({ ...prev, location: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status and Category on the same line */}
                <div className="grid grid-cols-2 gap-x-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editedCandidate.status}
                      onValueChange={(value) =>
                        setEditedCandidate((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Follow Up">Follow Up</SelectItem>
                        <SelectItem value="Not Interested">Not Interested</SelectItem>
                        <SelectItem value="Converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editedCandidate.category || ''}
                      onValueChange={(value) => {
                        // Find the matching color for this category
                        const categoryOption = CATEGORY_OPTIONS.find(option => option.value === value);
                        // Update both category and color
                        setEditedCandidate((prev) => ({
                          ...prev,
                          category: value,
                          color: categoryOption?.color || ''
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Next Contact Date</Label>
                  <Popover open={nextContactPopoverOpen} onOpenChange={setNextContactPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!editedCandidate.nextContact && 'text-muted-foreground'}`}
                        onClick={() => setNextContactPopoverOpen(true)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedCandidate.nextContact 
                          ? format(new Date(editedCandidate.nextContact), 'PPP') 
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editedCandidate.nextContact ? new Date(editedCandidate.nextContact) : undefined}
                        onSelect={handleNextContactChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Last Touched</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedCandidate.lastTouchDate ? format(new Date(editedCandidate.lastTouchDate), 'PPP') : 'Not contacted yet'}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={editedCandidate.notes}
                    onChange={(e) =>
                      setEditedCandidate((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Add notes about the candidate..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="employment" className="mt-0">
            <div className="py-3 space-y-4 max-h-[65vh] overflow-y-auto px-2">
              <div className="space-y-2">
                <Label>Employed</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editedCandidate.isEmployed}
                    onCheckedChange={(checked) =>
                      setEditedCandidate((prev) => ({ ...prev, isEmployed: checked }))
                    }
                  />
                  <Label>{editedCandidate.isEmployed ? 'Yes' : 'No'}</Label>
                </div>
              </div>

              {editedCandidate.isEmployed && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>1st Pay</Label>
                    <Popover open={firstPayPopoverOpen} onOpenChange={setFirstPayPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!editedCandidate.payStubs?.firstPayStub && 'text-muted-foreground'}`}
                          onClick={() => setFirstPayPopoverOpen(true)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedCandidate.payStubs?.firstPayStub ? format(editedCandidate.payStubs.firstPayStub, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editedCandidate.payStubs?.firstPayStub || undefined}
                          onSelect={(date: Date | undefined) => {
                            setEditedCandidate((prev) => ({
                              ...prev,
                              payStubs: {
                                ...prev.payStubs,
                                firstPayStub: date || null
                              }
                            }));
                            setFirstPayPopoverOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>2nd Pay</Label>
                    <Popover open={secondPayPopoverOpen} onOpenChange={setSecondPayPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!editedCandidate.payStubs?.secondPayStub && 'text-muted-foreground'}`}
                          onClick={() => setSecondPayPopoverOpen(true)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedCandidate.payStubs?.secondPayStub ? format(editedCandidate.payStubs.secondPayStub, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editedCandidate.payStubs?.secondPayStub || undefined}
                          onSelect={(date: Date | undefined) => {
                            setEditedCandidate((prev) => ({
                              ...prev,
                              payStubs: {
                                ...prev.payStubs,
                                secondPayStub: date || null
                              }
                            }));
                            setSecondPayPopoverOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>3rd Pay</Label>
                    <Popover open={thirdPayPopoverOpen} onOpenChange={setThirdPayPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!editedCandidate.payStubs?.thirdPayStub && 'text-muted-foreground'}`}
                          onClick={() => setThirdPayPopoverOpen(true)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedCandidate.payStubs?.thirdPayStub ? format(editedCandidate.payStubs.thirdPayStub, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editedCandidate.payStubs?.thirdPayStub || undefined}
                          onSelect={(date: Date | undefined) => {
                            setEditedCandidate((prev) => ({
                              ...prev,
                              payStubs: {
                                ...prev.payStubs,
                                thirdPayStub: date || null
                              }
                            }));
                            setThirdPayPopoverOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>4th Pay</Label>
                    <Popover open={fourthPayPopoverOpen} onOpenChange={setFourthPayPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!editedCandidate.payStubs?.fourthPayStub && 'text-muted-foreground'}`}
                          onClick={() => setFourthPayPopoverOpen(true)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedCandidate.payStubs?.fourthPayStub ? format(editedCandidate.payStubs.fourthPayStub, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editedCandidate.payStubs?.fourthPayStub || undefined}
                          onSelect={(date: Date | undefined) => {
                            setEditedCandidate((prev) => ({
                              ...prev,
                              payStubs: {
                                ...prev.payStubs,
                                fourthPayStub: date || null
                              }
                            }));
                            setFourthPayPopoverOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>5th Pay</Label>
                    <Popover open={fifthPayPopoverOpen} onOpenChange={setFifthPayPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!editedCandidate.payStubs?.fifthPayStub && 'text-muted-foreground'}`}
                          onClick={() => setFifthPayPopoverOpen(true)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedCandidate.payStubs?.fifthPayStub ? format(editedCandidate.payStubs.fifthPayStub, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editedCandidate.payStubs?.fifthPayStub || undefined}
                          onSelect={(date: Date | undefined) => {
                            setEditedCandidate((prev) => ({
                              ...prev,
                              payStubs: {
                                ...prev.payStubs,
                                fifthPayStub: date || null
                              }
                            }));
                            setFifthPayPopoverOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 