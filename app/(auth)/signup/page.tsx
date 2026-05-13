'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { signUp } from '@/lib/actions/auth'

const inputClass =
  'w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

const errorInputClass = 'border-red-400 focus:ring-red-300 focus:border-red-400'
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-soft-muted'

// ─────────────────────────────────────────────────────────
// Password strength
// ─────────────────────────────────────────────────────────

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (!pw) return { level: 0, label: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[0-9!@#$%^&*]/.test(pw)) score++
  if (score === 0) return { level: 1, label: 'Weak' }
  if (score === 1) return { level: 2, label: 'Fair' }
  return { level: 3, label: 'Strong' }
}

const STRENGTH_BAR: Record<number, string> = {
  1: 'w-1/3 bg-red-400',
  2: 'w-2/3 bg-yellow-400',
  3: 'w-full bg-green-500',
}

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-soft-muted hover:text-soft-text transition-colors"
      tabIndex={-1}
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  )
}


type FormState = {
  companyName: string
  email: string
  phone: string
  address: string
  postcode: string
  password: string
  confirmPassword: string
  agreedToTerms: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL: FormState = {
  companyName: '', email: '', phone: '',
  address: '', postcode: '',
  password: '', confirmPassword: '',
  agreedToTerms: false,
}

function validate(form: FormState): FormErrors {
  const e: FormErrors = {}
  if (!form.companyName.trim()) e.companyName = 'Required'
  if (!form.email.trim()) e.email = 'Required'
  if (!form.address.trim()) e.address = 'Required'
  if (!form.postcode.trim()) e.postcode = 'Required'
  if (!form.password) e.password = 'Required'
  else if (form.password.length < 8) e.password = 'Min. 8 characters'
  if (!form.confirmPassword) e.confirmPassword = 'Required'
  else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
  if (!form.agreedToTerms) e.agreedToTerms = 'Required'
  return e
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [errorKey, setErrorKey] = useState(0)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const strength = getPasswordStrength(form.password)
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    setServerError('')
    const result = await signUp({
      email: form.email.trim(),
      password: form.password,
      companyName: form.companyName.trim(),
      phone: form.phone.trim() || undefined,
      address: form.address.trim(),
      postcode: form.postcode.trim().toUpperCase(),
    })
    if (result.error) {
      setServerError(result.error)
      setErrorKey(k => k + 1)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="w-full max-w-xl">
      <div className="rounded-card bg-white p-6 shadow-soft-md">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-soft-text">Start your free trial</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">

            {/* Company Name — full width */}
            <div className="col-span-2">
              <label className={labelClass}>Company Name *</label>
              <input
                type="text"
                value={form.companyName}
                onChange={e => set('companyName', e.target.value)}
                placeholder="e.g. Acme Skip Hire Ltd"
                className={cn(inputClass, errors.companyName && errorInputClass)}
              />
              {errors.companyName && <p className="mt-0.5 text-xs text-red-500">{errors.companyName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@company.co.uk"
                className={cn(inputClass, errors.email && errorInputClass)}
              />
              {errors.email && <p className="mt-0.5 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="01274 000000"
                className={inputClass}
              />
            </div>

            {/* Address — full width */}
            <div className="col-span-2">
              <label className={labelClass}>Business Address *</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Street address and town"
                className={cn(inputClass, 'resize-none', errors.address && errorInputClass)}
              />
              {errors.address && <p className="mt-0.5 text-xs text-red-500">{errors.address}</p>}
            </div>

            {/* Postcode */}
            <div>
              <label className={labelClass}>Postcode *</label>
              <input
                type="text"
                value={form.postcode}
                onChange={e => set('postcode', e.target.value.toUpperCase())}
                placeholder="BD1 1AA"
                className={cn(inputClass, errors.postcode && errorInputClass)}
              />
              {errors.postcode && <p className="mt-0.5 text-xs text-red-500">{errors.postcode}</p>}
            </div>

            {/* Empty cell to keep grid balanced */}
            <div />

            {/* Password */}
            <div>
              <label className={labelClass}>Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min. 8 characters"
                  className={cn(inputClass, 'pr-10', errors.password && errorInputClass)}
                />
                <EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />
              </div>
              {form.password && (
                <div className="mt-1 h-1 w-full rounded-full bg-gray-100" title={strength.label}>
                  <div className={cn('h-1 rounded-full transition-all duration-300', STRENGTH_BAR[strength.level])} />
                </div>
              )}
              {errors.password && <p className="mt-0.5 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelClass}>Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  className={cn(inputClass, 'pr-10', errors.confirmPassword && errorInputClass)}
                />
                <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                {form.confirmPassword.length > 0 && (
                  <div className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-green-500">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-red-400">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="mt-0.5 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Terms */}
          <div className="mt-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreedToTerms}
                onChange={e => set('agreedToTerms', e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 rounded border-gray-300 text-orange-500 focus:ring-orange-300"
              />
              <span className="text-xs text-soft-muted">
                I agree to the{' '}
                <span className="font-medium text-orange-500 cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="font-medium text-orange-500 cursor-pointer">Privacy Policy</span>
              </span>
            </label>
            {errors.agreedToTerms && <p className="mt-0.5 text-xs text-red-500">{errors.agreedToTerms}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-btn bg-gradient-orange py-2 text-sm font-bold text-white shadow-soft hover:shadow-md disabled:opacity-70 transition-all"
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Creating your account…' : 'Create Account'}
          </button>

          {serverError && (
            <div key={errorKey} className="animate-shake mt-3 rounded-btn bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {serverError}
            </div>
          )}
        </form>

        <p className="mt-4 text-center text-xs text-soft-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
