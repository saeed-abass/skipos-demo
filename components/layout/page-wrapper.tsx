import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn('flex flex-col flex-1 min-h-0 p-4 sm:p-6', className)}>
      {children}
    </div>
  )
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  )
}
