'use client'

interface CustomerFiltersProps {
  search: string
  onChange: (value: string) => void
  totalResults: number
}

export function CustomerFilters({ search, onChange, totalResults }: CustomerFiltersProps) {
  return (
    <div className="rounded-card bg-white p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft-muted">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={e => onChange(e.target.value)}
            placeholder="Search by name, email, phone or postcode…"
            className="w-full rounded-btn border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-soft-text shadow-inset placeholder:text-soft-muted focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        {search && (
          <span className="whitespace-nowrap text-xs text-soft-muted">
            {totalResults} customer{totalResults !== 1 ? 's' : ''} found
          </span>
        )}
      </div>
    </div>
  )
}
