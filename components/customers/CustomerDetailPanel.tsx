'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { JOB_TYPE_LABELS, SKIP_SIZE_LABELS, type JobStatus, type JobType } from '@/types'
import { JobStatusBadge } from '@/components/jobs/JobStatusBadge'
import { updateCustomer, type CustomerWithJobs } from '@/lib/actions/customers'

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatJobDate(date: Date | null | undefined): string {
  if (!date) return 'Not scheduled'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}

function jobRef(id: string): string {
  return `JOB-${id.slice(-6).toUpperCase()}`
}

const TYPE_BADGE_CLASSES: Record<string, string> = {
  DELIVERY: 'bg-blue-50 text-blue-600',
  COLLECTION: 'bg-purple-50 text-purple-600',
  EXCHANGE: 'bg-yellow-50 text-yellow-600',
  WAIT_AND_LOAD: 'bg-gray-100 text-gray-600',
}

// ─────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-5 p-5">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 flex-shrink-0 rounded-full bg-gray-100" />
        <div className="space-y-2">
          <div className="h-4 w-36 rounded bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>
      {[80, 60, 100, 50].map((w, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-2.5 w-14 rounded bg-gray-100" />
          <div className="h-4 rounded bg-gray-100" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Edit form
// ─────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

const errorInputClass = 'border-red-400 focus:ring-red-300 focus:border-red-400'
const labelClass = 'mb-1 block text-[0.65rem] font-semibold uppercase tracking-wider text-soft-muted'

type EditForm = {
  name: string; email: string; phone: string
  address: string; postcode: string; notes: string
}
type EditErrors = Partial<Record<keyof EditForm, string>>

interface EditPanelProps {
  customer: CustomerWithJobs
  onCancel: () => void
  onSaved: () => void
  showToast: (msg: string, type: 'success' | 'error') => void
}

function EditPanel({ customer, onCancel, onSaved, showToast }: EditPanelProps) {
  const [form, setForm] = useState<EditForm>({
    name: customer.name,
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    address: customer.address,
    postcode: customer.postcode ?? '',
    notes: customer.notes ?? '',
  })
  const [errors, setErrors] = useState<EditErrors>({})
  const [saving, setSaving] = useState(false)

  function set(key: keyof EditForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  async function handleSave() {
    const e: EditErrors = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setSaving(true)
    try {
      await updateCustomer(customer.id, {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
        address: form.address.trim(),
        postcode: form.postcode.trim().toUpperCase(),
        notes: form.notes.trim() || null,
      })
      showToast('Customer updated', 'success')
      onSaved()
    } catch (err) {
      console.error(err)
      showToast('Failed to update customer', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3 p-5">
      <div>
        <label className={labelClass}>Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          className={cn(inputClass, errors.name && errorInputClass)}
        />
        {errors.name && <p className="mt-1 text-[0.65rem] text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label className={labelClass}>Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          placeholder="07700 900123"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          placeholder="email@example.co.uk"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Address *</label>
        <textarea
          rows={2}
          value={form.address}
          onChange={e => set('address', e.target.value)}
          className={cn(inputClass, 'resize-none', errors.address && errorInputClass)}
        />
        {errors.address && <p className="mt-1 text-[0.65rem] text-red-500">{errors.address}</p>}
      </div>

      <div>
        <label className={labelClass}>Postcode</label>
        <input
          type="text"
          value={form.postcode}
          onChange={e => set('postcode', e.target.value.toUpperCase())}
          placeholder="BD1 1AA"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any notes…"
          className={cn(inputClass, 'resize-none')}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-btn bg-gradient-orange py-2 text-[0.65rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft disabled:opacity-70 transition-all"
        >
          {saving && (
            <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="rounded-btn border border-gray-200 bg-white px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.025em] text-soft-muted hover:bg-gray-50 disabled:opacity-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Info row
// ─────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-soft-muted">{label}</p>
      <p className={cn('mt-0.5 text-sm', value ? 'text-soft-text' : 'italic text-soft-muted')}>
        {value || 'Not provided'}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Detail panel
// ─────────────────────────────────────────────────────────

interface CustomerDetailPanelProps {
  customer: CustomerWithJobs | null
  startInEditMode?: boolean
  onClose: () => void
  onUpdated: () => void
  showToast: (message: string, type: 'success' | 'error') => void
}

export function CustomerDetailPanel({
  customer,
  startInEditMode = false,
  onClose,
  onUpdated,
  showToast,
}: CustomerDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(startInEditMode)

  useEffect(() => {
    if (customer) setIsEditing(startInEditMode)
  }, [customer?.id, startInEditMode])

  return (
    <div className="flex max-h-[80vh] flex-col overflow-hidden rounded-card bg-white shadow-soft-md">

      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-100 p-5">
        {!customer ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-14 w-14 flex-shrink-0 rounded-full bg-gray-100" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-3 w-20 rounded bg-gray-100" />
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-navy text-sm font-bold text-white">
                {initials(customer.name)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-soft-text">{customer.name}</h3>
                <p className="text-sm text-soft-muted">
                  {customer.jobs.length} job{customer.jobs.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors"
                  aria-label="Edit"
                  title="Edit customer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!customer ? (
          <LoadingSkeleton />
        ) : isEditing ? (
          <EditPanel
            customer={customer}
            onCancel={() => setIsEditing(false)}
            onSaved={() => { setIsEditing(false); onUpdated() }}
            showToast={showToast}
          />
        ) : (
          <>
            {/* Contact info */}
            <div className="space-y-4 p-5">
              <InfoRow label="Phone" value={customer.phone} />
              <InfoRow label="Email" value={customer.email} />
              <InfoRow label="Address" value={customer.address} />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-soft-muted">Postcode</p>
                <p className={cn('mt-0.5 text-sm', customer.postcode ? 'text-soft-text' : 'italic text-soft-muted')}>
                  {customer.postcode ?? '—'}
                </p>
              </div>
            </div>

            {/* Recent jobs */}
            <div className="border-t border-gray-100 p-5">
              <h4 className="mb-3 text-sm font-semibold text-soft-text">Recent Jobs</h4>

              {customer.jobs.length === 0 ? (
                <p className="py-4 text-center text-sm italic text-soft-muted">No jobs yet</p>
              ) : (
                <div className="space-y-2">
                  {customer.jobs.map(job => (
                    <a
                      key={job.id}
                      href="/jobs"
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0 font-mono text-[0.65rem] text-soft-muted">
                          {jobRef(job.id)}
                        </span>
                        <span
                          className={cn(
                            'flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5',
                            'text-[0.6rem] font-bold uppercase tracking-[0.05em]',
                            TYPE_BADGE_CLASSES[job.job_type] ?? 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {JOB_TYPE_LABELS[job.job_type as JobType] ?? job.job_type}
                        </span>
                        <JobStatusBadge status={job.status as JobStatus} />
                      </div>
                      <span className="flex-shrink-0 text-[0.65rem] text-soft-muted ml-2">
                        {formatJobDate(job.scheduled_date)}
                      </span>
                    </a>
                  ))}
                </div>
              )}

              <a
                href="/jobs"
                className="mt-3 block text-center text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                + New Job for this customer
              </a>
            </div>

            {/* Notes */}
            <div className="border-t border-gray-100 p-5">
              <h4 className="mb-2 text-sm font-semibold text-soft-text">Notes</h4>
              {customer.notes ? (
                <p className="text-sm text-soft-text leading-relaxed">{customer.notes}</p>
              ) : (
                <p className="text-sm italic text-soft-muted">No notes added</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
