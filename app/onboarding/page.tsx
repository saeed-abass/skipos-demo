import type { Metadata } from 'next'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export const metadata: Metadata = { title: 'Welcome to SkipOS' }

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-bg px-4 py-8">
      <OnboardingWizard />
    </div>
  )
}
