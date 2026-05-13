import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notifications' }

export default function NotificationsPage() {
  return (
    <div className="px-4 pb-6 pt-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-soft-text">Notifications</h2>
        <p className="mt-0.5 text-sm text-soft-muted">Job updates and system alerts</p>
      </div>

      <div className="rounded-card bg-white p-12 text-center shadow-soft">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="mx-auto mb-4 h-12 w-12 text-soft-muted/40"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p className="text-lg font-semibold text-soft-text">No notifications yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-soft-muted">
          When jobs are updated, drivers check in, or compliance deadlines approach, alerts will appear here.
        </p>
      </div>
    </div>
  )
}
