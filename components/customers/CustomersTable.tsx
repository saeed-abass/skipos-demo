'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { CustomerWithJobCount } from '@/lib/actions/customers'

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatSince(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// ─────────────────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[48, 28, 36, 52, 16, 24, 20].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 animate-pulse rounded bg-gray-100"
            style={{ width: `${w * 2}px` }}
          />
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-14 w-14 text-soft-muted/30">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-soft-text">No customers yet</p>
            <p className="mt-0.5 text-xs text-soft-muted">Add your first customer to start creating jobs</p>
          </div>
          <button
            onClick={onNew}
            className="mt-1 inline-flex items-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
          >
            + New Customer
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
  isOpen: boolean
  onToggle: (e: React.MouseEvent) => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

function ActionsMenu({ isOpen, onToggle, onView, onEdit, onDelete }: ActionsMenuProps) {
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
        <div className="absolute right-0 top-8 z-20 min-w-[160px] rounded-card bg-white py-1 shadow-soft-md border border-gray-100">
          <button
            onClick={onView}
            className="flex w-full items-center px-4 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors"
          >
            View details
          </button>
          <a
            href="/jobs"
            className="flex w-full items-center px-4 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors"
          >
            New Job
          </a>
          <button
            onClick={onEdit}
            className="flex w-full items-center px-4 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={onDelete}
            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Table
// ─────────────────────────────────────────────────────────

interface CustomersTableProps {
  customers: CustomerWithJobCount[]
  loading: boolean
  selectedId: string | null
  onRowClick: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

export function CustomersTable({
  customers,
  loading,
  selectedId,
  onRowClick,
  onEdit,
  onDelete,
  onNew,
}: CustomersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (!openMenuId) return
    function close() { setOpenMenuId(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openMenuId])

  return (
    <div className="overflow-hidden rounded-card bg-white shadow-soft">

      {/* Mobile card list */}
      <div className="lg:hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-5 w-10 animate-pulse rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-12 w-12 text-soft-muted/30">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-soft-text">No customers yet</p>
                <p className="mt-0.5 text-xs text-soft-muted">Add your first customer to start creating jobs</p>
              </div>
              <button
                onClick={onNew}
                className="mt-1 inline-flex items-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
              >
                + New Customer
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {customers.map(customer => (
              <div
                key={customer.id}
                onClick={() => onRowClick(customer.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors',
                  selectedId === customer.id ? 'bg-orange-50/60' : 'hover:bg-gray-50/50',
                )}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-navy text-xs font-bold text-white">
                  {initials(customer.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-soft-text">{customer.name}</p>
                  <p className="mt-0.5 truncate text-xs text-soft-muted">
                    {customer.phone || customer.email || 'No contact info'}
                  </p>
                </div>
                <span className={cn(
                  'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold',
                  customer._count.jobs > 0 ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-500',
                )}>
                  {customer._count.jobs}
                </span>
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
              {['Customer', 'Phone', 'Email', 'Address', 'Jobs', 'Since', ''].map(col => (
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
            ) : customers.length === 0 ? (
              <EmptyState onNew={onNew} />
            ) : (
              customers.map(customer => {
                const isSelected = selectedId === customer.id

                if (confirmDeleteId === customer.id) {
                  return (
                    <tr key={customer.id} className="border-b border-gray-50 bg-red-50/40">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-soft-text">
                            Delete <span className="font-semibold">{customer.name}</span>? This cannot be undone.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-btn border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-soft-muted hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteId(null)
                                onDelete(customer.id)
                              }}
                              className="rounded-btn bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr
                    key={customer.id}
                    onClick={() => onRowClick(customer.id)}
                    className={cn(
                      'cursor-pointer border-b border-gray-50 transition-colors',
                      isSelected
                        ? 'bg-orange-50/60'
                        : 'hover:bg-gray-50/50'
                    )}
                  >
                    {/* Customer */}
                    <td className={cn(
                      'px-6 py-4',
                      isSelected && 'border-l-2 border-l-orange-400'
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-navy text-xs font-bold text-white">
                          {initials(customer.name)}
                        </div>
                        <span className="font-semibold text-soft-text">{customer.name}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-soft-muted">
                      {customer.phone ?? 'No phone'}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <span className="block max-w-[200px] truncate text-soft-muted">
                        {customer.email ?? 'No email'}
                      </span>
                    </td>

                    {/* Address */}
                    <td className="px-6 py-4">
                      <span
                        title={`${customer.address}${customer.postcode ? ', ' + customer.postcode : ''}`}
                        className="block max-w-[180px] truncate text-soft-muted"
                      >
                        {customer.address}
                      </span>
                    </td>

                    {/* Jobs count */}
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                          customer._count.jobs > 0
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {customer._count.jobs}
                      </span>
                    </td>

                    {/* Since */}
                    <td className="px-6 py-4 text-soft-muted whitespace-nowrap">
                      {formatSince(customer.created_at)}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-4"
                      onClick={e => e.stopPropagation()}
                    >
                      <ActionsMenu
                        isOpen={openMenuId === customer.id}
                        onToggle={e => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === customer.id ? null : customer.id)
                        }}
                        onView={() => { setOpenMenuId(null); onRowClick(customer.id) }}
                        onEdit={() => { setOpenMenuId(null); onEdit(customer.id) }}
                        onDelete={() => { setOpenMenuId(null); setConfirmDeleteId(customer.id) }}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && customers.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-soft-muted">
            {customers.length} customer{customers.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
