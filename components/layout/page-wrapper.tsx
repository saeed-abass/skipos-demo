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

// Consistent padding for section pages (jobs, customers, etc.)
// No top padding — topbar provides mt-4, content starts below it
export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn('px-3 pb-20 lg:px-0 lg:pr-4 lg:pb-4', className)}>
      {children}
    </div>
  )
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="text-lg font-semibold text-soft-text">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-soft-muted">{description}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  )
}
