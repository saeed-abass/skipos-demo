'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { SkipStatusBadge } from './SkipStatusBadge'
import { updateSkipStatus, deleteSkip, type SkipRow } from '@/lib/actions/fleet'
import { useToast } from '@/components/ui/toast'
import { SKIP_SIZE_LABELS } from '@/types'
import type { SkipStatus } from '@/types'

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))
}

const CONDITION_DOT: Record<string, string> = {
  GOOD: 'bg-green-400',
  FAIR: 'bg-yellow-400',
  POOR: 'bg-red-400',
}

const SKIP_ICON_COLOR: Record<string, string> = {
  IN_YARD: 'text-gray-400',
  ON_SITE: 'text-orange-400',
  AT_TIP:  'text-blue-400',
}

const SIZE_NUMBER: Record<string, string> = {
  TWO_YARD: '2', FOUR_YARD: '4', SIX_YARD: '6', EIGHT_YARD: '8',
  TWELVE_YARD: '12', FOURTEEN_YARD: '14', SIXTEEN_YARD: '16', TWENTY_YARD: '20',
}

const STATUS_OPTIONS: { value: SkipStatus; label: string }[] = [
  { value: 'IN_YARD', label: 'In Yard' },
  { value: 'ON_SITE', label: 'On Site' },
  { value: 'AT_TIP',  label: 'At Tip'  },
]

function SkipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-12 w-12', className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5h15L18 20H6L4.5 7.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5V5.5M16.5 7.5V5.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 11.5h11M7 15h10" strokeOpacity="0.4" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// Three-dot menu for skip card
// ─────────────────────────────────────────────────────────

type MenuMode = 'menu' | 'status' | 'remove'

