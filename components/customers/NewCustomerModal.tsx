'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { createCustomer } from '@/lib/actions/customers'

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

interface NewCustomerModalProps {
  open: boolean
  companyId: string
  onClose: () => void
  onSuccess: () => void
  showToast: (message: string, type: 'success' | 'error') => void
}

export function NewCustomerModal({
  open,
  companyId,
  onClose,
  onSuccess,
  showToast,
}: NewCustomerModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (!open) {
      setForm(INITIAL)
      setErrors({})
      setServerError('')
      setSubmitting(false)
    }
  }, [open])

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
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
        company_id: companyId,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim(),
        postcode: form.postcode.trim().toUpperCase() || null,
        notes: form.notes.trim() || null,
      })
      showToast('Customer added successfully', 'success')
      onSuccess()
    } catch (err) {
      console.error('[createCustomer]', err)
      setServerError('Failed to add customer. Please try again.')
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
          <div className="space-y-4 p-6">

            {/* Name */}
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

            {/* Phone */}
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

            {/* Email */}
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

            {/* Address */}
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

            {/* Postcode */}
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

            {/* Notes */}
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
              <div className="rounded-btn bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              onClick={onClose}
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

        </div>
      </div>
    </div>
  )
}
