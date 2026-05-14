'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { getWTNs, getWTNById, updateWTNStatus, type WTNRow, type WTNDetail } from '@/lib/actions/wtns'
import { WTNFilters, type WTNFilterState } from '@/components/wtns/WTNFilters'
import { WTNsTable } from '@/components/wtns/WTNsTable'
import { NewWTNModal } from '@/components/wtns/NewWTNModal'
import { WTNDetailPanel } from '@/components/wtns/WTNDetailPanel'
import { useToast } from '@/components/ui/toast'
import type { WTNStatus } from '@/types'

// ─────────────────────────────────────────────────────────
// Compliance banner
// ─────────────────────────────────────────────────────────

function ComplianceBanner() {
  const target = new Date('2026-10-01')
  const today  = new Date()
  const days   = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const pastDue = days < 0

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor"
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-800">DEFRA Digital Waste Tracking Mandate</p>
          <p className="mt-0.5 text-xs text-amber-700">
            EA-registered carriers must submit Waste Transfer Notes digitally from October 2026.
            Ensure your EA registration number is configured in Settings.
          </p>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <span className={cn(
          'rounded-full px-3 py-1 text-xs font-bold',
          pastDue
            ? 'bg-red-100 text-red-800'
            : 'bg-amber-100 text-amber-800'
        )}>
          {pastDue ? 'Past due!' : `${days} days remaining`}
        </span>
        <Link
          href="/settings"
          className="rounded-btn border border-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
        >
          Configure Settings
        </Link>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

const INITIAL_FILTERS: WTNFilterState = {
  status: '', search: '', dateFrom: '', dateTo: '',
}

export default function WTNsPage() {
  const { showToast } = useToast()

  const [wtns, setWTNs]          = useState<WTNRow[]>([])
  const [loading, setLoading]    = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [filters, setFilters]    = useState<WTNFilterState>(INITIAL_FILTERS)

  // Detail panel
  const [showPanel, setShowPanel]             = useState(false)
  const [selectedWTN, setSelectedWTN]         = useState<WTNDetail | null>(null)
  const [selectedId, setSelectedId]           = useState<string | null>(null)

  const loadWTNs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWTNs({
        status:   (filters.status as WTNStatus) || undefined,
        search:   filters.search   || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo:   filters.dateTo   || undefined,
      })
      setWTNs(data)
    } catch {
      showToast({ type: 'error', title: 'Load failed', message: 'Could not load WTNs' })
    } finally {
      setLoading(false)
    }
  }, [filters, showToast])

  useEffect(() => { loadWTNs() }, [loadWTNs])

  async function openPanel(wtn: WTNRow) {
    setSelectedId(wtn.id)
    setShowPanel(true)
    setSelectedWTN(null)
    const detail = await getWTNById(wtn.id)
    setSelectedWTN(detail)
  }

  function closePanel() {
    setShowPanel(false)
    setSelectedId(null)
    setSelectedWTN(null)
  }

  async function handleStatusChange(status: WTNStatus) {
    if (!selectedId) return
    try {
      await updateWTNStatus(selectedId, status)
      showToast({ type: 'success', title: 'Status updated' })
      await loadWTNs()
      // Refresh detail panel
      const detail = await getWTNById(selectedId)
      setSelectedWTN(detail)
    } catch {
      showToast({ type: 'error', title: 'Update failed', message: 'Could not update WTN status' })
    }
  }

  async function handleTableStatusChange(id: string, status: WTNStatus) {
    try {
      await updateWTNStatus(id, status)
      showToast({ type: 'success', title: 'Status updated' })
      await loadWTNs()
      if (selectedId === id) {
        const detail = await getWTNById(id)
        setSelectedWTN(detail)
      }
    } catch {
      showToast({ type: 'error', title: 'Update failed', message: 'Could not update WTN status' })
    }
  }

  return (
    <PageWrapper>
      <ComplianceBanner />

      {/* Page header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-soft-text">Waste Transfer Notes</h2>
          <p className="mt-0.5 text-sm text-soft-muted">
            {loading ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" />
            ) : (
              `${wtns.length} WTN${wtns.length !== 1 ? 's' : ''} total`
            )}
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
        >
          + New WTN
        </button>
      </div>

      {/* Filters */}
      <WTNFilters
        filters={filters}
        onChange={setFilters}
        totalResults={wtns.length}
      />

      {/* Table + panel */}
      <div className="mt-4 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <WTNsTable
            wtns={wtns}
            loading={loading}
            onNew={() => setShowNewModal(true)}
            onRowClick={openPanel}
            onStatusChange={handleTableStatusChange}
          />
        </div>

        {/* Mobile overlay panel */}
        {showPanel && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
            <div className="absolute inset-x-0 bottom-0 top-14 overflow-hidden rounded-t-2xl bg-white shadow-soft-md">
              <WTNDetailPanel
                wtn={selectedWTN}
                onClose={closePanel}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        )}

        {/* Desktop slide-in panel */}
        <div className={cn(
          'hidden flex-shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out lg:block',
          showPanel ? 'w-[400px] opacity-100' : 'w-0 opacity-0 pointer-events-none'
        )}>
          <div className="w-[400px]">
            <WTNDetailPanel
              wtn={selectedWTN}
              onClose={closePanel}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      {/* New WTN modal */}
      <NewWTNModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={() => {
          setShowNewModal(false)
          loadWTNs()
        }}
      />
    </PageWrapper>
  )
}
