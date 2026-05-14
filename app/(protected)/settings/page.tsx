'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { getCompanySettings } from '@/lib/actions/settings'
import { CompanyProfileSection } from '@/components/settings/CompanyProfileSection'
import { ComplianceSection } from '@/components/settings/ComplianceSection'
import { NotificationsSection } from '@/components/settings/NotificationsSection'
import { BillingSection } from '@/components/settings/BillingSection'
import { DangerZoneSection } from '@/components/settings/DangerZoneSection'

// ─────────────────────────────────────────────────────────
// Tab config
// ─────────────────────────────────────────────────────────

type Tab = 'profile' | 'compliance' | 'notifications' | 'billing' | 'danger'

type TabConfig = { id: Tab; label: string; iconPath: string; danger?: boolean }

const TABS: TabConfig[] = [
  {
    id: 'profile',
    label: 'Company Profile',
    iconPath:
      'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    iconPath:
      'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    iconPath:
      'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  },
  {
    id: 'billing',
    label: 'Billing',
    iconPath:
      'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    iconPath:
      'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    danger: true,
  },
]

const ICON_USERS =
  'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'

function TabIcon({ path }: { path: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4 flex-shrink-0"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

type CompanyData = Awaited<ReturnType<typeof getCompanySettings>>

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [company, setCompany]     = useState<CompanyData>(null)
  const [loading, setLoading]     = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const data = await getCompanySettings()
      setCompany(data)
    } catch { /* sections handle null gracefully */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  return (
    <PageWrapper>
      {/* Page heading */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-soft-text">Settings</h2>
        <p className="mt-0.5 text-sm text-soft-muted">
          Manage your company profile, compliance, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Left: tab navigation */}
        <div className="lg:sticky lg:top-4">
          <div className="rounded-card bg-white p-2 shadow-soft">
            <nav className="flex flex-col gap-0.5">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={
                    activeTab === tab.id
                      ? { boxShadow: '0 4px 6px rgba(249,115,22,0.3)' }
                      : undefined
                  }
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-gradient-orange text-white'
                      : tab.danger
                        ? 'text-red-500 hover:bg-gray-50'
                        : 'text-soft-muted hover:bg-gray-50',
                  )}
                >
                  <TabIcon path={tab.iconPath} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Team management link */}
            <div className="mt-3 border-t border-gray-100 pt-3">
              <Link
                href="/team"
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 transition-colors hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4 flex-shrink-0 text-soft-muted"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={ICON_USERS} />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-soft-muted">Team Management</p>
                  <p className="text-xs text-soft-muted">Manage team members</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: active section */}
        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <CompanyProfileSection company={company} loading={loading} onSaved={loadSettings} />
          )}
          {activeTab === 'compliance' && (
            <ComplianceSection company={company} loading={loading} onSaved={loadSettings} />
          )}
          {activeTab === 'notifications' && <NotificationsSection />}
          {activeTab === 'billing' && <BillingSection />}
          {activeTab === 'danger' && <DangerZoneSection />}
        </div>
      </div>
    </PageWrapper>
  )
}
