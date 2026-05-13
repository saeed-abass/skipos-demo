import type { Metadata } from 'next'
import { PageWrapper, PageHeader } from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Waste Transfer Notes' }

export default function WTNsPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Waste Transfer Notes"
        description="EA-compliant WTNs for every collection. Track draft, signed, and DEFRA submissions."
        action={<Button size="sm">+ New WTN</Button>}
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
        WTN list coming soon
      </div>
    </PageWrapper>
  )
}
