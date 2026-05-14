'use client'

import { useToast } from '@/components/ui/toast'

const STARTER_FEATURES = [
  { label: 'Up to 5 team members',          included: true },
  { label: 'Unlimited jobs and customers',   included: true },
  { label: 'Digital WTN creation',           included: true },
  { label: 'DEFRA compliance tracking',      included: true },
  { label: 'EA direct submission (Coming soon)', included: false },
  { label: 'Multi-depot support (Pro plan)', included: false },
  { label: 'API access (Pro plan)',          included: false },
]

const PRO_FEATURES = [
  'Unlimited team members',
  'EA direct submission',
  'PDF WTN export',
  'Priority support',
]

const ENTERPRISE_FEATURES = [
  'Multi-depot support',
  'API access',
  'Dedicated account manager',
  'Custom integrations',
]

export function BillingSection() {
  const { showToast } = useToast()

  return (
    <div className="rounded-card bg-white p-6 shadow-soft">
      {/* Header */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-soft-text">Billing and Subscription</h3>
        <p className="mt-1 text-sm text-soft-muted">Manage your SkipOS plan and payment details</p>
      </div>

      {/* Current plan */}
      <div className="mb-6 rounded-card bg-gradient-navy p-6 text-white">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-white/60">Current Plan</p>
          <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
            FREE TRIAL
          </span>
        </div>
        <h4 className="mt-2 text-2xl font-bold">Starter</h4>
        <ul className="mt-4 space-y-1.5">
          {STARTER_FEATURES.map(f => (
            <li key={f.label} className="flex items-center gap-2 text-sm">
              <span className={f.included ? 'text-green-400' : 'text-white/40'}>
                {f.included ? '✓' : '✗'}
              </span>
              <span className={f.included ? 'text-white/80' : 'text-white/40'}>{f.label}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() =>
            showToast({
              type: 'info',
              title: 'Pro plan coming soon',
              message: 'Contact hello@skipos.co.uk to join the waitlist.',
            })
          }
          className="mt-4 rounded-btn bg-orange-500 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600"
        >
          Upgrade to Pro
        </button>
      </div>

      {/* Upcoming plans */}
      <div>
        <h4 className="mb-4 text-sm font-semibold text-soft-text">Coming Soon</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Pro */}
          <div className="rounded-card border-2 border-orange-200 p-4">
            <p className="font-bold text-soft-text">Pro</p>
            <p className="mt-1 text-2xl font-black text-orange-500">
              £49<span className="text-sm font-normal text-soft-muted">/mo</span>
            </p>
            <ul className="mt-3 space-y-1">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-soft-muted">
                  <span className="text-orange-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                showToast({
                  type: 'info',
                  title: 'Added to waitlist',
                  message: 'We will be in touch soon.',
                })
              }
              className="mt-4 w-full rounded-btn border-2 border-orange-300 px-4 py-2 text-sm font-bold text-orange-500 transition-colors hover:bg-orange-50"
            >
              Join Waitlist
            </button>
          </div>

          {/* Enterprise */}
          <div className="rounded-card border-2 border-gray-200 p-4">
            <p className="font-bold text-soft-text">Enterprise</p>
            <p className="mt-1 text-2xl font-black text-soft-muted">Custom</p>
            <ul className="mt-3 space-y-1">
              {ENTERPRISE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-soft-muted">
                  <span className="text-gray-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:hello@skipos.co.uk"
              className="mt-4 block w-full rounded-btn border border-gray-200 px-4 py-2 text-center text-sm font-bold text-soft-text transition-colors hover:bg-gray-50"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
