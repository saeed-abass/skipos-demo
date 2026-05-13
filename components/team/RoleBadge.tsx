import { cn } from '@/lib/utils'
import type { Role } from '@/types'

const STYLES: Record<Role, string> = {
  ADMIN:  'bg-navy/10 text-navy font-bold',
  OFFICE: 'bg-blue-100 text-blue-700',
  DRIVER: 'bg-orange-100 text-orange-700',
}

const LABELS: Record<Role, string> = {
  ADMIN:  'Admin',
  OFFICE: 'Office',
  DRIVER: 'Driver',
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs',
      STYLES[role as Role] ?? STYLES.DRIVER,
      className,
    )}>
      {LABELS[role as Role] ?? role}
    </span>
  )
}
