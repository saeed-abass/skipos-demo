'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/actions/auth'
import { useToast } from '@/components/ui/toast'
import { InviteMemberModal } from '@/components/team/InviteMemberModal'

// ─────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────

interface SidebarCtx {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarCtx>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((v) => !v),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}

// ─────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5 flex-shrink-0"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

function MenuIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn('h-4 w-4 flex-shrink-0', className)}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

const ICONS = {
  dashboard:
    'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  jobs: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z',
  wtns: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  team:
    'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  customers:
    'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  fleet:
    'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
  settings:
    'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  // Account menu icons
  cog: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  userPlus:
    'M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z',
  creditCard:
    'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  logout:
    'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
}

// ─────────────────────────────────────────────────────────
// Nav sections
// ─────────────────────────────────────────────────────────

const navSections = [
  {
    label: 'Pages',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: ICONS.dashboard },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Jobs',     href: '/jobs',     icon: ICONS.jobs },
      { label: 'WTNs',    href: '/wtns',     icon: ICONS.wtns },
      { label: 'Team',    href: '/team',     icon: ICONS.team },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Customers', href: '/customers', icon: ICONS.customers },
      { label: 'Fleet',     href: '/fleet',     icon: ICONS.fleet },
      { label: 'Settings',  href: '/settings',  icon: ICONS.settings },
    ],
  },
]

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// ─────────────────────────────────────────────────────────
// User / account footer
// ─────────────────────────────────────────────────────────

