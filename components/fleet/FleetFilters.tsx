'use client'

import { cn } from '@/lib/utils'
import { SKIP_SIZE_LABELS } from '@/types'
import type { SkipSize, SkipStatus, Condition } from '@/types'

export type FleetFilterState = {
  status: string
  size: string
  condition: string
  search: string
}

const inputClass =
  'rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-soft-text ' +
  'shadow-inset focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '',        label: 'All Locations' },
  { value: 'IN_YARD', label: 'In Yard' },
  { value: 'ON_SITE', label: 'On Site' },
  { value: 'AT_TIP',  label: 'At Tip' },
]

const SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Sizes' },
  ...Object.entries(SKIP_SIZE_LABELS).map(([value, label]) => ({ value, label })),
]

const CONDITION_OPTIONS: { value: string; label: string }[] = [
  { value: '',     label: 'All Conditions' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
]

interface FleetFiltersProps {
  filters: FleetFilterState
  onChange: (filters: FleetFilterState) => void
}

export function FleetFilters({ filters, onChange }: FleetFiltersProps) {
  const isActive =
    filters.status || filters.size || filters.condition || filters.search

  function set(key: keyof FleetFilterState, value: string) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-card bg-white p-4 shadow-soft">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft-muted"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          placeholder="Search by serial number or notes…"
          className={cn(inputClass, 'w-full pl-9')}
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={e => set('status', e.target.value)}
        className={cn(inputClass, 'cursor-pointer')}
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Size */}
      <select
        value={filters.size}
        onChange={e => set('size', e.target.value)}
        className={cn(inputClass, 'cursor-pointer')}
      >
        {SIZE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Condition */}
      <select
        value={filters.condition}
        onChange={e => set('condition', e.target.value)}
        className={cn(inputClass, 'cursor-pointer')}
      >
        {CONDITION_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Clear */}
      {isActive && (
        <button
          onClick={() => onChange({ status: '', size: '', condition: '', search: '' })}
          className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
