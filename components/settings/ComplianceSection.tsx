'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { updateEARegistration } from '@/lib/actions/settings'
import type { Company } from '@/types'

const SITES_KEY = 'skipos_disposal_sites'

interface Props {
  company: Company | null
  loading: boolean
  onSaved: () => void
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function ComplianceSection({ company, loading: _loading, onSaved }: Props) {
  const { showToast } = useToast()

  const [eaReg, setEaReg]     = useState('')
  const [savingEa, setSavingEa] = useState(false)
  const [sites, setSites]     = useState<string[]>([])
  const [newSite, setNewSite] = useState('')

  useEffect(() => {
    if (company?.ea_registration) setEaReg(company.ea_registration)
  }, [company])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SITES_KEY)
      if (stored) setSites(JSON.parse(stored) as string[])
    } catch { /* ignore */ }
  }, [])

  function saveSitesToStorage(updated: string[]) {
    setSites(updated)
    localStorage.setItem(SITES_KEY, JSON.stringify(updated))
  }

  async function handleSaveEA() {
    setSavingEa(true)
    try {
      await updateEARegistration({ ea_registration: eaReg.trim() || null })
      showToast({ type: 'success', title: 'EA registration saved' })
      onSaved()
    } catch {
      showToast({ type: 'error', title: 'Save failed', message: 'Could not save EA registration' })
    } finally {
      setSavingEa(false)
    }
  }

  function addSite() {
    const trimmed = newSite.trim()
    if (!trimmed) return
    saveSitesToStorage([...sites, trimmed])
    setNewSite('')
  }

  function removeSite(index: number) {
    saveSitesToStorage(sites.filter((_, i) => i !== index))
  }

  const target  = new Date('2026-10-01')
  const today   = new Date()
  const days    = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const pastDue = days < 0

  const isConfigured = !!(company?.ea_registration)

  return (
    <div className="rounded-card bg-white p-6 shadow-soft">
      {/* Header */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-soft-text">Compliance Settings</h3>
        <p className="mt-1 text-sm text-soft-muted">
          Environment Agency registration and waste tracking configuration
        </p>
      </div>

      {/* DEFRA mandate status */}
      <div className="mb-6 rounded-card border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">DEFRA Digital Waste Tracking</p>
            <div className="mt-1">
              <span className={cn(
                'rounded-full px-3 py-1 text-xs font-bold',
                pastDue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800',
              )}>
                {pastDue ? 'Past due!' : `${days} days remaining`}
              </span>
            </div>
            <p className="mt-1 text-xs text-amber-700">Mandate effective: 1 October 2026</p>
          </div>
          <span className={cn(
            'flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold',
            isConfigured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
          )}>
            {isConfigured ? 'Configured' : 'Setup Required'}
          </span>
        </div>
      </div>

      {/* EA Registration */}
      <div className="mb-6">
        <h4 className="mb-1 text-sm font-semibold text-soft-text">EA Carrier Registration</h4>
        <p className="mb-4 text-xs text-soft-muted">
          Your Environment Agency waste carrier registration number. Required for digital WTN
          submission from October 2026.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={eaReg}
            onChange={e => setEaReg(e.target.value)}
            placeholder="e.g. CBDU12345"
            className="flex-1 rounded-btn border border-gray-200 px-3 py-2 text-sm text-soft-text placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors"
          />
          <button
            type="button"
            onClick={handleSaveEA}
            disabled={savingEa}
            className="inline-flex items-center gap-2 rounded-btn bg-gradient-orange px-6 py-2 text-sm font-bold text-white shadow-soft transition-all hover:shadow-md disabled:opacity-70"
          >
            {savingEa && <Spinner />}
            Save
          </button>
        </div>
        {isConfigured && (
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            EA registration configured
          </p>
        )}
      </div>

      {/* Disposal Sites */}
      <div>
        <h4 className="mb-1 text-sm font-semibold text-soft-text">Licensed Disposal Sites</h4>
        <p className="mb-4 text-xs text-soft-muted">
          Pre-configure your regular disposal sites to auto-fill WTNs faster.
        </p>

        {sites.length > 0 ? (
          <div className="mb-4 flex flex-col gap-2">
            {sites.map((site, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-btn border border-gray-100 bg-white p-3"
              >
                <span className="text-sm text-soft-text">{site}</span>
                <button
                  type="button"
                  onClick={() => removeSite(i)}
                  className="text-xs text-red-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-sm italic text-soft-muted">No disposal sites saved yet</p>
        )}

        <div className="flex gap-3">
          <input
            type="text"
            value={newSite}
            onChange={e => setNewSite(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSite() } }}
            placeholder="Site name and address"
            className="flex-1 rounded-btn border border-gray-200 px-3 py-2 text-sm text-soft-text placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors"
          />
          <button
            type="button"
            onClick={addSite}
            className="rounded-btn border border-gray-200 px-4 py-2 text-sm font-medium text-soft-text hover:bg-gray-50 transition-colors"
          >
            Add Site
          </button>
        </div>
      </div>
    </div>
  )
}
