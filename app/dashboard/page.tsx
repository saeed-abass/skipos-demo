import type { Metadata } from 'next'
import { PageWrapper, PageHeader } from '@/components/layout/page-wrapper'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Dashboard"
        description="Overview of today's operations."
      />
      {/* Stats and activity panels will go here */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
        Dashboard widgets coming soon
      </div>
    </PageWrapper>
  )
}
