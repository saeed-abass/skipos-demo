'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { PageWrapper } from '@/components/layout/page-wrapper'
import {
  getSkips,
  getFleetStats,
  type SkipRow,
  type FleetStats,
} from '@/lib/actions/fleet'
import { FleetFilters, type FleetFilterState } from '@/components/fleet/FleetFilters'
import { FleetGrid } from '@/components/fleet/FleetGrid'
import { AddSkipModal } from '@/components/fleet/AddSkipModal'
import { SkipDetailPanel } from '@/components/fleet/SkipDetailPanel'
import { useToast } from '@/components/ui/toast'
import type { SkipSize, SkipStatus, Condition } from '@/types'

const VIEW_KEY = 'skipos_fleet_view'

// ─────────────────────────────────────────────────────────
// Stats card
// ─────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  gradient,
  iconPath,
  pillClass,
}: {
  value: number
  label: string
  gradient: string
  iconPath: string
  pillClass: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-card bg-white p-4 shadow-soft">
      <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-btn', gradient)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <div>
        <p className="text-xl font-bold text-soft-text">{value}</p>
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold', pillClass)}>
          {label}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Grid / list toggle icons
// ─────────────────────────────────────────────────────────

function GridIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

const INITIAL_FILTERS: FleetFilterState = { status: '', size: '', condition: '', search: '' }

const EMPTY_STATS: FleetStats = {
  total: 0, inYard: 0, onSite: 0, atTip: 0,
  goodCondition: 0, fairCondition: 0, poorCondition: 0,
}

export default function FleetPage() {
  const { showToast } = useToast()

  const [skips, setSkips]         = useState<SkipRow[]>([])
  const [stats, setStats]         = useState<FleetStats>(EMPTY_STATS)
  const [loading, setLoading]     = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filters, setFilters]     = useState<FleetFilterState>(INITIAL_FILTERS)
  const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid')

  // Detail panel
  const [showPanel, setShowPanel]   = useState(false)
  const [selectedSkip, setSelectedSkip] = useState<SkipRow | null>(null)
  const [panelEditMode, setPanelEditMode] = useState(false)

  // Load view preference from localStorage (after mount to avoid hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY)
      if (saved === 'list' || saved === 'grid') setViewMode(saved)
    } catch { /* ignore */ }
  }, [])

  function setView(mode: 'grid' | 'list') {
    setViewMode(mode)
    try { localStorage.setItem(VIEW_KEY, mode) } catch { /* ignore */ }
  }

  const loadFleet = useCallback(async () => {
    setLoading(true)
    try {
      const [data, fleetStats] = await Promise.all([
        getSkips({
          status:    (filters.status    as SkipStatus)  || undefined,
          size:      (filters.size      as SkipSize)    || undefined,
          condition: (filters.condition as Condition)   || undefined,
          search:    filters.search || undefined,
        }),
        getFleetStats(),
      ])
      setSkips(data)
      setStats(fleetStats)
    } catch {
      showToast({ type: 'error', title: 'Load failed', message: 'Could not load fleet data' })
    } finally {
      setLoading(false)
    }
  }, [filters, showToast])

  useEffect(() => { loadFleet() }, [loadFleet])

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setFilters(prev => ({ ...prev, search: searchInput })), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  function handleFilterChange(next: FleetFilterState) {
    setSearchInput(next.search)
    setFilters(next)
  }

  function openPanel(skip: SkipRow, editMode = false) {
    setSelectedSkip(skip)
    setShowPanel(true)
    setPanelEditMode(editMode)
  }

  function closePanel() {
    setShowPanel(false)
    setSelectedSkip(null)
    setPanelEditMode(false)
  }

  async function handleUpdated() {
    await loadFleet()
    // Refresh the selected skip from the reloaded list
    if (selectedSkip) {
      const refreshed = skips.find(s => s.id === selectedSkip.id)
      if (refreshed) setSelectedSkip(refreshed)
    }
  }

  function handleDeleted() {
    closePanel()
    loadFleet()
  }

  const filtersActive = !!(filters.status || filters.size || filters.condition || filters.search)

  return (
    <PageWrapper>

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-soft-text">Fleet</h2>
          <p className="mt-0.5 text-sm text-soft-muted">
            {loading ? (
              <span className="inline-block h-4 w-20 animate-pulse rounded bg-gray-200" />
            ) : (
              `${stats.total} skip${stats.total !== 1 ? 's' : ''} total`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-btn border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setView('grid')}
              title="Grid view"
              className={cn(
                'flex items-center justify-center rounded-btn p-1.5 transition-colors',
                viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-soft-muted hover:bg-gray-100',
              )}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setView('list')}
              title="List view"
              className={cn(
                'flex items-center justify-center rounded-btn p-1.5 transition-colors',
                viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-soft-muted hover:bg-gray-100',
              )}
            >
              <ListIcon />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
          >
            + Add Skip
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          value={stats.total}
          label="Total Skips"
          gradient="bg-gradient-navy"
          pillClass="bg-navy/10 text-navy"
          iconPath="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
        />
        <StatCard
          value={stats.inYard}
          label="In Yard"
          gradient="bg-gray-400"
          pillClass="bg-gray-100 text-gray-600"
          iconPath="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
        <StatCard
          value={stats.onSite}
          label="On Site"
          gradient="bg-gradient-orange"
          pillClass="bg-orange-100 text-orange-700"
          iconPath="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
        />
        <StatCard
          value={stats.atTip}
          label="At Tip"
          gradient="bg-gradient-info"
          pillClass="bg-blue-100 text-blue-700"
          iconPath="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
        />
      </div>

      {/* Filters */}
      <FleetFilters
        filters={{ ...filters, search: searchInput }}
        onChange={handleFilterChange}
      />

      {/* Grid / list + detail panel */}
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <FleetGrid
            skips={skips}
            loading={loading}
            viewMode={viewMode}
            selectedId={selectedSkip?.id ?? null}
            filtersActive={filtersActive}
            onSelect={skip => { openPanel(skip); }}
            onEdit={skip => openPanel(skip, true)}
            onStatusChanged={loadFleet}
            onDeleted={handleDeleted}
            onNew={() => setShowAddModal(true)}
            onClearFilters={() => handleFilterChange(INITIAL_FILTERS)}
          />
        </div>

        {/* Mobile overlay panel */}
        {showPanel && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
            <div className="absolute inset-x-0 bottom-0 top-14 overflow-hidden rounded-t-2xl bg-white shadow-soft-md">
              <SkipDetailPanel
                skip={selectedSkip}
                onClose={closePanel}
                onUpdated={handleUpdated}
              />
            </div>
          </div>
        )}

        {/* Desktop slide-in panel */}
        <div className={cn(
          'hidden flex-shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out lg:block',
          showPanel ? 'w-[360px] opacity-100' : 'w-0 opacity-0 pointer-events-none',
        )}>
          <div className="w-[360px]">
            <SkipDetailPanel
              skip={selectedSkip}
              onClose={closePanel}
              onUpdated={handleUpdated}
            />
          </div>
        </div>
      </div>

      {/* Add skip modal */}
      <AddSkipModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false)
          loadFleet()
        }}
      />

    </PageWrapper>
  )
}
