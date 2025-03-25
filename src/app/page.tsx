import { Metadata } from 'next'
import Dashboard from '../components/Dashboard'

export const metadata: Metadata = {
  title: 'Candidate Follow-up Dashboard',
  description: 'Track and manage candidate follow-ups efficiently',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Candidate Follow-up Dashboard
        </h1>
        <Dashboard />
      </div>
    </main>
  )
} 