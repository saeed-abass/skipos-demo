'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { updateCompany, createSkip } from '@/lib/actions/company'
import type { SkipSize } from '@/types'
import { SKIP_SIZE_LABELS } from '@/types'

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const TOTAL_STEPS = 4
const STORAGE_KEY = 'skipos_onboarding_complete'

const inputClass =
  'w-full rounded-btn border border-gray-200 bg-white px-3 py-2.5 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

const errorInputClass = 'border-red-400 focus:ring-red-300 focus:border-red-400'
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-soft-muted'

// ─────────────────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100
  return (
    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-1 bg-gradient-orange rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────

const STEP_LABELS = ['Welcome', 'Compliance', 'Your Skips', 'Done']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div key={num} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                done  ? 'bg-green-500 text-white' :
                active ? 'bg-gradient-orange text-white shadow-soft' :
                         'bg-gray-100 text-soft-muted'
              )}
            >
              {done ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              ) : num}
            </div>
            <span className={cn(
              'text-[0.6rem] font-semibold uppercase tracking-wide',
              active ? 'text-orange-500' : 'text-soft-muted'
            )}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Step 1: Welcome
// ─────────────────────────────────────────────────────────

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="animate-fade-slide-up space-y-5 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-orange shadow-soft">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-soft-text">Welcome to SkipOS!</h2>
        <p className="mt-2 text-sm text-soft-muted leading-relaxed max-w-xs mx-auto">
          Let&apos;s get your account set up in a few quick steps so you can start managing jobs and staying compliant.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-left">
        {[
          { icon: '📋', label: 'Jobs & Scheduling' },
          { icon: '📄', label: 'Digital WTNs' },
          { icon: '🚛', label: 'Fleet Tracking' },
        ].map(({ icon, label }) => (
          <div key={label} className="rounded-lg bg-gray-50 px-3 py-3 text-center">
            <div className="text-xl">{icon}</div>
            <p className="mt-1 text-xs font-semibold text-soft-text">{label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="inline-flex w-full items-center justify-center gap-2 rounded-btn bg-gradient-orange py-2.5 text-sm font-bold text-white shadow-soft hover:shadow-md transition-all"
      >
        Get Started
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Step 2: EA Registration
// ─────────────────────────────────────────────────────────

function Step2({
  onNext,
  onSkip,
}: {
  onNext: (eaNumber: string) => Promise<void>
  onSkip: () => Promise<void>
}) {
  const [eaNumber, setEaNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!eaNumber.trim()) { setError('Please enter your EA registration number'); return }
    setSaving(true)
    try {
      await onNext(eaNumber.trim().toUpperCase())
    } catch {
      setError('Failed to save. Please try again.')
      setSaving(false)
    }
  }

  async function handleSkip() {
    setSaving(true)
    try { await onSkip() } catch { setSaving(false) }
  }

  return (
    <div className="animate-fade-slide-up space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-sm">📄</span>
          <h2 className="text-lg font-bold text-soft-text">Environment Agency Registration</h2>
        </div>
        <p className="text-sm text-soft-muted leading-relaxed">
          EA-registered waste carriers must submit Waste Transfer Notes digitally from October 2026. Add your registration number to stay compliant.
        </p>
      </div>

      <div className="rounded-lg border border-orange-100 bg-orange-50 px-4 py-3">
        <p className="text-xs font-semibold text-orange-700">DEFRA Digital Mandate · Oct 2026</p>
        <p className="mt-0.5 text-xs text-orange-600 leading-relaxed">
          Configure now to have WTN submission ready before the deadline.
        </p>
      </div>

      <div>
        <label className={labelClass}>EA Registration Number</label>
        <input
          type="text"
          value={eaNumber}
          onChange={e => { setEaNumber(e.target.value.toUpperCase()); setError('') }}
          placeholder="e.g. CBDU12345"
          className={cn(inputClass, error && errorInputClass)}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        <p className="mt-1 text-xs text-soft-muted">
          Find this on your EA waste carrier registration certificate.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-btn bg-gradient-orange py-2.5 text-sm font-bold text-white shadow-soft hover:shadow-md disabled:opacity-70 transition-all"
        >
          {saving && (
            <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Save &amp; Continue
        </button>
        <button
          onClick={handleSkip}
          disabled={saving}
          className="rounded-btn border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-soft-muted hover:bg-gray-50 disabled:opacity-50 transition-all"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Step 3: Add first skip
// ─────────────────────────────────────────────────────────

function Step3({
  onNext,
  onSkip,
}: {
  onNext: (skipNumber: string, size: SkipSize) => Promise<void>
  onSkip: () => void
}) {
  const [skipNumber, setSkipNumber] = useState('')
  const [size, setSize] = useState<SkipSize | ''>('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ skipNumber?: string; size?: string }>({})

  async function handleSave() {
    const e: typeof errors = {}
    if (!skipNumber.trim()) e.skipNumber = 'Required'
    if (!size) e.size = 'Required'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    try {
      await onNext(skipNumber.trim(), size as SkipSize)
    } catch {
      setErrors({ skipNumber: 'That skip number may already exist. Try a different one.' })
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-slide-up space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm">🚛</span>
          <h2 className="text-lg font-bold text-soft-text">Add Your First Skip</h2>
        </div>
        <p className="text-sm text-soft-muted leading-relaxed">
          Register a skip so you can assign it to jobs and track its location in real time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Skip Number / ID</label>
          <input
            type="text"
            value={skipNumber}
            onChange={e => { setSkipNumber(e.target.value.toUpperCase()); setErrors(p => ({ ...p, skipNumber: undefined })) }}
            placeholder="e.g. SKIP-001"
            className={cn(inputClass, errors.skipNumber && errorInputClass)}
          />
          {errors.skipNumber && <p className="mt-0.5 text-xs text-red-500">{errors.skipNumber}</p>}
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Skip Size</label>
          <select
            value={size}
            onChange={e => { setSize(e.target.value as SkipSize); setErrors(p => ({ ...p, size: undefined })) }}
            className={cn(inputClass, errors.size && errorInputClass)}
          >
            <option value="">Select size…</option>
            {(Object.entries(SKIP_SIZE_LABELS) as [SkipSize, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          {errors.size && <p className="mt-0.5 text-xs text-red-500">{errors.size}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-btn bg-gradient-orange py-2.5 text-sm font-bold text-white shadow-soft hover:shadow-md disabled:opacity-70 transition-all"
        >
          {saving && (
            <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Add Skip &amp; Continue
        </button>
        <button
          onClick={onSkip}
          disabled={saving}
          className="rounded-btn border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-soft-muted hover:bg-gray-50 disabled:opacity-50 transition-all"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Step 4: All done
// ─────────────────────────────────────────────────────────

function Step4({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="animate-fade-slide-up space-y-5 text-center">
      <div className="mx-auto animate-scale-in flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg viewBox="0 0 52 52" className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 27 l10 10 l14-18" className="animate-checkmark" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-soft-text">You&apos;re all set!</h2>
        <p className="mt-2 text-sm text-soft-muted leading-relaxed max-w-xs mx-auto">
          Your SkipOS account is ready. Head to the dashboard to create your first job.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 text-left">
        {[
          { label: 'Account created', done: true },
          { label: 'Compliance configured', done: true },
          { label: 'Fleet registered', done: true },
        ].map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-4 py-2.5">
            <div className={cn(
              'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
              done ? 'bg-green-500' : 'border-2 border-gray-200'
            )}>
              {done && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-white">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-sm text-soft-text">{label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onFinish}
        className="inline-flex w-full items-center justify-center gap-2 rounded-btn bg-gradient-orange py-2.5 text-sm font-bold text-white shadow-soft hover:shadow-md transition-all"
      >
        Go to Dashboard
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Wizard
// ─────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  function next() { setStep(s => s + 1) }

  async function handleEASave(eaNumber: string) {
    await updateCompany({ ea_registration: eaNumber })
    next()
  }

  async function handleEASkip() {
    await updateCompany({ ea_registration: '' })
    next()
  }

  async function handleSkipAdd(skipNumber: string, size: SkipSize) {
    await createSkip({ skip_number: skipNumber, size })
    next()
  }

  function handleSkipSkip() {
    // Mark ea_registration as seen if not already done via step 2
    // No DB write needed here — just advance
    next()
  }

  function handleFinish() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    router.replace('/dashboard')
  }

  return (
    <div className="w-full max-w-md">
      <div className="overflow-hidden rounded-card bg-white shadow-soft-md">
        {/* Header */}
        <div className="bg-gradient-navy px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-xs text-white/60">{Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100)}% complete</span>
          </div>
          <ProgressBar step={step} />
          <div className="mt-4">
            <StepIndicator current={step} />
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 && <Step1 onNext={next} />}
          {step === 2 && <Step2 onNext={handleEASave} onSkip={handleEASkip} />}
          {step === 3 && <Step3 onNext={handleSkipAdd} onSkip={handleSkipSkip} />}
          {step === 4 && <Step4 onFinish={handleFinish} />}
        </div>
      </div>
    </div>
  )
}
