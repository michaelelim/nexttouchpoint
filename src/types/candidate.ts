export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  camsNumber?: string
  eapNumber?: string
  stream: string
  needsAssessment: boolean
  assessmentNotes?: string
  license: string
  location: string
  lastTouchDate: Date | null
  nextContact: Date | null
  status: string
  category?: string
  notes: string
  // Pay stub related fields (only applicable if employed)
  isEmployed: boolean
  payStubs?: {
    firstPayStub?: Date | null
    secondPayStub?: Date | null
    thirdPayStub?: Date | null
    fourthPayStub?: Date | null
    fifthPayStub?: Date | null
  }
} 