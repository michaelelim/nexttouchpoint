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

export default function CandidateEditDialog({
  candidate,
  open,
  onClose,
  onSave,
}: CandidateEditDialogProps) {
  const [editedCandidate, setEditedCandidate] = useState<Candidate>({ ...candidate })

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
        lastTouch: now,
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
            className="col-span-3 justify-start text-left font-normal"
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <InfoField
            label="Name"
            value={editedCandidate.name}
            copyable
          />

          <InfoField
            label="Email"
            value={editedCandidate.email}
            copyable
          />

          <InfoField
            label="Phone"
            value={editedCandidate.phone}
            copyable
          />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stream" className="text-right">
              Stream
            </Label>
            <Input
              id="stream"
              value={editedCandidate.stream}
              onChange={(e) =>
                setEditedCandidate((prev) => ({ ...prev, stream: e.target.value }))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="needs-assessment" className="text-right">
              Needs Assessment
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="needs-assessment"
                checked={editedCandidate.needsAssessment}
                onCheckedChange={(checked) =>
                  setEditedCandidate((prev) => ({ ...prev, needsAssessment: checked }))
                }
              />
              <Label htmlFor="needs-assessment" className="cursor-pointer">
                {editedCandidate.needsAssessment ? 'Yes' : 'No'}
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="license" className="text-right">
              License
            </Label>
            <Input
              id="license"
              value={editedCandidate.license}
              onChange={(e) =>
                setEditedCandidate((prev) => ({ ...prev, license: e.target.value }))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={editedCandidate.location}
              onChange={(e) =>
                setEditedCandidate((prev) => ({ ...prev, location: e.target.value }))
              }
              className="col-span-3"
            />
          </div>

          <DatePickerField
            label="Last Touch"
            value={editedCandidate.lastTouch}
            onChange={(date) =>
              setEditedCandidate((prev) => ({ ...prev, lastTouch: date }))
            }
          />

          <DatePickerField
            label="Next Contact"
            value={editedCandidate.nextContact}
            onChange={handleNextContactChange}
          />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={editedCandidate.status}
              onValueChange={(value) =>
                setEditedCandidate((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employed" className="text-right">
              Employed
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="employed"
                checked={editedCandidate.isEmployed}
                onCheckedChange={(checked) =>
                  setEditedCandidate((prev) => ({ 
                    ...prev, 
                    isEmployed: checked,
                    payStubs: checked ? prev.payStubs || {} : undefined
                  }))
                }
              />
              <Label htmlFor="employed" className="cursor-pointer">
                {editedCandidate.isEmployed ? 'Yes' : 'No'}
              </Label>
            </div>
          </div>

          {editedCandidate.isEmployed && (
            <>
              <DatePickerField
                label="First Pay Stub"
                value={editedCandidate.payStubs?.firstPayStub || null}
                onChange={(date) =>
                  setEditedCandidate((prev) => ({
                    ...prev,
                    payStubs: { ...prev.payStubs!, firstPayStub: date }
                  }))
                }
              />
              <DatePickerField
                label="Second Pay Stub"
                value={editedCandidate.payStubs?.secondPayStub || null}
                onChange={(date) =>
                  setEditedCandidate((prev) => ({
                    ...prev,
                    payStubs: { ...prev.payStubs!, secondPayStub: date }
                  }))
                }
              />
              <DatePickerField
                label="Third Pay Stub"
                value={editedCandidate.payStubs?.thirdPayStub || null}
                onChange={(date) =>
                  setEditedCandidate((prev) => ({
                    ...prev,
                    payStubs: { ...prev.payStubs!, thirdPayStub: date }
                  }))
                }
              />
              <DatePickerField
                label="Fourth Pay Stub"
                value={editedCandidate.payStubs?.fourthPayStub || null}
                onChange={(date) =>
                  setEditedCandidate((prev) => ({
                    ...prev,
                    payStubs: { ...prev.payStubs!, fourthPayStub: date }
                  }))
                }
              />
              <DatePickerField
                label="Fifth Pay Stub"
                value={editedCandidate.payStubs?.fifthPayStub || null}
                onChange={(date) =>
                  setEditedCandidate((prev) => ({
                    ...prev,
                    payStubs: { ...prev.payStubs!, fifthPayStub: date }
                  }))
                }
              />
            </>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={editedCandidate.notes}
              onChange={(e) =>
                setEditedCandidate((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 