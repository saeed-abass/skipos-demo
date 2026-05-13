import { cn } from '@/lib/utils'

// Soft UI table — white card wrapper, no outer border, airy separators

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50/80">
      {children}
    </thead>
  )
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableRow({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-gray-50 transition-colors',
        onClick && 'cursor-pointer hover:bg-gray-50/50',
        className
      )}
    >
      {children}
    </tr>
  )
}

export function TableHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted',
        className
      )}
    >
      {children}
    </th>
  )
}

export function TableCell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td className={cn('px-6 py-4 text-sm text-soft-text', className)}>
      {children}
    </td>
  )
}

export function EmptyTableRow({
  colSpan,
  message = 'No records found.',
}: {
  colSpan: number
  message?: string
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16 text-center text-sm text-soft-muted">
        {message}
      </td>
    </tr>
  )
}
