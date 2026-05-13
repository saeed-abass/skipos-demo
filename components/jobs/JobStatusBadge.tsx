import { cn } from '@/lib/utils'
import type { JobStatus } from '@/types'

const STATUS_CONFIG: Record<JobStatus, { label: string; classes: string }> = {
  PENDING:     { label: 'Pending',     classes: 'bg-slate-100 text-slate-600' },
  SCHEDULED:   { label: 'Scheduled',   classes: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'In Progress', classes: 'bg-orange-100 text-orange-700' },
  COMPLETED:   { label: 'Completed',   classes: 'bg-green-100 text-green-700' },
  CANCELLED:   { label: 'Cancelled',   classes: 'bg-red-100 text-red-600' },
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const { label, classes } = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1',
        'text-[0.65rem] font-bold uppercase tracking-[0.05em]',
        classes
      )}
    >
      {label}
    </span>
  )
}
