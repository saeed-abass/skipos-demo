import { SidebarProvider, Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { OnboardingGate } from '@/components/layout/OnboardingGate'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <OnboardingGate />
      <Sidebar />
      <div className="ml-0 min-h-screen lg:ml-[274px]">
        <Topbar />
        <main>{children}</main>
      </div>
    </SidebarProvider>
  )
}