function SkipCardMenu({
  skip,
  onView,
  onEdit,
  onStatusChanged,
  onDeleted,
}: {
  skip: SkipRow
  onView: () => void
  onEdit: () => void
  onStatusChanged: () => void
  onDeleted: () => void
}) {
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<MenuMode>('menu')
  const [removing, setRemoving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setMode('menu')
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleStatusChange(status: SkipStatus) {
    if (status === skip.status) { setOpen(false); setMode('menu'); return }
    try {
      await updateSkipStatus(skip.id, status)
      showToast({ type: 'success', title: 'Status updated' })
      onStatusChanged()
    } catch {
      showToast({ type: 'error', title: 'Update failed' })
    }
    setOpen(false); setMode('menu')
  }

  async function handleDelete() {
    setRemoving(true)
    try {
      const result = await deleteSkip(skip.id)
      if (result?.error) {
        showToast({ type: 'error', title: 'Cannot remove', message: result.error })
      } else {
        showToast({ type: 'success', title: 'Skip removed' })
        onDeleted()
      }
    } catch {
      showToast({ type: 'error', title: 'Remove failed' })
    }
    setRemoving(false)
    setOpen(false); setMode('menu')
  }

  return (
    <div className="relative" ref={ref} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => { setOpen(p => !p); setMode('menu') }}
        className="flex h-7 w-7 items-center justify-center rounded-btn text-soft-muted hover:bg-gray-200 hover:text-soft-text transition-colors"
        aria-label="Actions"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4">
          <circle cx="12" cy="5"  r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20">
          {mode === 'menu' && (
            <div className="w-44 overflow-hidden rounded-btn border border-gray-200 bg-white shadow-soft-md">
              <button onClick={() => { setOpen(false); onView() }}
                className="flex w-full items-center px-3 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors">
                View details
              </button>
              <button onClick={() => setMode('status')}
                className="flex w-full items-center px-3 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors">
                Update status
              </button>
              <button onClick={() => { setOpen(false); onEdit() }}
                className="flex w-full items-center px-3 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors">
                Edit details
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button onClick={() => setMode('remove')}
                className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                Remove skip
              </button>
            </div>
          )}

          {mode === 'status' && (
            <div className="w-44 overflow-hidden rounded-btn border border-gray-200 bg-white shadow-soft-md">
              <p className="px-3 pb-1 pt-2 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
                Move to…
              </p>
              {STATUS_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => handleStatusChange(o.value)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                    skip.status === o.value
                      ? 'bg-orange-50 font-semibold text-orange-700'
                      : 'text-soft-text hover:bg-gray-50',
                  )}
                >
                  {skip.status === o.value && (
                    <svg className="h-3 w-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {o.label}
                </button>
              ))}
              <div className="my-1 border-t border-gray-100" />
              <button onClick={() => setMode('menu')}
                className="flex w-full items-center px-3 py-2 text-xs text-soft-muted hover:bg-gray-50 transition-colors">
                ← Back
              </button>
            </div>
          )}

          {mode === 'remove' && (
            <div className="w-56 rounded-btn border border-gray-200 bg-white p-4 shadow-soft-md">
              <p className="text-sm font-semibold text-soft-text">Remove this skip?</p>
              <p className="mt-1 text-xs text-soft-muted">
                Only skips that are in yard can be removed.
              </p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setMode('menu')}
                  className="flex-1 rounded-btn border border-gray-200 py-1.5 text-xs font-semibold text-soft-text hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={removing}
                  className="flex-1 rounded-btn bg-red-500 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-all">
                  {removing ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Skip card (grid view)
// ─────────────────────────────────────────────────────────

function SkipCard({
  skip,
  selected,
  onSelect,
  onEdit,
  onStatusChanged,
  onDeleted,
}: {
  skip: SkipRow
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onStatusChanged: () => void
  onDeleted: () => void
}) {
  const sizeNum = SIZE_NUMBER[skip.size] ?? '?'

  return (
    <div
      onClick={onSelect}
      className={cn(
        'cursor-pointer rounded-card bg-white p-4 shadow-soft transition-all hover:shadow-soft-md',
        selected && 'border-2 border-orange-400',
        !selected && 'border-2 border-transparent',
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <SkipStatusBadge status={skip.status as SkipStatus} />
        <span
          title={`Condition: ${skip.condition}`}
          className={cn('h-2.5 w-2.5 rounded-full', CONDITION_DOT[skip.condition] ?? 'bg-gray-300')}
        />
      </div>

      {/* Illustration */}
      <div className="my-3 flex flex-col items-center justify-center rounded-lg bg-soft-bg p-4">
        <p className="text-3xl font-black leading-none text-navy/20">{sizeNum} YARD</p>
        <SkipIcon className={cn('mt-2', SKIP_ICON_COLOR[skip.status] ?? 'text-gray-400')} />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <span className={cn('font-mono text-xs', skip.skip_number ? 'text-soft-muted' : 'italic text-soft-muted')}>
          {skip.skip_number || 'No serial'}
        </span>
        <SkipCardMenu
          skip={skip}
          onView={onSelect}
          onEdit={onEdit}
          onStatusChanged={onStatusChanged}
          onDeleted={onDeleted}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Skeleton cards
// ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-card border-2 border-transparent bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
        <div className="h-2.5 w-2.5 rounded-full bg-gray-100" />
      </div>
      <div className="my-3 flex flex-col items-center justify-center rounded-lg bg-gray-50 p-4 gap-3">
        <div className="h-8 w-20 rounded bg-gray-100" />
        <div className="h-12 w-12 rounded bg-gray-100" />
      </div>
      <div className="h-3 w-16 rounded bg-gray-100" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// List view row
// ─────────────────────────────────────────────────────────

function ListRow({
  skip,
  selected,
  onSelect,
  onEdit,
  onStatusChanged,
  onDeleted,
}: {
  skip: SkipRow
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onStatusChanged: () => void
  onDeleted: () => void
}) {
  return (
    <tr
      onClick={onSelect}
      className={cn(
        'cursor-pointer border-t border-gray-100 transition-colors hover:bg-gray-50/60',
        selected && 'bg-orange-50/30',
      )}
    >
      <td className="px-4 py-3 font-mono text-xs text-soft-muted">{skip.skip_number}</td>
      <td className="px-4 py-3 text-sm font-semibold text-soft-text">
        {SKIP_SIZE_LABELS[skip.size as keyof typeof SKIP_SIZE_LABELS] ?? skip.size}
      </td>
      <td className="px-4 py-3">
        <SkipStatusBadge status={skip.status as SkipStatus} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full', CONDITION_DOT[skip.condition] ?? 'bg-gray-300')} />
          <span className="text-sm text-soft-muted capitalize">{skip.condition.toLowerCase()}</span>
        </div>
      </td>
      <td className="max-w-[160px] truncate px-4 py-3 text-sm text-soft-muted">
        {skip.notes || <span className="italic">—</span>}
      </td>
      <td className="px-4 py-3 text-sm text-soft-muted">{fmtDate(skip.created_at)}</td>
      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
        <SkipCardMenu
          skip={skip}
          onView={onSelect}
          onEdit={onEdit}
          onStatusChanged={onStatusChanged}
          onDeleted={onDeleted}
        />
      </td>
    </tr>
  )
}

// ─────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────

function EmptyState({
  filtersActive,
  onNew,
  onClear,
}: {
  filtersActive: boolean
  onNew: () => void
  onClear: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <SkipIcon className="h-16 w-16 text-gray-300" />
      {filtersActive ? (
        <>
          <p className="text-sm font-semibold text-soft-text">No skips match your filters</p>
          <button
            onClick={onClear}
            className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-soft-text">No skips in your fleet</p>
          <p className="text-xs text-soft-muted">
            Add your first skip to start tracking your yard inventory
          </p>
          <button
            onClick={onNew}
            className="mt-1 inline-flex items-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
          >
            + Add Skip
          </button>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────

interface FleetGridProps {
  skips: SkipRow[]
  loading: boolean
  viewMode: 'grid' | 'list'
  selectedId: string | null
  filtersActive: boolean
  onSelect: (skip: SkipRow) => void
  onEdit: (skip: SkipRow) => void
  onStatusChanged: () => void
  onDeleted: () => void
  onNew: () => void
  onClearFilters: () => void
}

export function FleetGrid({
  skips,
  loading,
  viewMode,
  selectedId,
  filtersActive,
  onSelect,
  onEdit,
  onStatusChanged,
  onDeleted,
  onNew,
  onClearFilters,
}: FleetGridProps) {

  if (viewMode === 'grid') {
    return (
      <div className="overflow-hidden rounded-card bg-white shadow-soft">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : skips.length === 0 ? (
          <EmptyState filtersActive={filtersActive} onNew={onNew} onClear={onClearFilters} />
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {skips.map(skip => (
              <SkipCard
                key={skip.id}
                skip={skip}
                selected={selectedId === skip.id}
                onSelect={() => onSelect(skip)}
                onEdit={() => onEdit(skip)}
                onStatusChanged={onStatusChanged}
                onDeleted={onDeleted}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // List view
  return (
    <div className="overflow-hidden rounded-card bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Serial', 'Size', 'Status', 'Condition', 'Notes', 'Added', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse border-t border-gray-100">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 w-16 rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : skips.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4">
                  <EmptyState filtersActive={filtersActive} onNew={onNew} onClear={onClearFilters} />
                </td>
              </tr>
            ) : (
              skips.map(skip => (
                <ListRow
                  key={skip.id}
                  skip={skip}
                  selected={selectedId === skip.id}
                  onSelect={() => onSelect(skip)}
                  onEdit={() => onEdit(skip)}
                  onStatusChanged={onStatusChanged}
                  onDeleted={onDeleted}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && skips.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 text-xs text-soft-muted">
          {skips.length} skip{skips.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
