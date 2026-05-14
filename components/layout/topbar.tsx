'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { globalSearch, type SearchResults } from '@/lib/actions/search'
import { JOB_STATUS_LABELS } from '@/types'
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal'

// ─────────────────────────────────────────────────────────
// Page metadata
// ─────────────────────────────────────────────────────────

const PAGE_META: Record<string, { title: string; section: string }> = {
  '/dashboard':     { title: 'Dashboard',            section: 'Pages' },
  '/notifications': { title: 'Notifications',        section: 'Pages' },
  '/jobs':          { title: 'Jobs',                 section: 'Operations' },
  '/wtns':          { title: 'Waste Transfer Notes', section: 'Operations' },
  '/team':          { title: 'Team',                 section: 'Operations' },
  '/customers':     { title: 'Customers',            section: 'Management' },
  '/fleet':         { title: 'Fleet',                section: 'Management' },
  '/settings':      { title: 'Settings',             section: 'Management' },
}

function getPageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname]
  for (const [key, meta] of Object.entries(PAGE_META)) {
    if (pathname.startsWith(key + '/')) return meta
  }
  return { title: 'SkipOS', section: 'Pages' }
}

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

type Panel = 'search' | 'bell' | null

// ─────────────────────────────────────────────────────────
// Inline status badge for search results
// ─────────────────────────────────────────────────────────

const STATUS_CLASSES: Record<string, string> = {
  PENDING:     'bg-yellow-50 text-yellow-600',
  SCHEDULED:   'bg-blue-50 text-blue-600',
  IN_PROGRESS: 'bg-orange-50 text-orange-600',
  COMPLETED:   'bg-green-50 text-green-600',
  CANCELLED:   'bg-gray-100 text-gray-500',
}

// ─────────────────────────────────────────────────────────
// Quick-link icons for empty search state
// ─────────────────────────────────────────────────────────

