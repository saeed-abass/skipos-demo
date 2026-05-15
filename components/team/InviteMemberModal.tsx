'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { inviteTeamMember } from '@/lib/actions/team'
import { useToast } from '@/components/ui/toast'
import type { Role } from '@/types'

const inputClass =
  'w-full rounded-btn border border-gray-200 bg-white px-3 py-2.5 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

const errorInputClass = 'border-red-400 focus:ring-red-300 focus:border-red-400'
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-soft-muted'

// ─────────────────────────────────────────────────────────
// Role options
// ─────────────────────────────────────────────────────────

type RoleOption = {
  role: Role
  label: string
  description: string
  icon: string
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'ADMIN',
    label: 'Admin',
    description: 'Manage everything including billing and team settings',
    icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  },
  {
    role: 'OFFICE',
    label: 'Office Staff',
    description: 'Create jobs, manage customers and generate WTNs',
    icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z',
  },
  {
    role: 'DRIVER',
    label: 'Driver',
    description: 'View and update their assigned jobs only',
    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
  },
]

const ROLE_ICON_COLOR: Record<Role, string> = {
  ADMIN:  'text-navy',
  OFFICE: 'text-blue-600',
  DRIVER: 'text-orange-500',
}

// ─────────────────────────────────────────────────────────
// Success overlay
// ─────────────────────────────────────────────────────────

function SuccessOverlay({
  email,
  onInviteAnother,
  onDone,
}: {
  email: string
  onInviteAnother: () => void
  onDone: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 text-center">
      <div className="animate-scale-in flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg viewBox="0 0 52 52" className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 27 l10 10 l14-18" className="animate-checkmark" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-soft-text">Invite sent!</p>
        <p className="mt-1 text-sm text-soft-muted">
          An email has been sent to <span className="font-semibold text-soft-text">{email}</span> with
          a link to set their password and join your team.
        </p>
      </div>
      <div className="mt-2 flex flex-col items-center gap-2">
        <button
          onClick={onInviteAnother}
          className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          Invite another member →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────

interface InviteMemberModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type FormState = { name: string; email: string; role: Role }
type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL: FormState = { name: '', email: '', role: 'DRIVER' }

function validate(form: FormState): FormErrors {
  const e: FormErrors = {}
  if (!form.name.trim())  e.name  = 'Full name is required'
  if (!form.email.trim()) e.email = 'Email address is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
  return e
}

export function InviteMemberModal({
  open,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successEmail, setSuccessEmail] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(INITIAL)
      setErrors({})
      setServerError('')
      setSubmitting(false)
      setSuccessEmail(null)
      setHasChanges(false)
      setConfirmDiscard(false)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (hasChanges) { setConfirmDiscard(true) } else { onClose() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, hasChanges, onClose])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
    setHasChanges(true)
  }

  function resetForAnother() {
    setForm(INITIAL)
    setErrors({})
    setServerError('')
    setSuccessEmail(null)
    setHasChanges(false)
    setConfirmDiscard(false)
  }

  async function handleSubmit() {
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitting(true)
    setServerError('')
    try {
      const result = await inviteTeamMember({
        email: form.email.trim(),
        name: form.name.trim(),
        role: form.role,
      })
      if (result?.error) {
        setServerError(result.error)
        return
      }
      setSuccessEmail(form.email.trim())
      showToast({
        type: 'success',
        title: 'Invite sent',
        message: `${form.name.trim()} has been invited to join your team`,
      })
      onSuccess()
    } catch {
      setServerError('Failed to send invite. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm sm:items-start sm:justify-center sm:overflow-y-auto sm:px-4 sm:pb-8 sm:pt-16">
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-soft-md sm:max-h-none sm:max-w-lg sm:rounded-card">

          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between bg-gradient-orange px-6 py-5">
            <div>
              <h2 className="text-base font-bold text-white">Invite Team Member</h2>
              <p className="mt-0.5 text-xs text-white/80">
                They will receive an email to set their password and join your team
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
          {successEmail ? (
            <SuccessOverlay
              email={successEmail}
              onInviteAnother={resetForAnother}
              onDone={onClose}
            />
          ) : (
            <div className="space-y-4 p-6">

              {/* Full Name */}
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. John Smith"
                  className={cn(inputClass, errors.name && errorInputClass)}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="e.g. john@yourcompany.co.uk"
                  className={cn(inputClass, errors.email && errorInputClass)}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Role */}
              <div>
                <label className={labelClass}>Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map(o => (
                    <button
                      key={o.role}
                      type="button"
                      onClick={() => set('role', o.role)}
                      className={cn(
                        'rounded-card border-2 p-3 text-left transition-all',
                        form.role === o.role
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-gray-300',
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={cn('mb-1.5 h-5 w-5', ROLE_ICON_COLOR[o.role])}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={o.icon} />
                      </svg>
                      <p className="text-xs font-semibold text-soft-text">{o.label}</p>
                      <p className="mt-0.5 text-[0.6rem] leading-tight text-soft-muted">{o.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin warning */}
              {form.role === 'ADMIN' && (
                <div className="rounded-btn border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Heads up:</span> Admin members have full access
                    including billing and the ability to remove other members.
                    Only invite trusted individuals.
                  </p>
                </div>
              )}

              {serverError && (
                <div className="rounded-btn bg-red-50 px-4 py-3 text-sm text-red-600">
                  {serverError}
                </div>
              )}
            </div>
          )}
          </div>

          {/* Footer */}
          {!successEmail && (
            confirmDiscard ? (
              <div className="flex-shrink-0 flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-sm font-semibold text-soft-text">You have unsaved changes.</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-btn border border-red-300 px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-red-600 hover:bg-red-50 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => setConfirmDiscard(false)}
                    className="inline-flex items-center justify-center rounded-btn bg-gradient-orange px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
                  >
                    Keep editing
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() => { hasChanges ? setConfirmDiscard(true) : onClose() }}
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-btn border border-gray-200 bg-white px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-soft-text shadow-soft hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-btn bg-gradient-orange px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md disabled:opacity-70 transition-all"
                >
                  {submitting && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {submitting ? 'Sending…' : 'Send Invite'}
                </button>
              </div>
            )
          )}

          {/* Success footer */}
          {successEmail && (
            <div className="flex-shrink-0 flex items-center justify-end border-t border-gray-100 px-6 py-4">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-btn bg-gradient-orange px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
              >
                Done
              </button>
            </div>
          )}

      </div>
    </div>
  )
}
