'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { updatePassword } from '@/lib/actions/auth'

const inputClass =
  'w-full rounded-btn border border-gray-200 bg-white px-3 py-2.5 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

const errorInputClass = 'border-red-400 focus:ring-red-300 focus:border-red-400'

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
const STRENGTH_TEXT: Record<number, string> = {
  1: 'text-red-500',
  2: 'text-yellow-600',
  3: 'text-green-600',
}

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-soft-muted hover:text-soft-text transition-colors"
      tabIndex={-1}
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

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [success, setSuccess] = useState(false)

  const strength = getPasswordStrength(password)
  const passwordsMatch = confirm.length > 0 && password === confirm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setErrorKey(k => k + 1)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      setErrorKey(k => k + 1)
      return
    }
    setLoading(true)
    setError('')
    const result = await updatePassword(password)
    if (result.error) {
      setError(result.error)
      setErrorKey(k => k + 1)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-card bg-white p-8 shadow-soft-md text-center">
          <div className="mx-auto mb-4 animate-scale-in flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg viewBox="0 0 52 52" className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 27 l10 10 l14-18" className="animate-checkmark" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-soft-text">Password updated</h2>
          <p className="mt-2 text-sm text-soft-muted">Redirecting you to the dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card bg-white p-8 shadow-soft-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-soft-text">Set new password</h1>
          <p className="mt-1 text-sm text-soft-muted">Choose a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* New Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-soft-text">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className={cn(inputClass, 'pr-10')}
              />
              <EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </div>
            {password && (
              <div className="mt-1.5">
                <div className="h-1 w-full rounded-full bg-gray-100">
                  <div className={cn('h-1 rounded-full transition-all duration-300', STRENGTH_BAR[strength.level])} />
                </div>
                <p className={cn('mt-1 text-xs font-medium', STRENGTH_TEXT[strength.level])}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-soft-text">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                className={cn(inputClass, 'pr-10', confirm.length > 0 && !passwordsMatch && errorInputClass)}
              />
              <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
              {confirm.length > 0 && (
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-btn bg-gradient-orange py-2.5 text-sm font-bold text-white shadow-soft hover:shadow-md disabled:opacity-70 transition-all"
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Updating…' : 'Update Password'}
          </button>

          {error && (
            <div key={errorKey} className="animate-shake rounded-btn bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
