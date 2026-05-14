'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, StatCard } from '@/components/ui/card'
import { Badge, JobStatusBadge } from '@/components/ui/badge'
import {
  Table, TableBody, TableHead, TableHeader,
  TableRow, TableCell, EmptyTableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  getDashboardStats,
  getRecentJobs,
  getTodaysSchedule,
  getFleetStatusCounts,
  getCompanyComplianceStatus,
  type DashboardStats,
  type RecentJob,
  type ScheduleJob,
  type FleetCounts,
} from '@/lib/actions/dashboard'
import { JOB_TYPE_LABELS, SKIP_SIZE_LABELS, type JobType, type SkipSize } from '@/types'

// ─────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function CurrencyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// Skeleton components
// ─────────────────────────────────────────────────────────

function SkeletonStatCard() {
  return (
    <div className="relative overflow-visible rounded-card bg-white shadow-soft">
      <div className="absolute -top-6 left-4 h-16 w-16 animate-pulse rounded-xl bg-gray-200" />
      <div className="px-4 pb-2 pt-4 text-right">
        <div className="ml-auto h-2.5 w-20 animate-pulse rounded bg-gray-100" />
        <div className="ml-auto mt-2 h-7 w-12 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="border-t border-gray-100 px-4 py-2.5">
        <div className="h-2.5 w-28 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  )
}

function SkeletonTableRow() {
  return (
    <tr className="border-b border-gray-50">
      {[40, 64, 48, 56, 52, 36].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div className={cn('h-3.5 animate-pulse rounded bg-gray-100')} style={{ width: `${w}px` }} />
        </td>
      ))}
    </tr>
  )
}

