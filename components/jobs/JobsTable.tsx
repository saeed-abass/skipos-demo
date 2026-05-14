'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { JOB_TYPE_LABELS, SKIP_SIZE_LABELS, type JobStatus } from '@/types'
import { JobStatusBadge } from './JobStatusBadge'
import type { JobRow } from '@/lib/actions/jobs'

const PAGE_SIZE = 20

// ─────────────────────────────────────────────────────────
// Type badge
// ─────────────────────────────────────────────────────────

const TYPE_BADGE_CLASSES: Record<string, string> = {
  DELIVERY:      'bg-blue-50 text-blue-600',
  COLLECTION:    'bg-purple-50 text-purple-600',
  EXCHANGE:      'bg-yellow-50 text-yellow-600',
  WAIT_AND_LOAD: 'bg-gray-100 text-gray-600',
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1',
        'text-[0.65rem] font-bold uppercase tracking-[0.05em]',
        TYPE_BADGE_CLASSES[type] ?? 'bg-gray-100 text-gray-600'
      )}
    >
      {JOB_TYPE_LABELS[type as keyof typeof JOB_TYPE_LABELS] ?? type}
    </span>
  )
}

// ─────────────────────────────────────────────────────────
// Date formatting
// ─────────────────────────────────────────────────────────

function formatJobDate(date: Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  })
}

function jobRef(id: string): string {
  return `JOB-${id.slice(-6).toUpperCase()}`
}

// ─────────────────────────────────────────────────────────
// Valid next statuses for contextual action menu
// ─────────────────────────────────────────────────────────

const NEXT_STATUSES: Record<JobStatus, { status: JobStatus; label: string }[]> = {
  PENDING:     [{ status: 'SCHEDULED',   label: 'Mark Scheduled' }, { status: 'CANCELLED', label: 'Cancel Job' }],
  SCHEDULED:   [{ status: 'IN_PROGRESS', label: 'Mark In Progress' }, { status: 'CANCELLED', label: 'Cancel Job' }],
  IN_PROGRESS: [{ status: 'COMPLETED',   label: 'Mark Completed' }, { status: 'CANCELLED', label: 'Cancel Job' }],
  COMPLETED:   [],
  CANCELLED:   [],
}

// ─────────────────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 animate-pulse rounded bg-gray-100" style={{ width: `${50 + (i * 17) % 50}%` }} />
        </td>
      ))}
    </tr>
  )
}

// ─────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────

