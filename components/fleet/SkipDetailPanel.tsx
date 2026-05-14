'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SkipStatusBadge } from './SkipStatusBadge'
import {
  updateSkipStatus,
  updateSkipCondition,
  updateSkipDetails,
  type SkipRow,
} from '@/lib/actions/fleet'
import { useToast } from '@/components/ui/toast'
import { SKIP_SIZE_LABELS } from '@/types'
import type { SkipStatus, Condition } from '@/types'

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

const CONDITION_LABEL: Record<string, string> = {
  GOOD: 'Good', FAIR: 'Fair', POOR: 'Poor',
}

const STATUS_ACTIVE: Record<string, string> = {
  IN_YARD: 'bg-gray-200 text-gray-700 font-semibold',
  ON_SITE: 'bg-gradient-orange text-white font-semibold',
  AT_TIP:  'bg-gradient-info text-white font-semibold',
}

const STATUS_INACTIVE =
  'border border-gray-200 text-soft-muted hover:bg-gray-50 transition-colors'

const STATUS_OPTIONS: { value: SkipStatus; label: string }[] = [
  { value: 'IN_YARD', label: 'In Yard' },
  { value: 'ON_SITE', label: 'On Site' },
  { value: 'AT_TIP',  label: 'At Tip'  },
]

const CONDITION_OPTIONS: { value: Condition; label: string }[] = [
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
]

