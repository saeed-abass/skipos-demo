import type { Metadata } from 'next'
import { PageWrapper, PageHeader } from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Drivers' }

export default function DriversPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Drivers"
        description="Manage your driver accounts and job assignments."
        action={<Button size="sm">+ Add Driver</Button>}
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
        Driver roster coming soon
      </div>
    </PageWrapper>
  )
}
