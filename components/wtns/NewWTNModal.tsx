'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { JOB_TYPE_LABELS, SKIP_SIZE_LABELS } from '@/types'
import { createWTN, getJobsForWTN, type JobForWTN } from '@/lib/actions/wtns'
import { useToast } from '@/components/ui/toast'

// ─────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-btn border border-gray-200 bg-white px-3 py-2.5 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

const errorInputClass = 'border-red-400 focus:ring-red-300 focus:border-red-400'

const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-soft-muted'

const sectionHeadingClass =
  'mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted'

// ─────────────────────────────────────────────────────────
// Field wrapper
// ─────────────────────────────────────────────────────────

function Field({
  label, required, error, children, className,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <label className={labelClass}>
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Form types
// ─────────────────────────────────────────────────────────

type FormState = {
  jobId: string
  wasteDescription: string
  ewcCode: string
  quantityKg: string
  collectionAddress: string
  collectionPostcode: string
  disposalSiteName: string
  disposalSiteAddress: string
  consigneeName: string
  consigneeAddress: string
  carrierName: string
  carrierEaNumber: string
  transferDate: string
  notes: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_FORM: FormState = {
  jobId: '',
  wasteDescription: '',
  ewcCode: '',
  quantityKg: '',
  collectionAddress: '',
  collectionPostcode: '',
  disposalSiteName: '',
  disposalSiteAddress: '',
  consigneeName: '',
  consigneeAddress: '',
  carrierName: '',
  carrierEaNumber: '',
  transferDate: new Date().toISOString().slice(0, 10),
  notes: '',
}

function validate(form: FormState): FormErrors {
  const e: FormErrors = {}
  if (!form.jobId)                       e.jobId              = 'You must link this WTN to a job'
  if (!form.wasteDescription.trim())     e.wasteDescription   = 'Waste description is required'
  if (!form.collectionAddress.trim())    e.collectionAddress  = 'Collection address is required'
  if (!form.collectionPostcode.trim())   e.collectionPostcode = 'Postcode is required'
  if (!form.disposalSiteName.trim())     e.disposalSiteName   = 'Disposal site is required'
  if (!form.carrierName.trim())          e.carrierName        = 'Carrier name is required'
  if (!form.transferDate)                e.transferDate       = 'Transfer date is required'
  return e
}

// ─────────────────────────────────────────────────────────
// Success overlay
// ─────────────────────────────────────────────────────────

function SuccessOverlay({ wtnNumber }: { wtnNumber: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="animate-scale-in flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg viewBox="0 0 52 52" className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 27 l10 10 l14-18" className="animate-checkmark" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-soft-text">{wtnNumber} created</p>
        <p className="mt-1.5 max-w-xs text-sm text-soft-muted">
          This WTN is saved as a Draft. Mark it as Signed once both parties have agreed.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────

interface NewWTNModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewWTNModal({ open, onClose, onSuccess }: NewWTNModalProps) {
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [jobs, setJobs] = useState<JobForWTN[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [successWTN, setSuccessWTN] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load eligible jobs when modal opens
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoadingJobs(true)
    getJobsForWTN()
      .then(data => { if (!cancelled) setJobs(data) })
      .catch(err => console.error('[NewWTNModal] load jobs', err))
      .finally(() => { if (!cancelled) setLoadingJobs(false) })
    return () => { cancelled = true }
  }, [open])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM)
      setErrors({})
      setServerError('')
      setSubmitting(false)
      setSuccessWTN(null)
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

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
    setHasChanges(true)
  }

  function handleJobChange(jobId: string) {
    const job = jobs.find(j => j.id === jobId)
    setForm(prev => ({
      ...prev,
      jobId,
      collectionAddress:  job ? job.delivery_address  : prev.collectionAddress,
      collectionPostcode: job ? job.delivery_postcode : prev.collectionPostcode,
    }))
    if (errors.jobId)              setErrors(prev => ({ ...prev, jobId: undefined }))
    if (errors.collectionAddress)  setErrors(prev => ({ ...prev, collectionAddress: undefined }))
    if (errors.collectionPostcode) setErrors(prev => ({ ...prev, collectionPostcode: undefined }))
    setHasChanges(true)
  }

  const selectedJob = jobs.find(j => j.id === form.jobId)

  async function handleSubmit() {
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setServerError('')
    try {
      const result = await createWTN({
        jobId:               form.jobId,
        wasteDescription:    form.wasteDescription,
        ewcCode:             form.ewcCode,
        quantityKg:          form.quantityKg ? parseFloat(form.quantityKg) : undefined,
        collectionAddress:   form.collectionAddress,
        collectionPostcode:  form.collectionPostcode.toUpperCase(),
        disposalSiteName:    form.disposalSiteName    || undefined,
        disposalSiteAddress: form.disposalSiteAddress || undefined,
        consigneeName:       form.consigneeName       || undefined,
        consigneeAddress:    form.consigneeAddress    || undefined,
        carrierName:         form.carrierName,
        carrierEaNumber:     form.carrierEaNumber     || undefined,
        transferDate:        form.transferDate,
        notes:               form.notes               || undefined,
      })
      setSuccessWTN(result.wtn_number)
      showToast({ type: 'success', title: 'WTN Created', message: `${result.wtn_number} saved as Draft` })
      closeTimerRef.current = setTimeout(onSuccess, 1800)
    } catch (err) {
      console.error('[createWTN]', err)
      setServerError('Failed to create WTN. Please check all fields and try again.')
      setErrorKey(k => k + 1)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center px-4 pb-8 pt-12">
        <div className="w-full max-w-2xl overflow-hidden rounded-card bg-white shadow-soft-md">

          {/* Header */}
          <div className="relative flex items-center justify-between bg-gradient-navy px-6 py-5">
            <div>
              <h2 className="text-base font-bold text-white">New Waste Transfer Note</h2>
              <p className="mt-0.5 text-xs text-white/70">Complete all required fields for DEFRA compliance</p>
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
          {successWTN ? (
            <SuccessOverlay wtnNumber={successWTN} />
          ) : (
            <div className="divide-y divide-gray-100 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>

              {/* Section 1 — Link to Job */}
              <div className="p-6">
                <p className={sectionHeadingClass}>
                  Link to Job <span className="text-red-500">*</span>
                </p>
                <Field label="Job" required error={errors.jobId}>
                  {loadingJobs ? (
                    <div className={cn(inputClass, 'flex items-center gap-2 text-soft-muted')}>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-300 border-t-orange-500" />
                      Loading jobs…
                    </div>
                  ) : (
                    <>
                      <select
                        value={form.jobId}
                        onChange={e => handleJobChange(e.target.value)}
                        className={cn(inputClass, errors.jobId && errorInputClass)}
                      >
                        <option value="">Select a job…</option>
                        {jobs.map(j => (
                          <option key={j.id} value={j.id}>
                            {`JOB-${j.id.slice(-6).toUpperCase()}`}
                            {': '}
                            {j.customer.name}
                            {' ('}
                            {SKIP_SIZE_LABELS[j.skip_size as keyof typeof SKIP_SIZE_LABELS] ?? j.skip_size}
                            {' '}
                            {JOB_TYPE_LABELS[j.job_type as keyof typeof JOB_TYPE_LABELS] ?? j.job_type}
                            {')'}
                          </option>
                        ))}
                      </select>
                      {jobs.length === 0 && !loadingJobs && (
                        <p className="mt-1.5 text-xs text-soft-muted">
                          All existing jobs already have a WTN. Create a new job first.
                        </p>
                      )}
                    </>
                  )}
                </Field>
                {selectedJob && (
                  <p className="mt-2 text-xs font-semibold text-green-600">
                    ✓ Job details imported. Collection address pre-filled.
                  </p>
                )}
              </div>

              {/* Section 2 — Waste Details */}
              <div className="p-6">
                <p className={sectionHeadingClass}>Waste Details</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Waste Description" required error={errors.wasteDescription} className="sm:col-span-2">
                    <textarea
                      rows={2}
                      value={form.wasteDescription}
                      onChange={e => set('wasteDescription', e.target.value)}
                      placeholder="e.g. Mixed construction waste, soil, rubble"
                      className={cn(inputClass, 'resize-none', errors.wasteDescription && errorInputClass)}
                    />
                  </Field>

                  <Field label="Waste Code (EWC, optional)">
                    <input
                      type="text"
                      value={form.ewcCode}
                      onChange={e => set('ewcCode', e.target.value)}
                      placeholder="e.g. 17 09 04"
                      className={inputClass}
                    />
                    <p className="mt-1 text-[0.65rem] text-soft-muted">
                      EWC waste code. Find at environment-agency.gov.uk.
                    </p>
                  </Field>

                  <Field label="Quantity (kg, optional)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.quantityKg}
                      onChange={e => set('quantityKg', e.target.value)}
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              {/* Section 3 — Collection & Disposal */}
              <div className="p-6">
                <p className={sectionHeadingClass}>Collection & Disposal</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Collection Address" required error={errors.collectionAddress} className="sm:col-span-2">
                    <textarea
                      rows={2}
                      value={form.collectionAddress}
                      onChange={e => set('collectionAddress', e.target.value)}
                      placeholder="Full collection address"
                      className={cn(inputClass, 'resize-none', errors.collectionAddress && errorInputClass)}
                    />
                  </Field>

                  <Field label="Collection Postcode" required error={errors.collectionPostcode}>
                    <input
                      type="text"
                      value={form.collectionPostcode}
                      onChange={e => set('collectionPostcode', e.target.value.toUpperCase())}
                      placeholder="e.g. SW1A 1AA"
                      className={cn(inputClass, errors.collectionPostcode && errorInputClass)}
                    />
                  </Field>

                  <Field label="Transfer Date" required error={errors.transferDate}>
                    <input
                      type="date"
                      value={form.transferDate}
                      onChange={e => set('transferDate', e.target.value)}
                      className={cn(inputClass, errors.transferDate && errorInputClass)}
                    />
                  </Field>

                  <Field label="Disposal Site Name" required error={errors.disposalSiteName} className="sm:col-span-2">
                    <input
                      type="text"
                      value={form.disposalSiteName}
                      onChange={e => set('disposalSiteName', e.target.value)}
                      placeholder="Licensed disposal facility name"
                      className={cn(inputClass, errors.disposalSiteName && errorInputClass)}
                    />
                  </Field>

                  <Field label="Disposal Site Address (optional)" className="sm:col-span-2">
                    <textarea
                      rows={2}
                      value={form.disposalSiteAddress}
                      onChange={e => set('disposalSiteAddress', e.target.value)}
                      placeholder="Full address of disposal facility"
                      className={cn(inputClass, 'resize-none')}
                    />
                  </Field>

                  <Field label="Consignee Name (optional)">
                    <input
                      type="text"
                      value={form.consigneeName}
                      onChange={e => set('consigneeName', e.target.value)}
                      placeholder="Receiving facility name"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Consignee Address (optional)">
                    <input
                      type="text"
                      value={form.consigneeAddress}
                      onChange={e => set('consigneeAddress', e.target.value)}
                      placeholder="Receiving facility address"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              {/* Section 4 — Carrier Details */}
              <div className="p-6">
                <p className={sectionHeadingClass}>Carrier Details</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Carrier Name" required error={errors.carrierName}>
                    <input
                      type="text"
                      value={form.carrierName}
                      onChange={e => set('carrierName', e.target.value)}
                      placeholder="Registered carrier name"
                      className={cn(inputClass, errors.carrierName && errorInputClass)}
                    />
                  </Field>

                  <Field label="Carrier EA Number (optional)">
                    <input
                      type="text"
                      value={form.carrierEaNumber}
                      onChange={e => set('carrierEaNumber', e.target.value)}
                      placeholder="e.g. CBDU12345"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Notes (optional)" className="sm:col-span-2">
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={e => set('notes', e.target.value)}
                      placeholder="Any additional notes…"
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
            </div>
          )}

          {/* Footer */}
          {!successWTN && (
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
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="flex items-center gap-1.5 text-xs italic text-soft-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 flex-shrink-0 text-soft-muted/70">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <span>Legally binding under the Environmental Protection Act 1990</span>
                </p>
                <div className="flex items-center gap-3">
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
                    {submitting ? 'Creating…' : 'Create WTN'}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