// ─────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-5">
      <div className="space-y-2">
        <div className="h-5 w-32 rounded bg-gray-100" />
        <div className="h-3 w-20 rounded bg-gray-100" />
      </div>
      <div className="h-10 rounded-btn bg-gray-100" />
      <div className="space-y-2 pt-2">
        {[80, 60, 90, 50].map((w, i) => (
          <div key={i} className="h-3 rounded bg-gray-100" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Panel
// ─────────────────────────────────────────────────────────

interface SkipDetailPanelProps {
  skip: SkipRow | null
  onClose: () => void
  onUpdated: () => void
}

export function SkipDetailPanel({ skip, onClose, onUpdated }: SkipDetailPanelProps) {
  const { showToast } = useToast()

  const [pendingStatus, setPendingStatus] = useState<SkipStatus | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [editMode, setEditMode] = useState(false)
  const [editSerial, setEditSerial] = useState('')
  const [editCondition, setEditCondition] = useState<Condition>('GOOD')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  function startEdit() {
    if (!skip) return
    setEditSerial(skip.skip_number)
    setEditCondition(skip.condition as Condition)
    setEditNotes(skip.notes ?? '')
    setEditMode(true)
    setPendingStatus(null)
  }

  function cancelEdit() {
    setEditMode(false)
  }

  async function saveEdit() {
    if (!skip) return
    setSaving(true)
    try {
      await updateSkipDetails(skip.id, {
        serialNumber: editSerial,
        condition: editCondition,
        notes: editNotes,
      })
      showToast({ type: 'success', title: 'Skip updated' })
      onUpdated()
      setEditMode(false)
    } catch {
      showToast({ type: 'error', title: 'Update failed', message: 'Could not save changes' })
    }
    setSaving(false)
  }

  async function confirmStatusChange() {
    if (!skip || !pendingStatus) return
    setUpdatingStatus(true)
    try {
      await updateSkipStatus(skip.id, pendingStatus)
      showToast({ type: 'success', title: 'Status updated' })
      onUpdated()
    } catch {
      showToast({ type: 'error', title: 'Update failed' })
    }
    setUpdatingStatus(false)
    setPendingStatus(null)
  }

  async function handleConditionChange(condition: Condition) {
    if (!skip || condition === skip.condition) return
    try {
      await updateSkipCondition(skip.id, condition)
      showToast({ type: 'success', title: 'Condition updated' })
      onUpdated()
    } catch {
      showToast({ type: 'error', title: 'Update failed' })
    }
  }

  const sizeLabel = skip
    ? SKIP_SIZE_LABELS[skip.size as keyof typeof SKIP_SIZE_LABELS] ?? skip.size
    : ''

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card bg-white shadow-soft">

      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-5">
        {!skip ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-soft-text">{sizeLabel} Skip</h3>
              <div className="mt-1 flex items-center gap-2">
                <SkipStatusBadge status={skip.status as SkipStatus} />
                <span
                  title={`Condition: ${CONDITION_LABEL[skip.condition] ?? skip.condition}`}
                  className={cn(
                    'inline-block h-2.5 w-2.5 rounded-full',
                    CONDITION_DOT[skip.condition] ?? 'bg-gray-300',
                  )}
                />
              </div>
              <p className="mt-1 font-mono text-xs text-soft-muted">{skip.skip_number}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {!editMode && (
                <button
                  onClick={startEdit}
                  title="Edit details"
                  className="flex h-7 w-7 items-center justify-center rounded-btn text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-btn text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {skip && (
        <div className="flex-1 overflow-y-auto">

          {/* Section 1 — Status */}
          <div className="border-t border-gray-100 p-5">
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
              Location
            </p>

            {pendingStatus ? (
              <div className="space-y-3 rounded-btn border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm font-semibold text-soft-text">
                  Move this skip to{' '}
                  <span className="text-orange-600">
                    {STATUS_OPTIONS.find(o => o.value === pendingStatus)?.label}
                  </span>
                  ?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPendingStatus(null)}
                    className="flex-1 rounded-btn border border-gray-200 py-1.5 text-xs font-semibold text-soft-text hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusChange}
                    disabled={updatingStatus}
                    className="flex-1 rounded-btn bg-gradient-orange py-1.5 text-xs font-semibold text-white disabled:opacity-60 transition-all"
                  >
                    {updatingStatus ? 'Moving…' : 'Confirm'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => {
                      if (o.value !== skip.status) setPendingStatus(o.value)
                    }}
                    className={cn(
                      'flex-1 rounded-btn px-2 py-1.5 text-xs transition-all',
                      skip.status === o.value
                        ? STATUS_ACTIVE[o.value]
                        : STATUS_INACTIVE,
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 2 — Details */}
          <div className="border-t border-gray-100 p-5">
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
              Details
            </p>

            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-soft-muted">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={editSerial}
                    onChange={e => setEditSerial(e.target.value)}
                    className="w-full rounded-btn border border-gray-200 px-3 py-2 text-sm text-soft-text focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-soft-muted">
                    Condition
                  </label>
                  <div className="flex gap-2">
                    {CONDITION_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => setEditCondition(o.value)}
                        className={cn(
                          'flex-1 rounded-btn border-2 py-1.5 text-xs font-semibold transition-all',
                          editCondition === o.value
                            ? o.value === 'GOOD' ? 'border-green-400 bg-green-50 text-green-700'
                              : o.value === 'FAIR' ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                              : 'border-red-400 bg-red-50 text-red-700'
                            : 'border-gray-200 text-soft-muted hover:border-gray-300',
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-soft-muted">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    className="w-full resize-none rounded-btn border border-gray-200 px-3 py-2 text-sm text-soft-text focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={cancelEdit}
                    className="flex-1 rounded-btn border border-gray-200 py-2 text-xs font-semibold text-soft-text hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex-1 rounded-btn bg-gradient-orange py-2 text-xs font-semibold text-white disabled:opacity-60 transition-all"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {[
                    { label: 'Size',    value: sizeLabel },
                    { label: 'Serial',  value: skip.skip_number },
                    { label: 'Added',   value: fmtDate(skip.created_at) },
                    { label: 'Updated', value: fmtDate(skip.updated_at) },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-soft-muted">{row.label}</span>
                      <span className="text-right text-xs font-semibold text-soft-text">
                        {row.value}
                      </span>
                    </div>
                  ))}
                  {/* Condition row with inline buttons */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-soft-muted">Condition</span>
                    <div className="flex items-center gap-1">
                      {CONDITION_OPTIONS.map(o => (
                        <button
                          key={o.value}
                          onClick={() => handleConditionChange(o.value)}
                          title={o.label}
                          className={cn(
                            'h-6 rounded-full px-2 text-[0.6rem] font-semibold transition-all',
                            skip.condition === o.value
                              ? o.value === 'GOOD' ? 'bg-green-100 text-green-700'
                                : o.value === 'FAIR' ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                              : 'text-soft-muted hover:bg-gray-100',
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Section 3 — Notes */}
          {!editMode && (
            <div className="border-t border-gray-100 p-5">
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
                Notes
              </p>
              {skip.notes ? (
                <p className="text-sm text-soft-text">{skip.notes}</p>
              ) : (
                <p className="text-sm italic text-soft-muted">No notes</p>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
