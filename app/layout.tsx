import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { LoaderWrapper } from '@/components/ui/LoaderWrapper'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#F97316',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: {
    default: 'SkipOS',
    template: '%s | SkipOS',
  },
  description:
    'The operating system for skip hire. DEFRA-compliant job scheduling, fleet management, and digital waste tracking for UK operators.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SkipOS',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
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
          <LoaderWrapper>
            {children}
          </LoaderWrapper>
        </ToastProvider>
      </body>
    </html>
  )
}
