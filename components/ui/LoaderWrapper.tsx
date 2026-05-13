'use client'

import { usePageLoader } from '@/hooks/usePageLoader'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { PageLoader } from '@/components/ui/PageLoader'

export function LoaderWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = usePageLoader()
  useKeyboardShortcuts()
  return (
    <>
      <PageLoader visible={loading} />
      {children}
    </>
  )
}
