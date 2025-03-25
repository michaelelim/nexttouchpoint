export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  stream: string
  needsAssessment: boolean
  license: string
  location: string
  lastTouch: Date | null
  nextContact: Date | null
  status: string
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