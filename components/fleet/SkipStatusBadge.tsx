import { cn } from '@/lib/utils'
import type { SkipStatus } from '@/types'

const STYLES: Record<SkipStatus, string> = {
  IN_YARD: 'bg-gray-100 text-gray-600',
  ON_SITE: 'bg-orange-100 text-orange-700',
  AT_TIP:  'bg-blue-100 text-blue-700',
}

const LABELS: Record<SkipStatus, string> = {
  IN_YARD: 'In Yard',
  ON_SITE: 'On Site',
  AT_TIP:  'At Tip',
}

export function SkipStatusBadge({
  status,
  className,
}: {
  status: SkipStatus
  className?: string
}) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      STYLES[status] ?? STYLES.IN_YARD,
      className,
    )}>
      {LABELS[status] ?? status}
    </span>
  )
}
