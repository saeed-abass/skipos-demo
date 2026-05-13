import { cn } from '@/lib/utils'
import type { JobStatus, WTNStatus, SkipStatus, Condition, Role } from '@/types'

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted'
  | 'orange'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  muted: 'bg-slate-100 text-slate-500',
  orange: 'bg-orange-100 text-orange-700',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────
// Domain-specific badge helpers
// ─────────────────────────────────────────────────────────

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const config: Record<JobStatus, { label: string; variant: BadgeVariant }> = {
    PENDING: { label: 'Pending', variant: 'warning' },
    SCHEDULED: { label: 'Scheduled', variant: 'info' },
    IN_PROGRESS: { label: 'In Progress', variant: 'orange' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    CANCELLED: { label: 'Cancelled', variant: 'danger' },
  }
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function WTNStatusBadge({ status }: { status: WTNStatus }) {
  const config: Record<WTNStatus, { label: string; variant: BadgeVariant }> = {
    DRAFT: { label: 'Draft', variant: 'muted' },
    SIGNED: { label: 'Signed', variant: 'success' },
    SUBMITTED: { label: 'Submitted', variant: 'info' },
    ACCEPTED: { label: 'Accepted', variant: 'success' },
    REJECTED: { label: 'Rejected', variant: 'danger' },
  }
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function SkipStatusBadge({ status }: { status: SkipStatus }) {
  const config: Record<SkipStatus, { label: string; variant: BadgeVariant }> = {
    IN_YARD: { label: 'In Yard', variant: 'success' },
    ON_SITE: { label: 'On Site', variant: 'orange' },
    AT_TIP: { label: 'At Tip', variant: 'info' },
  }
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function ConditionBadge({ condition }: { condition: Condition }) {
  const config: Record<Condition, { label: string; variant: BadgeVariant }> = {
    GOOD: { label: 'Good', variant: 'success' },
    FAIR: { label: 'Fair', variant: 'warning' },
    POOR: { label: 'Poor', variant: 'danger' },
  }
  const { label, variant } = config[condition]
  return <Badge variant={variant}>{label}</Badge>
}

export function RoleBadge({ role }: { role: Role }) {
  const config: Record<Role, { label: string; variant: BadgeVariant }> = {
    ADMIN: { label: 'Admin', variant: 'orange' },
    OFFICE: { label: 'Office', variant: 'info' },
    DRIVER: { label: 'Driver', variant: 'default' },
  }
  const { label, variant } = config[role]
  return <Badge variant={variant}>{label}</Badge>
}
