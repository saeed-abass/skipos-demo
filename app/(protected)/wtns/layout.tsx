import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Waste Transfer Notes' }

export default function WTNsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
