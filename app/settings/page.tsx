import type { Metadata } from 'next'
import { PageWrapper, PageHeader } from '@/components/layout/page-wrapper'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Settings"
        description="Manage your company profile, users, and integrations."
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
        Settings panels coming soon
      </div>
    </PageWrapper>
  )
}
