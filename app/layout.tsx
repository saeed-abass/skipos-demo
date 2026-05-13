import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'SkipOS',
    template: '%s | SkipOS',
  },
  description: 'UK skip hire operations management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-soft-bg antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
