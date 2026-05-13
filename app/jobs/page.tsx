import type { Metadata } from 'next'
import { PageWrapper, PageHeader } from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Jobs' }

export default function JobsPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Jobs"
        description="Manage deliveries, collections, exchanges and wait-and-load jobs."
        action={<Button size="sm">+ New Job</Button>}
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
        Jobs table coming soon
      </div>
    </PageWrapper>
  )
}
