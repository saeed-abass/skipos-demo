'use client'

import { cn } from '@/lib/utils'
import type { WTNStatus } from '@/types'

export interface WTNFilterState {
  status: string
  search: string
  dateFrom: string
  dateTo: string
}

interface WTNFiltersProps {
  filters: WTNFilterState
  onChange: (f: WTNFilterState) => void
  totalResults: number
}

const inputClass =
  'h-9 rounded-btn border border-gray-200 bg-white px-3 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300'

const WTN_STATUSES: { value: WTNStatus | ''; label: string }[] = [
  { value: '',          label: 'All Statuses' },
  { value: 'DRAFT',     label: 'Draft' },
  { value: 'SIGNED',    label: 'Signed' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'ACCEPTED',  label: 'Accepted' },
  { value: 'REJECTED',  label: 'Rejected' },
]

export function WTNFilters({ filters, onChange, totalResults }: WTNFiltersProps) {
  const isActive =
    filters.status !== '' ||
    filters.search !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== ''

  function set(key: keyof WTNFilterState, value: string) {
    onChange({ ...filters, [key]: value })
  }

  function clear() {
    onChange({ status: '', search: '', dateFrom: '', dateTo: '' })
  }

  return (
    <div className="rounded-card bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative min-w-[220px] flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor"
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft-muted"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            placeholder="Search by WTN number, customer, waste type…"
            className={cn(inputClass, 'w-full pl-8')}
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={e => set('status', e.target.value)}
          className={cn(inputClass, 'pr-8')}
        >
          {WTN_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Date from */}
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => set('dateFrom', e.target.value)}
          className={inputClass}
          title="From date"
        />

        {/* Date to */}
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => set('dateTo', e.target.value)}
          className={inputClass}
          title="To date"
        />

        {/* Results count + clear */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-soft-muted">
            {totalResults} result{totalResults !== 1 ? 's' : ''}
          </span>
          {isActive && (
            <button
              onClick={clear}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
