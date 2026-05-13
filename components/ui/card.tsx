import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────
// Base card primitives
// ─────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-card shadow-soft', className)}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-4 border-b border-gray-100', className)}>
      <div>
        <h3 className="text-sm font-semibold text-soft-text">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-soft-muted">{description}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  )
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-3', className)}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// StatCard — Soft UI floating-icon design
// The icon box protrudes 1.5rem above the card top edge.
// Parent grid/container must have pt-6 to make room for it.
// ─────────────────────────────────────────────────────────

type IconGradient = 'orange' | 'navy' | 'info' | 'success'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  iconGradient?: IconGradient
}

const iconGradientClass: Record<IconGradient, string> = {
  orange:  'bg-gradient-orange',
  navy:    'bg-gradient-navy',
  info:    'bg-gradient-info',
  success: 'bg-gradient-success',
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconGradient = 'orange',
}: StatCardProps) {
  return (
    <div className="relative bg-white rounded-card shadow-soft overflow-visible">
      {/* Floating icon box — protrudes above the card */}
      <div
        className={cn(
          'absolute -top-6 left-4 flex h-16 w-16 items-center justify-center rounded-xl text-white shadow-lg',
          iconGradientClass[iconGradient]
        )}
      >
        {icon}
      </div>

      {/* Stat values — right-aligned, with top padding to clear the icon area */}
      <div className="px-4 pt-4 pb-2 text-right">
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
          {title}
        </p>
        <h3 className="mt-0.5 text-2xl font-bold text-soft-text">{value}</h3>
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-1.5 border-t border-gray-100 px-4 py-2.5">
        {change && (
          <span
            className={cn(
              'text-xs font-semibold',
              changeType === 'up'
                ? 'text-green-500'
                : changeType === 'down'
                ? 'text-red-500'
                : 'text-soft-muted'
            )}
          >
            {change}
          </span>
        )}
        <span className="text-xs text-soft-muted">Since last month</span>
      </div>
    </div>
  )
}
