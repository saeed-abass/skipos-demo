'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { resetPassword } from '@/lib/actions/auth'

const inputClass =
  'w-full rounded-btn border border-gray-200 bg-white px-3 py-2.5 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    await resetPassword(email.trim())
    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-card bg-white p-8 shadow-soft-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-soft-text">Check your email</h2>
          <p className="mt-2 text-sm text-soft-muted leading-relaxed">
            If an account exists for <span className="font-medium text-soft-text">{email}</span>,
            you&apos;ll receive a password reset link shortly.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card bg-white p-8 shadow-soft-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-soft-text">Reset your password</h1>
          <p className="mt-1 text-sm text-soft-muted">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-soft-text">Email address</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@yourcompany.co.uk"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-btn bg-gradient-orange py-2.5 text-sm font-bold text-white shadow-soft hover:shadow-md disabled:opacity-70 transition-all"
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/login" className="text-sm text-soft-muted hover:text-soft-text transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
