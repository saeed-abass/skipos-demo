'use client'

import { usePathname } from 'next/navigation'
import { useSidebar } from './sidebar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Jobs',
  '/wtns': 'Waste Transfer Notes',
  '/drivers': 'Drivers',
  '/customers': 'Customers',
  '/fleet': 'Fleet',
  '/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Prefix match (e.g. /jobs/new → Jobs)
  for (const [key, label] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + '/')) return label
  }
  return 'SkipOS'
}

export function Topbar() {
  const { toggle } = useSidebar()
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Left: mobile hamburger + title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      </div>

      {/* Right: user area */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        {/* User avatar */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white hover:bg-navy-light transition-colors">
          JS
        </button>
      </div>
    </header>
  )
}