const QUICK_LINKS = [
  {
    label: 'Dashboard', href: '/dashboard',
    d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  },
  {
    label: 'Jobs', href: '/jobs',
    d: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
  },
  {
    label: 'Customers', href: '/customers',
    d: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    label: 'WTNs', href: '/wtns',
    d: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
]

// ─────────────────────────────────────────────────────────
// Search dropdown
// ─────────────────────────────────────────────────────────

function SearchDropdown({
  query, results, loading, onNavigate,
}: {
  query: string
  results: SearchResults | null
  loading: boolean
  onNavigate: (href: string) => void
}) {
  const hasJobs = (results?.jobs.length ?? 0) > 0
  const hasCustomers = (results?.customers.length ?? 0) > 0
  const hasAny = hasJobs || hasCustomers
  const showEmpty = !!query.trim() && !loading && results !== null && !hasAny

  return (
    <div className="animate-fade-slide-up absolute right-0 top-[calc(100%+8px)] z-50 w-96 overflow-hidden rounded-card border border-gray-100 bg-white shadow-soft-md">

      {/* Empty query — quick links */}
      {!query.trim() && (
        <div className="p-2">
          <p className="px-3 py-2 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
            Quick Links
          </p>
          {QUICK_LINKS.map(link => (
            <button
              key={link.href}
              onClick={() => onNavigate(link.href)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-soft-text transition-colors hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 flex-shrink-0 text-soft-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d={link.d} />
              </svg>
              {link.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {query.trim() && loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-300 border-t-orange-500" />
        </div>
      )}

      {/* No results */}
      {showEmpty && (
        <p className="py-6 text-center text-sm text-soft-muted">
          No results for &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Results */}
      {!loading && hasAny && (
        <div className="p-2">
          {hasJobs && (
            <>
              <p className="px-3 pb-1 pt-2 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
                Jobs
              </p>
              {results!.jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => onNavigate('/jobs')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                >
                  <span className="font-mono text-xs text-soft-muted">{job.jobNumber}</span>
                  <span className="min-w-0 flex-1 truncate text-left text-sm text-soft-text">
                    {job.customer.name}
                  </span>
                  <span className={cn(
                    'flex-shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase',
                    STATUS_CLASSES[job.status] ?? 'bg-gray-100 text-gray-500'
                  )}>
                    {JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS] ?? job.status}
                  </span>
                </button>
              ))}
            </>
          )}

          {hasCustomers && (
            <>
              <p className="px-3 pb-1 pt-2 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
                Customers
              </p>
              {results!.customers.map(c => (
                <button
                  key={c.id}
                  onClick={() => onNavigate('/customers')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium text-soft-text">{c.name}</p>
                    <p className="truncate text-xs text-soft-muted">
                      {c.phone || c.email || ''}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Footer hint */}
      {query.trim() && (
        <div className="border-t border-gray-100 p-2 text-center">
          <p className="text-xs text-soft-muted">Press Enter to search all results</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Notifications dropdown
// ─────────────────────────────────────────────────────────

function NotificationsDropdown() {
  return (
    <div className="animate-fade-slide-up absolute right-0 top-[calc(100%+8px)] z-50 w-80 overflow-hidden rounded-card border border-gray-100 bg-white shadow-soft-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="text-sm font-semibold text-soft-text">Notifications</span>
        <button className="text-xs text-orange-500 transition-colors hover:text-orange-600">
          Mark all read
        </button>
      </div>

      {/* Empty state */}
      <div className="max-h-80 overflow-y-auto py-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={1} stroke="currentColor"
          className="mx-auto mb-2 h-8 w-8 text-soft-muted/40">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p className="text-sm text-soft-muted">No notifications yet</p>
        <p className="mt-1 text-xs text-soft-muted">Job updates and alerts will appear here</p>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 text-center">
        <Link href="/notifications" className="text-xs text-orange-500 transition-colors hover:text-orange-600">
          View all notifications
        </Link>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────────────────

export function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { title, section } = getPageMeta(pathname)

  const [openPanel, setOpenPanel] = useState<Panel>(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const bellContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Click outside — closes the active panel
  useEffect(() => {
    if (!openPanel) return
    const activePanel = openPanel // capture non-nullable for closure
    const refMap = {
      search: searchContainerRef,
      bell: bellContainerRef,
    } as const
    function handler(e: MouseEvent) {
      const container = refMap[activePanel].current
      if (container && !container.contains(e.target as Node)) {
        setOpenPanel(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openPanel])

  // Escape closes open panels
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenPanel(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus search from keyboard shortcut hook via custom event
  useEffect(() => {
    function handler() {
      searchInputRef.current?.focus()
      setOpenPanel('search')
    }
    window.addEventListener('skipos:focus-search', handler)
    return () => window.removeEventListener('skipos:focus-search', handler)
  }, [])

  // Close panels on navigation
  useEffect(() => {
    setOpenPanel(null)
  }, [pathname])

  function togglePanel(panel: Panel) {
    setOpenPanel(p => p === panel ? null : panel)
  }

  function handleSearchChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setSearchResults(null)
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await globalSearch(value.trim())
        setSearchResults(results)
      } catch (err) {
        console.error('[search]', err)
        setSearchResults({ jobs: [], customers: [] })
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(query.trim())}`)
      setOpenPanel(null)
      setQuery('')
      setSearchResults(null)
    }
  }

  function handleSearchNavigate(href: string) {
    router.push(href)
    setOpenPanel(null)
    setQuery('')
    setSearchResults(null)
  }

  return (
    <>
      {showShortcutsModal && (
        <KeyboardShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}

      {/* Mobile full-screen search overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          <div className="flex flex-shrink-0 items-center gap-2 border-b border-gray-100 px-3 py-3">
            <button
              onClick={() => { setMobileSearchOpen(false); setQuery(''); setSearchResults(null) }}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-soft-muted hover:bg-gray-100"
              aria-label="Close search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor"
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-soft-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={mobileSearchInputRef}
                autoFocus
                type="text"
                value={query}
                onChange={e => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search jobs, customers…"
                className="h-10 w-full rounded-btn border-0 bg-gray-100 pl-8 pr-3 text-sm text-soft-text placeholder:text-soft-muted focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <SearchDropdown
              query={query}
              results={searchResults}
              loading={searchLoading}
              onNavigate={href => { setMobileSearchOpen(false); setQuery(''); setSearchResults(null); router.push(href) }}
            />
          </div>
        </div>
      )}

      <header className="mb-3 mt-3 flex h-14 items-center justify-between rounded-card bg-white px-4 shadow-soft mx-3 lg:mb-4 lg:mr-4 lg:mt-4 lg:ml-0 lg:h-16 lg:px-5 lg:mx-0">

        {/* ── Left: title (mobile) / breadcrumb (desktop) ── */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile: page title only */}
          <h1 className="text-sm font-semibold text-soft-text lg:hidden">{title}</h1>

          {/* Desktop: breadcrumb + title */}
          <div className="hidden lg:block">
            <p className="text-[0.65rem] font-medium text-soft-muted">
              <span>Home</span>
              <span className="mx-1 text-soft-muted/60">/</span>
              <span>{section}</span>
              <span className="mx-1 text-soft-muted/60">/</span>
              <span className="font-semibold text-soft-text">{title}</span>
            </p>
            <h1 className="text-sm font-semibold leading-tight text-soft-text">{title}</h1>
          </div>
        </div>

        {/* ── Right: actions ─────────────────────────── */}
        <div className="flex flex-shrink-0 items-center gap-1 lg:gap-2">

          {/* Mobile search icon */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="rounded-lg p-2 text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors lg:hidden"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          {/* Desktop search input */}
          <div ref={searchContainerRef} className="relative hidden lg:block">
            <div className="relative flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor"
                className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-soft-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={searchInputRef}
                data-search-input
                type="text"
                value={query}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => setOpenPanel('search')}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search…"
                className={cn(
                  'h-8 rounded-btn border-0 bg-gray-100 pl-8 pr-3 text-xs text-soft-text placeholder:text-soft-muted shadow-inset',
                  'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200',
                  openPanel === 'search' ? 'w-60' : 'w-40 lg:w-48'
                )}
              />
            </div>
            {openPanel === 'search' && (
              <SearchDropdown
                query={query}
                results={searchResults}
                loading={searchLoading}
                onNavigate={handleSearchNavigate}
              />
            )}
          </div>

          {/* Keyboard shortcuts — desktop only */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            title="Keyboard shortcuts"
            className="hidden rounded-lg p-2.5 text-soft-muted transition-colors hover:bg-gray-100 hover:text-soft-text lg:flex"
            aria-label="Keyboard shortcuts"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>

          {/* Notification bell */}
          <div ref={bellContainerRef} className="relative">
            <button
              onClick={() => togglePanel('bell')}
              className={cn(
                'relative rounded-lg p-2 transition-colors lg:p-2.5',
                openPanel === 'bell'
                  ? 'bg-gray-100 text-soft-text'
                  : 'text-soft-muted hover:bg-gray-100 hover:text-soft-text'
              )}
              aria-label="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 lg:h-6 lg:w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
            {openPanel === 'bell' && <NotificationsDropdown />}
          </div>
        </div>
      </header>
    </>
  )
}
