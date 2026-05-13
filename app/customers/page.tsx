import type { Metadata } from 'next'
import { PageWrapper, PageHeader } from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Customers' }

export default function CustomersPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Customers"
        description="View and manage your customer accounts."
        action={<Button size="sm">+ Add Customer</Button>}
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
        Customer list coming soon
      </div>
    </PageWrapper>
  )
}
