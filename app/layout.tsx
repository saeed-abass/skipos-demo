import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SidebarProvider, Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'SkipOS',
    template: '%s — SkipOS',
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
      <body className={`${inter.className} bg-[#F8FAFC] text-[#0F172A] antialiased`}>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar — fixed on mobile, in-flow on desktop */}
            <Sidebar />

            {/* Main content column */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
