import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, StatCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableHead, TableHeader,
  TableRow, TableCell, EmptyTableRow,
} from '@/components/ui/table'

export const metadata: Metadata = { title: 'Dashboard' }

// ─────────────────────────────────────────────────────────
// Inline SVG icons for stat cards
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
// Dashboard
// ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="px-4 pb-6">

      {/* ── Row 1: Stat cards ──────────────────────────────
          pt-8 provides clearance for the floating icon boxes
          that protrude 1.5rem (24px) above each card top edge.
      ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 pt-8 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Jobs"
          value={0}
          change="No data yet"
          changeType="neutral"
          icon={<ClipboardIcon />}
          iconGradient="orange"
        />
        <StatCard
          title="Active Skips"
          value={0}
          change="No data yet"
          changeType="neutral"
          icon={<TruckIcon />}
          iconGradient="navy"
        />
        <StatCard
          title="Pending WTNs"
          value={0}
          change="No data yet"
          changeType="neutral"
          icon={<DocumentIcon />}
          iconGradient="info"
        />
        <StatCard
          title="This Month Revenue"
          value="£0"
          change="No data yet"
          changeType="neutral"
          icon={<CurrencyIcon />}
          iconGradient="success"
        />
      </div>

      {/* ── Row 2: Recent Jobs + Quick Actions ─────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent Jobs — 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Jobs"
              description="Latest 5 jobs across all types"
              action={
                <Link href="/jobs" className="text-xs font-semibold text-orange-500 hover:text-orange-600">
                  View all →
                </Link>
              }
            />
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
                <EmptyTableRow
                  colSpan={6}
                  message="No jobs yet — create your first job"
                />
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Quick Actions — 1/3 width */}
        <div>
          <Card className="h-full">
            <CardHeader title="Quick Actions" />
            <CardContent>
              <div className="space-y-2.5">
                <Button className="w-full" size="sm">+ New Job</Button>
                <Button variant="secondary" className="w-full" size="sm">+ New Customer</Button>
                <Button variant="secondary" className="w-full" size="sm">+ New WTN</Button>
              </div>

              <div className="my-5 border-t border-gray-100" />

              {/* Today's schedule */}
              <div>
                <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
                  Today&apos;s Schedule
                </p>
                <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mb-2 h-8 w-8 text-soft-muted/40">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <p className="text-sm text-soft-muted">No jobs scheduled today</p>
                </div>
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
            {[
              { label: 'In Yard',  count: 0, badge: 'muted'   as const },
              { label: 'On Site',  count: 0, badge: 'orange'  as const },
              { label: 'At Tip',   count: 0, badge: 'info'    as const },
            ].map(({ label, count, badge }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={badge}>{label}</Badge>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-soft-text">{count}</span>
                  <span className="ml-1 text-xs text-soft-muted">skips</span>
                </div>
              </div>
            ))}

            <p className="pt-1 text-center text-xs text-soft-muted">
              Add skips in{' '}
              <Link href="/fleet" className="font-semibold text-orange-500 hover:underline">
                Fleet
              </Link>{' '}
              to see live status
            </p>
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
                  <p className="mt-0.5 text-xs text-soft-muted">
                    DEFRA mandate · Oct 2026
                  </p>
                </div>
                <Badge variant="orange">Setup Required</Badge>
              </div>

              <p className="mt-3 text-xs text-soft-muted leading-relaxed">
                EA-registered carriers must submit Waste Transfer Notes digitally
                from October 2026. Configure your EA registration number and
                disposal sites now to be compliant ahead of the deadline.
              </p>

              <Link
                href="/settings"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                Configure now
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {[
                { label: 'EA Registration Number', done: false },
                { label: 'Disposal site configured',  done: false },
                { label: 'Carrier details added',      done: false },
                { label: 'First WTN created',          done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : 'border-2 border-gray-200'}`}>
                    {done && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5 text-white">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-xs ${done ? 'text-soft-text line-through' : 'text-soft-muted'}`}>{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
