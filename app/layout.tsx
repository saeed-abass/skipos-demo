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
      {/*
        Sidebar is fixed (floats at left-4 top-4 bottom-4 on desktop).
        Main content offsets itself with lg:ml-[calc(250px+2rem)] to clear
        the sidebar's right edge (250px wide + 1rem left gap + 1rem right gap).
      */}
      <body className={`${inter.className} bg-soft-bg antialiased`}>
        <SidebarProvider>
          <Sidebar />
          <div className="ml-[274px] min-h-screen">
            <Topbar />
            <main>{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
