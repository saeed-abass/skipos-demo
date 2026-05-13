import type { Metadata } from 'next'
import { PageWrapper, PageHeader } from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Fleet' }

export default function FleetPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Fleet"
        description="Track your skip inventory — in yard, on site, and at tip."
        action={<Button size="sm">+ Add Skip</Button>}
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
        Skip inventory coming soon
      </div>
    </PageWrapper>
  )
}
