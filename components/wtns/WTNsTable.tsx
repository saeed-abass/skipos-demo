'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { JOB_TYPE_LABELS, SKIP_SIZE_LABELS, type WTNStatus } from '@/types'
import { WTNStatusBadge } from './WTNStatusBadge'
import { updateWTNStatus, type WTNRow } from '@/lib/actions/wtns'

const PAGE_SIZE = 20

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function jobRef(id: string) {
  return `JOB-${id.slice(-6).toUpperCase()}`
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

// ─────────────────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[80, 120, 100, 140, 90, 70, 40].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3.5 animate-pulse rounded bg-gray-100" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

// ─────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <tr>
      <td colSpan={7} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={1} stroke="currentColor" className="h-14 w-14 text-soft-muted/30">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM16.5 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-soft-text">No waste transfer notes yet</p>
            <p className="mt-0.5 text-xs text-soft-muted">
              Create your first WTN to start building your compliance record
            </p>
          </div>
          <button
            onClick={onNew}
            className="mt-1 inline-flex items-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
          >
            + New WTN
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─────────────────────────────────────────────────────────
// Actions menu
// ─────────────────────────────────────────────────────────

interface ActionsMenuProps {
  wtn: WTNRow
  isOpen: boolean
  onToggle: (e: React.MouseEvent) => void
  onViewDetails: () => void
  onStatusChange: (status: WTNStatus) => void
}

function ActionsMenu({ wtn, isOpen, onToggle, onViewDetails, onStatusChange }: ActionsMenuProps) {
  const [showPdfInfo, setShowPdfInfo] = useState(false)

  const transitions: { status: WTNStatus; label: string }[] = []
  if (wtn.status === 'DRAFT')     transitions.push({ status: 'SIGNED',    label: 'Mark as Signed' })
  if (wtn.status === 'SIGNED')    transitions.push(
    { status: 'SUBMITTED', label: 'Submit to EA' },
    { status: 'DRAFT',     label: 'Back to Draft' },
  )
  if (wtn.status === 'REJECTED')  transitions.push(
    { status: 'SUBMITTED', label: 'Resubmit' },
    { status: 'DRAFT',     label: 'Back to Draft' },
  )

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors"
        aria-label="Actions"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4">
          <path d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-20 min-w-[180px] rounded-card border border-gray-100 bg-white py-1 shadow-soft-md">
          <button
            onClick={onViewDetails}
            className="flex w-full items-center px-4 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors"
          >
            View details
          </button>
          <button
            onClick={() => setShowPdfInfo(v => !v)}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors"
          >
            Download PDF
            <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-orange-600">
              Beta
            </span>
          </button>
          {showPdfInfo && (
            <div className="mx-2 mb-1 rounded-btn border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
              PDF export is in active development and will be available in the next update. Your WTN
              data is fully saved.
            </div>
          )}

          {transitions.length > 0 && (
            <>
              <div className="my-1 border-t border-gray-100" />
              {transitions.map(t => (
                <button
                  key={t.status}
                  onClick={() => onStatusChange(t.status)}
                  className="flex w-full items-center px-4 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Main table
// ─────────────────────────────────────────────────────────

interface WTNsTableProps {
  wtns: WTNRow[]
  loading: boolean
  onNew: () => void
  onRowClick: (wtn: WTNRow) => void
  onStatusChange: (id: string, status: WTNStatus) => void
}

export function WTNsTable({ wtns, loading, onNew, onRowClick, onStatusChange }: WTNsTableProps) {
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => { setPage(1) }, [wtns])

  useEffect(() => {
    if (!openMenuId) return
    function close() { setOpenMenuId(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openMenuId])

  const total      = wtns.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const start      = (safePage - 1) * PAGE_SIZE
  const end        = Math.min(start + PAGE_SIZE, total)
  const visible    = wtns.slice(start, end)

  const Th = ({ children }: { children: React.ReactNode }) => (
    <th className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-soft-muted">
      {children}
    </th>
  )

  return (
    <div className="overflow-hidden rounded-card bg-white shadow-soft">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/80">
            <tr>
              <Th>WTN #</Th>
              <Th>Customer</Th>
              <Th>Linked Job</Th>
              <Th>Waste</Th>
              <Th>Collection Date</Th>
              <Th>Status</Th>
              <Th><span className="sr-only">Actions</span></Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && visible.length === 0 && <EmptyState onNew={onNew} />}

            {!loading && visible.map(wtn => (
              <tr
                key={wtn.id}
                className="cursor-pointer transition-colors hover:bg-orange-50/30"
                onClick={() => onRowClick(wtn)}
              >
                {/* WTN # */}
                <td className="px-5 py-3.5">
                  <span className="font-mono text-xs font-bold text-soft-text">
                    {wtn.wtn_number}
                  </span>
                </td>

                {/* Customer */}
                <td className="px-5 py-3.5">
                  <p className="font-medium text-soft-text">{wtn.job.customer.name}</p>
                  <p className="mt-0.5 truncate text-xs text-soft-muted" style={{ maxWidth: 180 }}>
                    {wtn.job.delivery_address}
                  </p>
                </td>

                {/* Linked Job */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-soft-muted">{jobRef(wtn.job.id)}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.6rem] font-semibold text-soft-muted">
                      {SKIP_SIZE_LABELS[wtn.job.skip_size as keyof typeof SKIP_SIZE_LABELS] ?? wtn.job.skip_size}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[0.6rem] font-semibold text-blue-600">
                      {JOB_TYPE_LABELS[wtn.job.job_type as keyof typeof JOB_TYPE_LABELS] ?? wtn.job.job_type}
                    </span>
                  </div>
                </td>

                {/* Waste */}
                <td className="px-5 py-3.5">
                  <p className="text-soft-text">{truncate(wtn.waste_description, 32)}</p>
                  {wtn.ewc_code && (
                    <p className="mt-0.5 text-xs text-soft-muted">{wtn.ewc_code}</p>
                  )}
                </td>

                {/* Collection Date */}
                <td className="px-5 py-3.5">
                  <span className="text-soft-text">
                    {formatDate(wtn.transfer_date)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <WTNStatusBadge status={wtn.status as WTNStatus} />
                </td>

                {/* Actions */}
                <td
                  className="px-5 py-3.5"
                  onClick={e => e.stopPropagation()}
                >
                  <ActionsMenu
                    wtn={wtn}
                    isOpen={openMenuId === wtn.id}
                    onToggle={e => {
                      e.stopPropagation()
                      setOpenMenuId(id => id === wtn.id ? null : wtn.id)
                    }}
                    onViewDetails={() => { setOpenMenuId(null); onRowClick(wtn) }}
                    onStatusChange={status => { setOpenMenuId(null); onStatusChange(wtn.id, status) }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <span className="text-xs text-soft-muted">
            Showing {start + 1}–{end} of {total} WTN{total !== 1 ? 's' : ''}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="rounded px-2 py-1 text-xs text-soft-muted hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-2 text-xs text-soft-muted">{safePage} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="rounded px-2 py-1 text-xs text-soft-muted hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