function SkeletonScheduleRow() {
  return (
    <div className="flex items-center gap-2 border-b border-gray-50 py-2">
      <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function jobRef(id: string) {
  return `JOB-${id.slice(-6).toUpperCase()}`
}

function fmtShortDate(date: Date | string | null): string {
  if (!date) return ''
  return new Date(date as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function fmtTime(date: Date | string | null): string {
  if (!date) return 'TBC'
  const d = new Date(date as string)
  const h = d.getHours()
  const m = d.getMinutes()
  if (h === 0 && m === 0) return 'TBC'
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [stats, setStats]               = useState<DashboardStats | null>(null)
  const [recentJobs, setRecentJobs]     = useState<RecentJob[]>([])
  const [schedule, setSchedule]         = useState<ScheduleJob[]>([])
  const [fleet, setFleet]               = useState<FleetCounts>({ inYard: 0, onSite: 0, atTip: 0 })
  const [compliance, setCompliance]     = useState<{ ea_registration: string | null } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, jobs, sched, fl, comp] = await Promise.all([
        getDashboardStats(),
        getRecentJobs(),
        getTodaysSchedule(),
        getFleetStatusCounts(),
        getCompanyComplianceStatus(),
      ])
      setStats(s)
      setRecentJobs(jobs)
      setSchedule(sched)
      setFleet(fl)
      setCompliance(comp)
    } catch (err) {
      console.error('[dashboard]', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const isConfigured = !!(compliance?.ea_registration)

  const defraTarget = new Date('2026-10-01')
  const defraToday  = new Date()
  const defradays   = Math.ceil((defraTarget.getTime() - defraToday.getTime()) / (1000 * 60 * 60 * 24))
  const defraPastDue = defradays < 0

  // ── Fleet row config ──────────────────────────────────
  const fleetRows = [
    {
      label: 'In Yard',
      count: fleet.inYard,
      activeBadge: 'muted'   as const,
    },
    {
      label: 'On Site',
      count: fleet.onSite,
      activeBadge: 'orange'  as const,
    },
    {
      label: 'At Tip',
      count: fleet.atTip,
      activeBadge: 'info'    as const,
    },
  ]

  // ── Compliance checklist ──────────────────────────────
  const checklist = [
    { label: 'EA Registration Number',  done: isConfigured },
    { label: 'Disposal site configured', done: false },
    { label: 'Carrier details added',    done: false },
    { label: 'First WTN created',        done: false },
  ]

  return (
    <div className="px-4 pb-6">

      {/* ── Row 1: Stat cards ─────────────────────────────
          pt-8 provides clearance for the floating icon boxes
          that protrude 1.5rem above each card top edge.
      ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 pt-8 xl:grid-cols-4 xl:gap-6">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard
              title="Today's Jobs"
              value={stats?.todaysJobs ?? 0}
              changeNode={
                stats?.todaysJobs ? (
                  <span className="text-xs font-medium text-green-600">
                    +{stats.todaysJobs} scheduled today
                  </span>
                ) : (
                  <span className="text-xs text-soft-muted">None scheduled today</span>
                )
              }
              icon={<ClipboardIcon />}
              iconGradient="orange"
            />
            <StatCard
              title="Active Skips"
              value={stats?.activeSkips ?? 0}
              changeNode={
                stats?.activeSkips ? (
                  <span className="text-xs font-medium text-orange-500">
                    {stats.activeSkips} out on site or at tip
                  </span>
                ) : (
                  <span className="text-xs text-soft-muted">All skips in yard</span>
                )
              }
              icon={<TruckIcon />}
              iconGradient="navy"
            />
            <StatCard
              title="Pending WTNs"
              value={stats?.pendingWTNs ?? 0}
              changeNode={
                stats?.pendingWTNs ? (
                  <span className="text-xs font-medium text-amber-500">
                    {stats.pendingWTNs} awaiting submission
                  </span>
                ) : (
                  <span className="text-xs text-soft-muted">Nothing pending</span>
                )
              }
              icon={<DocumentIcon />}
              iconGradient="info"
            />
            <StatCard
              title="This Month Revenue"
              value="£0"
              changeNode={
                <span className="text-xs italic text-soft-muted">Revenue tracking coming soon</span>
              }
              icon={<CurrencyIcon />}
              iconGradient="success"
            />
          </>
        )}
      </div>

      {/* ── Row 2: Recent Jobs + Quick Actions ──────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">

        {/* Recent Jobs — 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="flex h-full flex-col">
            <CardHeader
              className="flex-shrink-0"
              title="Recent Jobs"
              description="Latest 5 jobs across all types"
              action={
                <Link href="/jobs" className="text-xs font-semibold text-orange-500 hover:text-orange-600">
                  View all →
                </Link>
              }
            />
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Job #</TableHeader>
                    <TableHeader>Customer</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Skip Size</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Date</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <>
                      <SkeletonTableRow />
                      <SkeletonTableRow />
                      <SkeletonTableRow />
                    </>
                  ) : recentJobs.length === 0 ? (
                    <EmptyTableRow
                      colSpan={6}
                      message="No jobs yet. Create your first job to get started."
                    />
                  ) : (
                    recentJobs.map(job => (
                      <TableRow
                        key={job.id}
                        onClick={() => router.push('/jobs')}
                      >
                        <TableCell>
                          <span className="font-mono text-xs font-bold text-soft-text">
                            {job.job_number ?? jobRef(job.id)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-soft-text">{job.customer.name}</p>
                          {job.customer.phone && (
                            <p className="mt-0.5 text-xs text-soft-muted">{job.customer.phone}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="info">
                            {JOB_TYPE_LABELS[job.job_type as JobType] ?? job.job_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-soft-muted">
                          {SKIP_SIZE_LABELS[job.skip_size as SkipSize] ?? job.skip_size}
                        </TableCell>
                        <TableCell>
                          <JobStatusBadge status={job.status} />
                        </TableCell>
                        <TableCell>
                          {job.scheduled_date ? (
                            <span className="text-soft-muted">{fmtShortDate(job.scheduled_date)}</span>
                          ) : (
                            <span className="italic text-soft-muted">Not scheduled</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Quick Actions — 1/3 width */}
        <div>
          <Card className="flex h-full flex-col">
            <CardHeader title="Quick Actions" className="flex-shrink-0" />
            <CardContent>
              <div className="space-y-2.5">
                <Button className="w-full" size="sm" onClick={() => router.push('/jobs')}>
                  + New Job
                </Button>
                <Button variant="secondary" className="w-full" size="sm" onClick={() => router.push('/customers')}>
                  + New Customer
                </Button>
                <Button variant="secondary" className="w-full" size="sm" onClick={() => router.push('/wtns')}>
                  + New WTN
                </Button>
              </div>

              <div className="my-5 border-t border-gray-100" />

              {/* Today's schedule */}
              <div>
                <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
                  Today&apos;s Schedule
                </p>

                {loading ? (
                  <>
                    <SkeletonScheduleRow />
                    <SkeletonScheduleRow />
                  </>
                ) : schedule.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mb-2 h-8 w-8 text-soft-muted/40">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <p className="text-sm text-soft-muted">No jobs scheduled today</p>
                  </div>
                ) : (
                  <div>
                    {schedule.map(job => (
                      <div
                        key={job.id}
                        onClick={() => router.push('/jobs')}
                        className="-mx-1 flex cursor-pointer items-center gap-2 rounded-lg border-b border-gray-50 px-2 py-2.5 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <span className="flex-shrink-0 rounded bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
                          {fmtTime(job.scheduled_date)}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-soft-text">
                          {job.customer.name}
                        </span>
                        <Badge variant="info" className="flex-shrink-0">
                          {JOB_TYPE_LABELS[job.job_type as JobType] ?? job.job_type}
                        </Badge>
                        <JobStatusBadge status={job.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Row 3: Fleet Status + Compliance ─────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Fleet Status */}
        <Card>
          <CardHeader
            title="Fleet Status"
            description="Current skip locations at a glance"
          />
          <CardContent className="space-y-3">
            {loading ? (
              <>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {fleetRows.map(({ label, count, activeBadge }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                  >
                    <Badge
                      variant={count > 0 ? activeBadge : 'muted'}
                      className={cn(label === 'On Site' && count > 0 && 'animate-pulse')}
                    >
                      {label}
                    </Badge>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-soft-text">{count}</span>
                      <span className="ml-1 text-xs text-soft-muted">skips</span>
                    </div>
                  </div>
                ))}

                {fleet.inYard === 0 && fleet.onSite === 0 && fleet.atTip === 0 && (
                  <p className="pt-1 text-center text-xs italic text-soft-muted">
                    Add skips to your fleet to start tracking.{' '}
                    <Link href="/fleet" className="not-italic font-semibold text-orange-500 hover:underline">
                      Go to Fleet
                    </Link>
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card>
          <CardHeader
            title="Compliance"
            description="Digital waste tracking &amp; DEFRA obligations"
          />
          <CardContent>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-soft-text">
                    Digital Waste Tracking
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-bold',
                      defraPastDue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800',
                    )}>
                      {defraPastDue ? 'Past due!' : `${defradays} days remaining`}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-soft-muted">DEFRA mandate · Oct 2026</p>
                </div>
                {loading ? (
                  <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                ) : isConfigured ? (
                  <Badge variant="success">Configured</Badge>
                ) : (
                  <Badge variant="orange">Setup Required</Badge>
                )}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-soft-muted">
                EA-registered carriers must submit Waste Transfer Notes digitally
                from October 2026. Configure your EA registration number and
                disposal sites now to be compliant ahead of the deadline.
              </p>

              {loading ? (
                <div className="mt-3 h-4 w-24 animate-pulse rounded bg-orange-200" />
              ) : isConfigured ? (
                <Link
                  href="/wtns"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  View WTNs
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/settings"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  Configure now
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {checklist.map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={cn(
                    'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full',
                    done ? 'bg-green-500' : 'border-2 border-gray-200',
                  )}>
                    {done && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5 text-white">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className={cn('text-xs', done ? 'text-soft-text line-through' : 'text-soft-muted')}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
