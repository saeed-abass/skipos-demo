'use client'

import { usePathname } from 'next/navigation'
import { useSidebar } from './sidebar'

// ─────────────────────────────────────────────────────────
// Page metadata map
// ─────────────────────────────────────────────────────────

const PAGE_META: Record<string, { title: string; section: string }> = {
  '/dashboard': { title: 'Dashboard',            section: 'Pages' },
  '/jobs':      { title: 'Jobs',                 section: 'Operations' },
  '/wtns':      { title: 'Waste Transfer Notes', section: 'Operations' },
  '/drivers':   { title: 'Drivers',              section: 'Operations' },
  '/customers': { title: 'Customers',            section: 'Management' },
  '/fleet':     { title: 'Fleet',                section: 'Management' },
  '/settings':  { title: 'Settings',             section: 'Management' },
}

function getPageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname]
  for (const [key, meta] of Object.entries(PAGE_META)) {
    if (pathname.startsWith(key + '/')) return meta
  }
  return { title: 'SkipOS', section: 'Pages' }
}

// ─────────────────────────────────────────────────────────
// Topbar — floating white card, matches sidebar style
// ─────────────────────────────────────────────────────────

export function Topbar() {
  const { toggle } = useSidebar()
  const pathname = usePathname()
  const { title, section } = getPageMeta(pathname)

  return (
    <header className="mt-4 mb-4 mr-4 flex h-16 items-center justify-between rounded-card bg-white px-5 shadow-soft">
      {/* Left: hamburger (mobile) + breadcrumb + title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="rounded-lg p-1.5 text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div>
          {/* Breadcrumb */}
          <p className="text-[0.65rem] font-medium text-soft-muted">
            <span>Home</span>
            <span className="mx-1 text-soft-muted/60">/</span>
            <span>{section}</span>
            <span className="mx-1 text-soft-muted/60">/</span>
            <span className="font-semibold text-soft-text">{title}</span>
          </p>
          {/* Page title */}
          <h1 className="text-sm font-semibold text-soft-text leading-tight">{title}</h1>
        </div>
      </div>

      {/* Right: search + notifications + avatar */}
      <div className="flex items-center gap-3">
        {/* Search — hidden on mobile */}
        <div className="hidden md:block">
          <input
            type="text"
            placeholder="Type here..."
            className="h-8 w-40 rounded-btn border-0 bg-gray-100 px-3 text-xs text-soft-text placeholder:text-soft-muted shadow-inset focus:outline-none focus:ring-2 focus:ring-orange-200 lg:w-48"
          />
        </div>

        {/* Notification bell */}
        <button className="relative rounded-lg p-1.5 text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {/* Orange notification dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" aria-hidden="true" />
        </button>

        {/* User avatar */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-navy text-[0.65rem] font-bold text-white shadow transition-opacity hover:opacity-90">
          JS
        </button>
      </div>
    </header>
  )
}
