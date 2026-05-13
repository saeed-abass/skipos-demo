'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { checkNeedsOnboarding } from '@/lib/actions/company'

const STORAGE_KEY = 'skipos_onboarding_complete'

export function OnboardingGate() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/onboarding') return

    // Fast path: already completed
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true') return

    checkNeedsOnboarding().then(needs => {
      if (needs) router.replace('/onboarding')
    }).catch(() => {
      // Non-fatal: if check fails, don't block the user
    })
  }, [pathname, router])

  return null
}