function EmptyState({ onNewJob }: { onNewJob: () => void }) {
  return (
    <tr>
      <td colSpan={9} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-14 w-14 text-soft-muted/30">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-soft-text">No jobs yet</p>
            <p className="mt-0.5 text-xs text-soft-muted">Create your first job to get started</p>
          </div>
          <button
            onClick={onNewJob}
            className="mt-1 inline-flex items-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
          >
            + New Job
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─────────────────────────────────────────────────────────
// Actions dropdown
// ─────────────────────────────────────────────────────────

interface ActionsMenuProps {
  job: JobRow
  isOpen: boolean
  onToggle: (e: React.MouseEvent) => void
  onStatusChange: (status: JobStatus) => void
}

function ActionsMenu({ job, isOpen, onToggle, onStatusChange }: ActionsMenuProps) {
  const nextStatuses = NEXT_STATUSES[job.status as JobStatus] ?? []

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
        <div className="absolute right-0 top-8 z-20 min-w-[170px] rounded-card bg-white py-1 shadow-soft-md border border-gray-100">
          <button className="flex w-full items-center px-4 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors">
            View details
          </button>
          <button className="flex w-full items-center px-4 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors">
            Edit
          </button>

          {nextStatuses.length > 0 && (
            <>
              <div className="my-1 border-t border-gray-100" />
              {nextStatuses.map(({ status, label }) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  className={cn(
                    'flex w-full items-center px-4 py-2 text-sm transition-colors',
                    status === 'CANCELLED'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-soft-text hover:bg-gray-50'
                  )}
                >
                  {label}
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

interface JobsTableProps {
  jobs: JobRow[]
  loading: boolean
  onNewJob: () => void
  onStatusUpdate: (jobId: string, status: JobStatus) => void
}

export function JobsTable({ jobs, loading, onNewJob, onStatusUpdate }: JobsTableProps) {
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Reset page when jobs list changes (e.g. new filter applied)
  useEffect(() => { setPage(1) }, [jobs])

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return
    function close() { setOpenMenuId(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openMenuId])

  const total = jobs.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const end = Math.min(start + PAGE_SIZE, total)
  const visible = jobs.slice(start, end)

  return (
    <div className="overflow-hidden rounded-card bg-white shadow-soft">

      {/* Mobile card list */}
      <div className="lg:hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-20 animate-pulse rounded bg-gray-100" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
                </div>
                <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-12 w-12 text-soft-muted/30">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-soft-text">No jobs yet</p>
                <p className="mt-0.5 text-xs text-soft-muted">Create your first job to get started</p>
              </div>
              <button
                onClick={onNewJob}
                className="mt-1 inline-flex items-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
              >
                + New Job
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {visible.map(job => (
              <div key={job.id} className="flex flex-col gap-2 p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-soft-text">
                    {job.job_number ?? jobRef(job.id)}
                  </span>
                  <JobStatusBadge status={job.status as JobStatus} />
                </div>
                <div>
                  {job.customer ? (
                    <p className="font-semibold text-soft-text">{job.customer.name}</p>
                  ) : (
                    <p className="text-soft-muted">No customer</p>
                  )}
                  {job.delivery_address && (
                    <p className="mt-0.5 truncate text-xs text-soft-muted">{job.delivery_address}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <TypeBadge type={job.job_type} />
                  <span className="text-xs text-soft-muted">
                    {SKIP_SIZE_LABELS[job.skip_size as keyof typeof SKIP_SIZE_LABELS] ?? job.skip_size}
                  </span>
                  {job.scheduled_date && (
                    <span className="text-xs text-soft-muted">{formatJobDate(job.scheduled_date)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden w-full overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr>
              {['Job #', 'Customer', 'Type', 'Skip Size', 'Address', 'Driver', 'Status', 'Date', ''].map(col => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : visible.length === 0 ? (
              <EmptyState onNewJob={onNewJob} />
            ) : (
              visible.map(job => (
                <tr
                  key={job.id}
                  className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                >
                  {/* Job # */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold text-soft-text">
                      {job.job_number ?? jobRef(job.id)}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    {job.customer ? (
                      <div>
                        <p className="font-semibold text-soft-text">{job.customer.name}</p>
                        <p className="text-xs text-soft-muted">{job.customer.phone}</p>
                      </div>
                    ) : (
                      <span className="text-soft-muted">No customer</span>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <TypeBadge type={job.job_type} />
                  </td>

                  {/* Skip size */}
                  <td className="px-6 py-4 text-soft-muted whitespace-nowrap">
                    {SKIP_SIZE_LABELS[job.skip_size as keyof typeof SKIP_SIZE_LABELS] ?? job.skip_size}
                  </td>

                  {/* Address */}
                  <td className="px-6 py-4">
                    <span
                      title={`${job.delivery_address}, ${job.delivery_postcode}`}
                      className="block max-w-[160px] truncate text-soft-muted"
                    >
                      {job.delivery_address}
                    </span>
                  </td>

                  {/* Driver */}
                  <td className="px-6 py-4">
                    {job.driver ? (
                      <span className="text-soft-text">{job.driver.full_name}</span>
                    ) : (
                      <span className="italic text-soft-muted">Unassigned</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <JobStatusBadge status={job.status as JobStatus} />
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {job.scheduled_date ? (
                      <span className="text-soft-text">{formatJobDate(job.scheduled_date)}</span>
                    ) : (
                      <span className="italic text-soft-muted">Not scheduled</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <ActionsMenu
                      job={job}
                      isOpen={openMenuId === job.id}
                      onToggle={e => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === job.id ? null : job.id)
                      }}
                      onStatusChange={status => {
                        setOpenMenuId(null)
                        onStatusUpdate(job.id, status)
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-soft-muted">
            Showing {start + 1}–{end} of {total} job{total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-btn px-3 py-1.5 text-xs font-medium text-soft-muted hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 transition-colors"
            >
              ← Previous
            </button>
            <span className="px-2 text-xs text-soft-muted">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-btn px-3 py-1.5 text-xs font-medium text-soft-muted hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