function UserFooter() {
  const router = useRouter()
  const { showToast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      setEmail(user.email ?? null)
      supabase
        .from('companies')
        .select('name')
        .eq('email', user.email)
        .single()
        .then(({ data }) => {
          if (data?.name) setCompanyName(data.name)
          setLoading(false)
        })
    })
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [menuOpen])

  function navigate(href: string) {
    setMenuOpen(false)
    router.push(href)
  }

  // Derive display values
  function emailFallbackName(e: string): string {
    const local = e.split('@')[0]
    const first = local.split('.')[0]
    return first.charAt(0).toUpperCase() + first.slice(1)
  }

  const avatarText = companyName
    ? initials(companyName)
    : email
    ? email.slice(0, 2).toUpperCase()
    : '??'

  const primaryLabel = companyName || (email ? emailFallbackName(email) : '')
  const secondaryLabel = companyName ? email : 'Admin'

  return (
    <div ref={containerRef} className="relative flex-shrink-0 border-t border-gray-100 p-3">
      <InviteMemberModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false)
          showToast({ type: 'success', title: 'Invite sent', message: 'Team member has been invited' })
        }}
      />

      {/* ── Popup menu ──────────────────────────────── */}
      {menuOpen && (
        <div className="animate-fade-slide-up absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-card border border-gray-100 bg-white shadow-soft-md">

          {/* Account header */}
          <div className="flex items-center gap-3 border-b border-gray-100 p-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-navy text-xs font-bold text-white">
              {avatarText}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-soft-text">{primaryLabel}</p>
              <p className="truncate text-xs text-soft-muted">{secondaryLabel}</p>
            </div>
          </div>

          {/* Items */}
          <div className="py-1">
            <button
              onClick={() => { setMenuOpen(false); setShowInviteModal(true) }}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors"
            >
              <MenuIcon d={ICONS.userPlus} className="text-soft-muted" />
              Invite Team Member
            </button>
            <button
              onClick={() => {
                setMenuOpen(false)
                showToast({ type: 'info', title: 'Coming soon', message: 'Billing is not yet available' })
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors"
            >
              <MenuIcon d={ICONS.creditCard} className="text-soft-muted" />
              Billing
            </button>

            <div className="my-1 border-t border-gray-100" />

            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <MenuIcon d={ICONS.logout} className="text-red-400" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ── Account button ───────────────────────────── */}
      <button
        onClick={() => setMenuOpen(v => !v)}
        className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
      >
        {/* Avatar */}
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-navy text-xs font-bold text-white shadow">
          {loading ? (
            <span className="h-3 w-3 animate-pulse rounded-full bg-white/40" />
          ) : (
            avatarText
          )}
        </div>

        {/* Labels */}
        <div className="min-w-0 flex-1 text-left">
          {loading ? (
            <>
              <div className="mb-1 h-3 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-gray-100" />
            </>
          ) : (
            <>
              <p className="truncate text-sm font-semibold text-soft-text">{primaryLabel}</p>
              <p className="truncate text-xs text-soft-muted">{secondaryLabel}</p>
            </>
          )}
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={cn(
            'h-4 w-4 flex-shrink-0 text-soft-muted transition-transform duration-200',
            menuOpen && 'rotate-180'
          )}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Bottom nav (mobile only)
// ─────────────────────────────────────────────────────────

const BOTTOM_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: ICONS.dashboard },
  { label: 'Jobs',      href: '/jobs',      icon: ICONS.jobs },
  { label: 'WTNs',     href: '/wtns',      icon: ICONS.wtns },
  { label: 'Customers', href: '/customers', icon: ICONS.customers },
]

function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { showToast } = useToast()
  const [showDrawer, setShowDrawer] = useState(false)

  const drawerItems = [
    { label: 'Team',     href: '/team',     icon: ICONS.team },
    { label: 'Fleet',    href: '/fleet',    icon: ICONS.fleet },
    { label: 'Settings', href: '/settings', icon: ICONS.settings },
  ]

  return (
    <>
      {/* Drawer backdrop */}
      {showDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setShowDrawer(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-up drawer */}
      <div className={cn(
        'fixed inset-x-0 z-50 bg-white rounded-t-2xl shadow-soft-md lg:hidden',
        'transition-transform duration-300 ease-in-out',
        showDrawer ? 'bottom-0 translate-y-0' : 'bottom-0 translate-y-full pointer-events-none',
      )}>
        <div className="mx-auto my-2 h-1 w-10 rounded-full bg-gray-200" />
        <div className="px-4 pb-6 pt-2">
          <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-widest text-soft-muted">
            More
          </p>
          {drawerItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <button
                key={item.href}
                onClick={() => { setShowDrawer(false); router.push(item.href) }}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  active ? 'bg-orange-50 text-orange-600' : 'text-soft-text hover:bg-gray-50',
                )}
              >
                <NavIcon d={item.icon} />
                {item.label}
              </button>
            )
          })}

          <div className="my-3 border-t border-gray-100" />

          <button
            onClick={() => {
              setShowDrawer(false)
              showToast({ type: 'info', title: 'Coming soon', message: 'Billing is not yet available' })
            }}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-soft-text hover:bg-gray-50 transition-colors"
          >
            <MenuIcon d={ICONS.creditCard} className="h-5 w-5 text-soft-muted" />
            Billing
          </button>

          <button
            onClick={() => { setShowDrawer(false); signOut() }}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <MenuIcon d={ICONS.logout} className="h-5 w-5 text-red-400" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Bottom nav bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-gray-100 bg-white lg:hidden">
        {BOTTOM_NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors',
                active ? 'text-orange-500' : 'text-soft-muted',
              )}
            >
              <NavIcon d={item.icon} />
              <span className="text-[0.6rem] font-semibold">{item.label}</span>
            </Link>
          )
        })}

        {/* More */}
        <button
          onClick={() => setShowDrawer(v => !v)}
          className={cn(
            'flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors',
            showDrawer ? 'text-orange-500' : 'text-soft-muted',
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span className="text-[0.6rem] font-semibold">More</span>
        </button>
      </nav>
    </>
  )
}

// ─────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[250px] flex-col overflow-hidden bg-white lg:bottom-4 lg:left-4 lg:top-4 lg:flex lg:rounded-card lg:shadow-soft-md">

        {/* ── Logo ─────────────────────────────────── */}
        <div className="flex flex-shrink-0 items-center border-b border-gray-100 px-6 py-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="h-8 w-8 rounded-lg shadow" aria-hidden="true" />
            <span className="text-[17px] font-bold tracking-tight text-soft-text">
              Skip<span className="text-orange-500">OS</span>
            </span>
          </Link>
        </div>

        {/* ── Navigation ───────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mx-4 mb-1 mt-4 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'mx-2 mb-0.5 flex items-center gap-3 rounded-lg px-4 py-2.5',
                      'text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-gradient-orange text-white shadow-[0_4px_6px_rgba(249,115,22,0.35)]'
                        : 'text-soft-muted hover:bg-gray-50 hover:text-soft-text'
                    )}
                  >
                    <NavIcon d={item.icon} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* ── Account footer ────────────────────────── */}
        <UserFooter />
      </aside>

      {/* Mobile bottom nav */}
      <BottomNav />
    </>
  )
}
