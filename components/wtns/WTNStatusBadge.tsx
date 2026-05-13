import { cn } from '@/lib/utils'
import type { WTNStatus } from '@/types'
import { WTN_STATUS_LABELS } from '@/types'

const STATUS_CONFIG: Record<WTNStatus, string> = {
  DRAFT:     'bg-slate-100 text-slate-600',
  SIGNED:    'bg-blue-100 text-blue-700',
  SUBMITTED: 'bg-purple-100 text-purple-700',
  ACCEPTED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-600',
}

export function WTNStatusBadge({ status }: { status: WTNStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1',
        'text-[0.65rem] font-bold uppercase tracking-[0.05em]',
        STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT
      )}
    >
      {WTN_STATUS_LABELS[status] ?? status}
    </span>
  )
}
