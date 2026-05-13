'use client'

import { cn } from '@/lib/utils'

export type FilterState = {
  status: string
  jobType: string
  search: string
  dateFrom: string
  dateTo: string
}

interface JobFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  totalResults: number
}

function isActive(filters: FilterState): boolean {
  return !!(
    filters.status ||
    filters.jobType ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo
  )
}

const inputClass =
  'rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-soft-text shadow-inset ' +
  'placeholder:text-soft-muted focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

export function JobFilters({ filters, onChange, totalResults }: JobFiltersProps) {
  function set(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value })
  }

  function clear() {
    onChange({ status: '', jobType: '', search: '', dateFrom: '', dateTo: '' })
  }

  return (
    <div className="rounded-card bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-end gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft-muted">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            placeholder="Search by customer, address…"
            className={cn(inputClass, 'w-full pl-9')}
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={e => set('status', e.target.value)}
          className={cn(inputClass, 'min-w-[150px]')}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* Type */}
        <select
          value={filters.jobType}
          onChange={e => set('jobType', e.target.value)}
          className={cn(inputClass, 'min-w-[140px]')}
        >
          <option value="">All Types</option>
          <option value="DELIVERY">Delivery</option>
          <option value="COLLECTION">Collection</option>
          <option value="EXCHANGE">Exchange</option>
          <option value="WAIT_AND_LOAD">Wait &amp; Load</option>
        </select>

        {/* Date from */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-soft-muted">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => set('dateFrom', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-soft-muted">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => set('dateTo', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Clear */}
        {isActive(filters) && (
          <button
            onClick={clear}
            className="flex items-center gap-1 rounded-btn px-3 py-2 text-xs font-medium text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}

        {/* Result count */}
        {isActive(filters) && (
          <span className="ml-auto text-xs text-soft-muted">
            {totalResults} result{totalResults !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
