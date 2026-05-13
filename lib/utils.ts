import { clsx, type ClassValue } from 'clsx'

// Merge Tailwind class names (no tailwind-merge needed at this scale)
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

// UK date format: 14/05/2024
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// UK date + time: 14/05/2024 at 09:30
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// UK pounds: £1,250.00
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount)
}

// WTN number format: WTN-2024-00001
// Uses a timestamp-derived sequence for scaffold; real impl uses a DB sequence
export function generateWTNNumber(): string {
  const year = new Date().getFullYear()
  const seq = (Date.now() % 100000).toString().padStart(5, '0')
  return `WTN-${year}-${seq}`
}

// Human-readable skip size labels
export const SKIP_SIZE_LABELS: Record<string, string> = {
  TWO_YARD: '2 Yard',
  FOUR_YARD: '4 Yard',
  SIX_YARD: '6 Yard',
  EIGHT_YARD: '8 Yard',
  TWELVE_YARD: '12 Yard',
  FOURTEEN_YARD: '14 Yard',
  SIXTEEN_YARD: '16 Yard',
  TWENTY_YARD: '20 Yard',
}

export function formatSkipSize(size: string): string {
  return SKIP_SIZE_LABELS[size] ?? size
}

// Truncate long strings for table display
export function truncate(str: string, maxLength = 40): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}
