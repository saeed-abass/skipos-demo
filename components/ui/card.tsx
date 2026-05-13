import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
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
    <div className={cn('flex items-start justify-between px-6 py-4 border-b border-slate-100', className)}>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
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
    <div
      className={cn(
        'flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-3',
        className
      )}
    >
      {children}
    </div>
  )
}

// Stat card — used on the dashboard
interface StatCardProps {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
}

export function StatCard({ label, value, delta, deltaType = 'neutral', icon }: StatCardProps) {
  const deltaColour =
    deltaType === 'positive'
      ? 'text-green-600'
      : deltaType === 'negative'
      ? 'text-red-600'
      : 'text-slate-500'

  return (
    <Card className="flex items-start gap-4 p-5">
      {icon && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
        {delta && <p className={cn('mt-1 text-xs font-medium', deltaColour)}>{delta}</p>}
      </div>
    </Card>
  )
}
