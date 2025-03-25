'use client'

import { useState } from 'react'
import { format, isToday, isPast } from 'date-fns'
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
import { CalendarIcon, Copy } from 'lucide-react'
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

export default function CandidateEditDialog({
  candidate,
  open,
  onClose,
  onSave,
}: CandidateEditDialogProps) {
  const [editedCandidate, setEditedCandidate] = useState<Candidate>(candidate)

  const handleSave = () => {
    onSave(editedCandidate)
  }

  const handleNextContactChange = (date: Date | null) => {
    setEditedCandidate((prev) => {
      const now = new Date()
      const isCurrentOrPast = date ? (isToday(date) || isPast(date)) : false
      
      return {
        ...prev,
        nextContact: date,
        lastTouchDate: now,
        status: isCurrentOrPast ? 'Pending' : 'Contacted'
      }
    })
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
            onSelect={onChange}
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
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 py-6 max-h-[70vh] overflow-y-auto px-2">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editedCandidate.name}
                onChange={(e) =>
                  setEditedCandidate((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedCandidate.email}
                onChange={(e) =>
                  setEditedCandidate((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={editedCandidate.phone}
                onChange={(e) =>
                  setEditedCandidate((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Next Contact Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!editedCandidate.nextContact && 'text-muted-foreground'}`}
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
              <Label>Assessment</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editedCandidate.needsAssessment}
                  onCheckedChange={(checked) =>
                    setEditedCandidate((prev) => ({ ...prev, needsAssessment: checked }))
                  }
                />
                <Label>{editedCandidate.needsAssessment ? 'Yes' : 'No'}</Label>
              </div>
            </div>

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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>1st Pay</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!editedCandidate.payStubs?.firstPayStub && 'text-muted-foreground'}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedCandidate.payStubs?.firstPayStub ? format(editedCandidate.payStubs.firstPayStub, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editedCandidate.payStubs?.firstPayStub || undefined}
                        onSelect={(date) =>
                          setEditedCandidate((prev) => ({
                            ...prev,
                            payStubs: {
                              ...prev.payStubs,
                              firstPayStub: date
                            }
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>2nd Pay</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!editedCandidate.payStubs?.secondPayStub && 'text-muted-foreground'}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedCandidate.payStubs?.secondPayStub ? format(editedCandidate.payStubs.secondPayStub, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editedCandidate.payStubs?.secondPayStub || undefined}
                        onSelect={(date) =>
                          setEditedCandidate((prev) => ({
                            ...prev,
                            payStubs: {
                              ...prev.payStubs,
                              secondPayStub: date
                            }
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>3rd Pay</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!editedCandidate.payStubs?.thirdPayStub && 'text-muted-foreground'}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedCandidate.payStubs?.thirdPayStub ? format(editedCandidate.payStubs.thirdPayStub, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editedCandidate.payStubs?.thirdPayStub || undefined}
                        onSelect={(date) =>
                          setEditedCandidate((prev) => ({
                            ...prev,
                            payStubs: {
                              ...prev.payStubs,
                              thirdPayStub: date
                            }
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>4th Pay</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!editedCandidate.payStubs?.fourthPayStub && 'text-muted-foreground'}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedCandidate.payStubs?.fourthPayStub ? format(editedCandidate.payStubs.fourthPayStub, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editedCandidate.payStubs?.fourthPayStub || undefined}
                        onSelect={(date) =>
                          setEditedCandidate((prev) => ({
                            ...prev,
                            payStubs: {
                              ...prev.payStubs,
                              fourthPayStub: date
                            }
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>5th Pay</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!editedCandidate.payStubs?.fifthPayStub && 'text-muted-foreground'}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedCandidate.payStubs?.fifthPayStub ? format(editedCandidate.payStubs.fifthPayStub, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editedCandidate.payStubs?.fifthPayStub || undefined}
                        onSelect={(date) =>
                          setEditedCandidate((prev) => ({
                            ...prev,
                            payStubs: {
                              ...prev.payStubs,
                              fifthPayStub: date
                            }
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editedCandidate.notes || ''}
                onChange={(e) =>
                  setEditedCandidate((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="h-24"
              />
            </div>
          </div>
        </div>
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