'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

const PREFS_KEY = 'skipos_notification_prefs'

type Prefs = {
  jobStatusUpdates: boolean
  newJobAssigned: boolean
  wtnReminders: boolean
  complianceAlerts: boolean
  weeklySummary: boolean
  teamActivity: boolean
}

const DEFAULT_PREFS: Prefs = {
  jobStatusUpdates: true,
  newJobAssigned: true,
  wtnReminders: true,
  complianceAlerts: true,
  weeklySummary: false,
  teamActivity: false,
}

type NotifOption = { key: keyof Prefs; label: string; description: string }

const OPTIONS: NotifOption[] = [
  {
    key: 'jobStatusUpdates',
    label: 'Job Status Updates',
    description: 'Get notified when a job status changes',
  },
  {
    key: 'newJobAssigned',
    label: 'New Job Assigned',
    description: 'When a job is assigned to a team member',
  },
  {
    key: 'wtnReminders',
    label: 'WTN Reminders',
    description: 'Remind me to create WTNs for completed jobs',
  },
  {
    key: 'complianceAlerts',
    label: 'Compliance Deadline Alerts',
    description: 'Alerts as the DEFRA mandate deadline approaches',
  },
  {
    key: 'weeklySummary',
    label: 'Weekly Summary',
    description: 'A weekly overview of jobs, revenue and fleet',
  },
  {
    key: 'teamActivity',
    label: 'Team Activity',
    description: 'When team members join or update their details',
  },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
        checked ? 'bg-orange-500' : 'bg-gray-200',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export function NotificationsSection() {
  const { showToast } = useToast()
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY)
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...(JSON.parse(stored) as Partial<Prefs>) })
    } catch { /* ignore */ }
  }, [])

  function setKey(key: keyof Prefs, value: boolean) {
    setPrefs(p => ({ ...p, [key]: value }))
  }

  function handleSave() {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    showToast({ type: 'success', title: 'Notification preferences saved' })
  }

  return (
    <div className="rounded-card bg-white p-6 shadow-soft">
      {/* Header */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-soft-text">Notification Preferences</h3>
        <p className="mt-1 text-sm text-soft-muted">Control what alerts you receive and how</p>
      </div>

      {/* Toggle rows */}
      <div className="divide-y divide-gray-50">
        {OPTIONS.map(opt => (
          <div key={opt.key} className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-semibold text-soft-text">{opt.label}</p>
              <p className="mt-0.5 text-xs text-soft-muted">{opt.description}</p>
            </div>
            <Toggle checked={prefs[opt.key]} onChange={v => setKey(opt.key, v)} />
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-btn bg-gradient-orange px-5 py-2 text-sm font-bold text-white shadow-soft transition-all hover:shadow-md"
        >
          Save Preferences
        </button>
      </div>
    </div>
  )
}
