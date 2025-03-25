import * as XLSX from 'xlsx'
import { Candidate } from '@/types/candidate'

function parseDate(value: any): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  
  // Handle Excel date numbers
  if (typeof value === 'number') {
    return new Date(Math.round((value - 25569) * 86400 * 1000))
  }
  
  // Handle string dates
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'yes' || 
           value.toLowerCase() === 'true' || 
           value.toLowerCase() === 'y'
  }
  return false
}

export async function readExcelFile(file: File): Promise<Candidate[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        
        const candidates: Candidate[] = jsonData.map((row: any) => ({
          id: String(row.ID || Math.random().toString(36).substr(2, 9)),
          name: row.Name || row['Full Name'] || '',
          email: row.Email || '',
          phone: row.Phone || row['Phone Number'] || '',
          stream: row.Stream || '',
          needsAssessment: parseBoolean(row['Needs Assessment']),
          license: row.License || '',
          location: row.Location || '',
          lastTouch: parseDate(row['Last Touch']),
          nextContact: parseDate(row['Next Contact']),
          status: row.Status || 'Pending',
          notes: row.Notes || '',
          isEmployed: parseBoolean(row['Employed'] || row['Got Job']),
          payStubs: row['Employed'] || row['Got Job'] ? {
            firstPayStub: parseDate(row['First Pay Stub'] || row['M']),
            secondPayStub: parseDate(row['Second Pay Stub'] || row['N']),
            thirdPayStub: parseDate(row['Third Pay Stub'] || row['O']),
            fourthPayStub: parseDate(row['Fourth Pay Stub'] || row['P']),
            fifthPayStub: parseDate(row['Fifth Pay Stub'] || row['Q']),
          } : undefined
        }))
        
        resolve(candidates)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

export function exportToExcel(candidates: Candidate[]) {
  const worksheet = XLSX.utils.json_to_sheet(
    candidates.map(c => ({
      ID: c.id,
      Name: c.name,
      Email: c.email,
      Phone: c.phone,
      Stream: c.stream,
      'Needs Assessment': c.needsAssessment ? 'Yes' : 'No',
      License: c.license,
      Location: c.location,
      'Last Touch': c.lastTouch ? c.lastTouch.toISOString().split('T')[0] : '',
      'Next Contact': c.nextContact ? c.nextContact.toISOString().split('T')[0] : '',
      Status: c.status,
      Notes: c.notes,
      Employed: c.isEmployed ? 'Yes' : 'No',
      'First Pay Stub': c.payStubs?.firstPayStub ? c.payStubs.firstPayStub.toISOString().split('T')[0] : '',
      'Second Pay Stub': c.payStubs?.secondPayStub ? c.payStubs.secondPayStub.toISOString().split('T')[0] : '',
      'Third Pay Stub': c.payStubs?.thirdPayStub ? c.payStubs.thirdPayStub.toISOString().split('T')[0] : '',
      'Fourth Pay Stub': c.payStubs?.fourthPayStub ? c.payStubs.fourthPayStub.toISOString().split('T')[0] : '',
      'Fifth Pay Stub': c.payStubs?.fifthPayStub ? c.payStubs.fifthPayStub.toISOString().split('T')[0] : '',
    }))
  )
  
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates')
  XLSX.writeFile(workbook, 'candidates.xlsx')
} 