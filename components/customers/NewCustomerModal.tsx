'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { createCustomer } from '@/lib/actions/customers'
import { useToast } from '@/components/ui/toast'

const inputClass =
  'w-full rounded-btn border border-gray-200 bg-white px-3 py-2.5 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

const errorInputClass = 'border-red-400 focus:ring-red-300 focus:border-red-400'
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-soft-muted'

type FormState = {
  name: string
  phone: string
  email: string
  address: string
  postcode: string
  notes: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL: FormState = { name: '', phone: '', email: '', address: '', postcode: '', notes: '' }

function validate(form: FormState): FormErrors {
  const e: FormErrors = {}
  if (!form.name.trim()) e.name = 'This field is required'
  if (!form.address.trim()) e.address = 'This field is required'
  return e
}

// ─────────────────────────────────────────────────────────
// Success overlay
// ─────────────────────────────────────────────────────────

function SuccessOverlay({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14">
      <div className="animate-scale-in flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          viewBox="0 0 52 52"
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 27 l10 10 l14-18"
            className="animate-checkmark"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-soft-text">Customer Added!</p>
        <p className="mt-1 text-sm text-soft-muted">{name} has been added to your account.</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────

interface NewCustomerModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewCustomerModal({
  open,
  onClose,
  onSuccess,
}: NewCustomerModalProps) {
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [successName, setSuccessName] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(INITIAL)
      setErrors({})
      setServerError('')
      setSubmitting(false)
      setSuccessName(null)
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

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
    setHasChanges(true)
  }

  async function handleSubmit() {
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setServerError('')
    try {
      await createCustomer({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim(),
        postcode: form.postcode.trim().toUpperCase() || null,
        notes: form.notes.trim() || null,
      })
      const name = form.name.trim()
      setSuccessName(name)
      showToast({
        type: 'success',
        title: 'Customer Added',
        message: `${name} has been added to your account`,
      })
      closeTimerRef.current = setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      console.error('[createCustomer]', err)
      setServerError('Failed to add customer. Please try again.')
      setErrorKey(k => k + 1)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center px-4 pb-8 pt-20">
        <div className="w-full max-w-lg overflow-hidden rounded-card bg-white shadow-soft-md">

          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-navy px-6 py-5">
            <div>
              <h2 className="text-base font-bold text-white">New Customer</h2>
              <p className="mt-0.5 text-xs text-white/70">Add a customer to start creating jobs</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          {successName ? (
            <SuccessOverlay name={successName} />
          ) : (
            <div className="space-y-4 p-6">

              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Smith Construction Ltd"
                  className={cn(inputClass, errors.name && errorInputClass)}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="e.g. 07700 900123"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="e.g. jobs@smithconstruction.co.uk"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Address *</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="Full address including street and town"
                  className={cn(inputClass, 'resize-none', errors.address && errorInputClass)}
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              <div className="w-1/2">
                <label className={labelClass}>Postcode</label>
                <input
                  type="text"
                  value={form.postcode}
                  onChange={e => set('postcode', e.target.value.toUpperCase())}
                  placeholder="e.g. BD1 1AA"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Any notes about this customer…"
                  className={cn(inputClass, 'resize-none')}
                />
              </div>

              {serverError && (
                <div
                  key={errorKey}
                  className="animate-shake rounded-btn bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {serverError}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {!successName && (
            confirmDiscard ? (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-sm font-semibold text-soft-text">You have unsaved changes.</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-btn border border-red-300 px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-red-600 hover:bg-red-50 transition-all"
                  >
                    Discard changes
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
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
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
                    <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {submitting ? 'Adding…' : 'Add Customer'}
                </button>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  )
}
