'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { JobType, SkipSize } from '@/types'
import {
  createJob,
  getCustomersForCompany,
  getDriversForCompany,
  type CustomerOption,
  type DriverOption,
} from '@/lib/actions/jobs'
import { useToast } from '@/components/ui/toast'

// ─────────────────────────────────────────────────────────
// Shared input / label styles
// ─────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-btn border border-gray-200 bg-white px-3 py-2.5 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

const errorInputClass = 'border-red-400 focus:ring-red-300 focus:border-red-400'

const labelClass =
  'mb-1 block text-xs font-semibold uppercase tracking-wider text-soft-muted'

// ─────────────────────────────────────────────────────────
// Form state
// ─────────────────────────────────────────────────────────

type FormState = {
  job_type: string
  skip_size: string
  scheduled_date: string
  customer_id: string
  delivery_address: string
  delivery_postcode: string
  driver_id: string
  notes: string
  price: string
  permit_required: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_FORM: FormState = {
  job_type: '',
  skip_size: '',
  scheduled_date: '',
  customer_id: '',
  delivery_address: '',
  delivery_postcode: '',
  driver_id: '',
  notes: '',
  price: '',
  permit_required: false,
}

function validate(form: FormState): FormErrors {
  const e: FormErrors = {}
  if (!form.job_type) e.job_type = 'Job type is required'
  if (!form.skip_size) e.skip_size = 'Skip size is required'
  if (!form.customer_id) e.customer_id = 'Customer is required'
  if (!form.delivery_address.trim()) e.delivery_address = 'Delivery address is required'
  if (!form.delivery_postcode.trim()) e.delivery_postcode = 'Postcode is required'
  return e
}

// ─────────────────────────────────────────────────────────
// Field wrapper
// ─────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Success overlay
// ─────────────────────────────────────────────────────────

function SuccessOverlay({ jobRef }: { jobRef: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
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
        <p className="text-base font-semibold text-soft-text">Job Created!</p>
        <p className="mt-1 text-sm text-soft-muted">{jobRef} has been added successfully.</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────

interface NewJobModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewJobModal({ open, onClose, onSuccess }: NewJobModalProps) {
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [drivers, setDrivers] = useState<DriverOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [successJobRef, setSuccessJobRef] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load customers + drivers when modal opens
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoadingOptions(true)
    Promise.all([
      getCustomersForCompany(),
      getDriversForCompany(),
    ])
      .then(([c, d]) => {
        if (!cancelled) {
          setCustomers(c)
          setDrivers(d)
        }
      })
      .catch(err => console.error('[NewJobModal] load options', err))
      .finally(() => { if (!cancelled) setLoadingOptions(false) })
    return () => { cancelled = true }
  }, [open])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM)
      setErrors({})
      setServerError('')
      setSubmitting(false)
      setSuccessJobRef(null)
      setHasChanges(false)
      setConfirmDiscard(false)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (hasChanges) { setConfirmDiscard(true) } else { onClose() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, hasChanges, onClose])

  function set(key: keyof FormState, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key as keyof FormErrors]) setErrors(prev => ({ ...prev, [key]: undefined }))
    setHasChanges(true)
  }

  function handleCustomerChange(customerId: string) {
    const customer = customers.find(c => c.id === customerId)
    setForm(prev => ({
      ...prev,
      customer_id: customerId,
      delivery_address: customer ? customer.address : prev.delivery_address,
      delivery_postcode: customer ? customer.postcode : prev.delivery_postcode,
    }))
    if (errors.customer_id) setErrors(prev => ({ ...prev, customer_id: undefined }))
    if (errors.delivery_address) setErrors(prev => ({ ...prev, delivery_address: undefined }))
    if (errors.delivery_postcode) setErrors(prev => ({ ...prev, delivery_postcode: undefined }))
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
      const job = await createJob({
        customer_id: form.customer_id,
        job_type: form.job_type as JobType,
        skip_size: form.skip_size as SkipSize,
        delivery_address: form.delivery_address,
        delivery_postcode: form.delivery_postcode,
        scheduled_date: form.scheduled_date ? new Date(form.scheduled_date) : null,
        driver_id: form.driver_id || null,
        notes: form.notes || null,
        price: form.price ? parseFloat(form.price) : null,
        permit_required: form.permit_required,
      })
      const ref = job.job_number ?? `JOB-${job.id.slice(-6).toUpperCase()}`
      setSuccessJobRef(ref)
      showToast({
        type: 'success',
        title: 'Job Created',
        message: `${ref} has been added successfully`,
      })
      closeTimerRef.current = setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      console.error('[createJob]', err)
      setServerError('Failed to create job. Please try again.')
      setErrorKey(k => k + 1)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm sm:items-start sm:justify-center sm:overflow-y-auto sm:px-4 sm:pb-8 sm:pt-16">
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-soft-md sm:max-h-none sm:max-w-2xl sm:rounded-card">

          {/* ── Header ─────────────────────────────────── */}
          <div className="relative flex-shrink-0 flex items-center justify-between bg-gradient-orange px-6 py-5">
            <div>
              <h2 className="text-base font-bold text-white">New Job</h2>
              <p className="mt-0.5 text-xs text-white/80">Fill in the job details below</p>
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

          {/* ── Body ───────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
          {successJobRef ? (
            <SuccessOverlay jobRef={successJobRef} />
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Job Type — full width */}
                <Field label="Job Type" error={errors.job_type} className="sm:col-span-2">
                  <select
                    value={form.job_type}
                    onChange={e => set('job_type', e.target.value)}
                    className={cn(inputClass, errors.job_type && errorInputClass)}
                  >
                    <option value="">Select job type…</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="COLLECTION">Collection</option>
                    <option value="EXCHANGE">Exchange</option>
                    <option value="WAIT_AND_LOAD">Wait &amp; Load</option>
                  </select>
                </Field>

                {/* Skip Size */}
                <Field label="Skip Size" error={errors.skip_size}>
                  <select
                    value={form.skip_size}
                    onChange={e => set('skip_size', e.target.value)}
                    className={cn(inputClass, errors.skip_size && errorInputClass)}
                  >
                    <option value="">Select size…</option>
                    <option value="TWO_YARD">2 Yard</option>
                    <option value="FOUR_YARD">4 Yard</option>
                    <option value="SIX_YARD">6 Yard</option>
                    <option value="EIGHT_YARD">8 Yard</option>
                    <option value="TWELVE_YARD">12 Yard</option>
                    <option value="FOURTEEN_YARD">14 Yard</option>
                    <option value="SIXTEEN_YARD">16 Yard</option>
                    <option value="TWENTY_YARD">20 Yard</option>
                  </select>
                </Field>

                {/* Scheduled Date */}
                <Field label="Scheduled Date">
                  <input
                    type="date"
                    value={form.scheduled_date}
                    onChange={e => set('scheduled_date', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                {/* Customer — full width */}
                <Field label="Customer" error={errors.customer_id} className="sm:col-span-2">
                  {loadingOptions ? (
                    <div className={cn(inputClass, 'flex items-center gap-2 text-soft-muted')}>
                      <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading customers…
                    </div>
                  ) : (
                    <>
                      <select
                        value={form.customer_id}
                        onChange={e => handleCustomerChange(e.target.value)}
                        className={cn(inputClass, errors.customer_id && errorInputClass)}
                      >
                        <option value="">Select a customer…</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}{c.phone ? ` (${c.phone})` : ''}
                          </option>
                        ))}
                      </select>
                      {customers.length === 0 && (
                        <p className="mt-1.5 text-xs text-soft-muted">
                          No customers yet.{' '}
                          <a href="/customers" className="font-semibold text-orange-500 hover:text-orange-600">
                            Add a customer →
                          </a>
                        </p>
                      )}
                    </>
                  )}
                </Field>

                {/* Delivery Address — full width */}
                <Field label="Delivery Address" error={errors.delivery_address} className="sm:col-span-2">
                  <textarea
                    rows={2}
                    value={form.delivery_address}
                    onChange={e => set('delivery_address', e.target.value)}
                    placeholder="Full delivery address"
                    className={cn(inputClass, 'resize-none', errors.delivery_address && errorInputClass)}
                  />
                </Field>

                {/* Delivery Postcode */}
                <Field label="Postcode" error={errors.delivery_postcode}>
                  <input
                    type="text"
                    value={form.delivery_postcode}
                    onChange={e => set('delivery_postcode', e.target.value.toUpperCase())}
                    placeholder="e.g. SW1A 1AA"
                    className={cn(inputClass, errors.delivery_postcode && errorInputClass)}
                  />
                </Field>

                {/* Driver */}
                <Field label="Assign Driver (optional)">
                  <select
                    value={form.driver_id}
                    onChange={e => set('driver_id', e.target.value)}
                    className={inputClass}
                    disabled={loadingOptions}
                  >
                    <option value="">Unassigned</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </Field>

                {/* Price */}
                <Field label="Price (optional)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-soft-muted">£</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={e => set('price', e.target.value)}
                      placeholder="0.00"
                      className={cn(inputClass, 'pl-7')}
                    />
                  </div>
                </Field>

                {/* Permit Required */}
                <Field label="Permit Required">
                  <label className="flex cursor-pointer items-center gap-3 rounded-btn border border-gray-200 bg-white px-3 py-2.5 shadow-inset">
                    <input
                      type="checkbox"
                      checked={form.permit_required}
                      onChange={e => set('permit_required', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-sm text-soft-text">This job requires a skip permit</span>
                  </label>
                </Field>

                {/* Notes — full width */}
                <Field label="Notes (optional)" className="sm:col-span-2">
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="Any special instructions…"
                    className={cn(inputClass, 'resize-none')}
                  />
                </Field>
              </div>

              {serverError && (
                <div
                  key={errorKey}
                  className="animate-shake mt-4 rounded-btn bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {serverError}
                </div>
              )}
            </div>
          )}
          </div>

          {/* ── Footer ─────────────────────────────────── */}
          {!successJobRef && (
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
                  className="inline-flex items-center justify-center gap-2 rounded-btn border border-gray-200 bg-white px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-soft-text shadow-soft hover:bg-gray-50 disabled:opacity-50 transition-all"
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
                  {submitting ? 'Creating…' : 'Create Job'}
                </button>
              </div>
            )
          )}

      </div>
    </div>
  )
}
