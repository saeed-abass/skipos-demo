'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { createSkip } from '@/lib/actions/fleet'
import { useToast } from '@/components/ui/toast'
import type { SkipSize, Condition } from '@/types'

const inputClass =
  'w-full rounded-btn border border-gray-200 bg-white px-3 py-2.5 text-sm text-soft-text ' +
  'shadow-inset placeholder:text-soft-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400'

const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-soft-muted'

// ─────────────────────────────────────────────────────────
// Size options
// ─────────────────────────────────────────────────────────

const SIZE_OPTIONS: { value: SkipSize; label: string }[] = [
  { value: 'TWO_YARD',      label: '2yd'  },
  { value: 'FOUR_YARD',     label: '4yd'  },
  { value: 'SIX_YARD',      label: '6yd'  },
  { value: 'EIGHT_YARD',    label: '8yd'  },
  { value: 'TWELVE_YARD',   label: '12yd' },
  { value: 'FOURTEEN_YARD', label: '14yd' },
  { value: 'SIXTEEN_YARD',  label: '16yd' },
  { value: 'TWENTY_YARD',   label: '20yd' },
]

// ─────────────────────────────────────────────────────────
// Condition options
// ─────────────────────────────────────────────────────────

type ConditionOption = {
  value: Condition
  label: string
  sublabel: string
  dotClass: string
  selectedBorder: string
  selectedBg: string
}

const CONDITION_OPTIONS: ConditionOption[] = [
  {
    value: 'GOOD', label: 'Good',   sublabel: 'No damage',
    dotClass: 'bg-green-400', selectedBorder: 'border-green-400', selectedBg: 'bg-green-50',
  },
  {
    value: 'FAIR', label: 'Fair',   sublabel: 'Minor wear',
    dotClass: 'bg-yellow-400', selectedBorder: 'border-yellow-400', selectedBg: 'bg-yellow-50',
  },
  {
    value: 'POOR', label: 'Poor',   sublabel: 'Needs repair',
    dotClass: 'bg-red-400', selectedBorder: 'border-red-400', selectedBg: 'bg-red-50',
  },
]

// ─────────────────────────────────────────────────────────
// Success overlay
// ─────────────────────────────────────────────────────────

function SuccessOverlay() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14">
      <div className="animate-scale-in flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg viewBox="0 0 52 52" className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 27 l10 10 l14-18" className="animate-checkmark" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-soft-text">Skip added to your fleet</p>
        <p className="mt-1 text-sm text-soft-muted">It has been added to your yard inventory.</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────

interface AddSkipModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  companyId: string
}

type FormState = {
  size: SkipSize | ''
  condition: Condition
  serialNumber: string
  notes: string
}

type FormErrors = { size?: string }

const INITIAL: FormState = {
  size: '',
  condition: 'GOOD',
  serialNumber: '',
  notes: '',
}

export function AddSkipModal({ open, onClose, onSuccess, companyId }: AddSkipModalProps) {
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(INITIAL)
      setErrors({})
      setServerError('')
      setSubmitting(false)
      setSuccess(false)
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

  function setSize(size: SkipSize) {
    setForm(prev => ({ ...prev, size }))
    setErrors({})
    setHasChanges(true)
  }

  function setCondition(condition: Condition) {
    setForm(prev => ({ ...prev, condition }))
    setHasChanges(true)
  }

  function setField(key: 'serialNumber' | 'notes', value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  async function handleSubmit() {
    if (!form.size) { setErrors({ size: 'Please select a skip size' }); return }
    setSubmitting(true)
    setServerError('')
    try {
      await createSkip({
        companyId,
        size: form.size,
        condition: form.condition,
        serialNumber: form.serialNumber || undefined,
        notes: form.notes || undefined,
      })
      setSuccess(true)
      showToast({ type: 'success', title: 'Skip added', message: 'Added to your yard inventory' })
      closeTimerRef.current = setTimeout(() => { onSuccess() }, 1500)
    } catch (err) {
      console.error('[createSkip]', err)
      setServerError('Failed to add skip. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center px-4 pb-8 pt-16">
        <div className="w-full max-w-md overflow-hidden rounded-card bg-white shadow-soft-md">

          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-navy px-6 py-5">
            <div>
              <h2 className="text-base font-bold text-white">Add Skip to Fleet</h2>
              <p className="mt-0.5 text-xs text-white/70">Register a new skip in your yard</p>
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
          {success ? (
            <SuccessOverlay />
          ) : (
            <div className="space-y-5 p-6">

              {/* Size picker */}
              <div>
                <label className={labelClass}>Skip Size *</label>
                <div className="grid grid-cols-4 gap-2">
                  {SIZE_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setSize(o.value)}
                      className={cn(
                        'rounded-btn border-2 px-3 py-2 text-center text-sm font-semibold transition-all',
                        form.size === o.value
                          ? 'border-orange-400 bg-orange-50 text-orange-700'
                          : 'border-gray-200 text-soft-muted hover:border-gray-300',
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {errors.size && <p className="mt-1 text-xs text-red-500">{errors.size}</p>}
              </div>

              {/* Condition picker */}
              <div>
                <label className={labelClass}>Condition *</label>
                <div className="grid grid-cols-3 gap-3">
                  {CONDITION_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setCondition(o.value)}
                      className={cn(
                        'rounded-card border-2 p-3 text-left transition-all',
                        form.condition === o.value
                          ? `${o.selectedBorder} ${o.selectedBg}`
                          : 'border-gray-200 bg-white hover:border-gray-300',
                      )}
                    >
                      <div className={cn('mb-1.5 h-4 w-4 rounded-full', o.dotClass)} />
                      <p className="text-xs font-semibold text-soft-text">{o.label}</p>
                      <p className="mt-0.5 text-[0.6rem] text-soft-muted">{o.sublabel}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Serial Number */}
              <div>
                <label className={labelClass}>Serial Number / Identifier (optional)</label>
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={e => setField('serialNumber', e.target.value)}
                  placeholder="e.g. SKIP-001, RED-8YD, or paint marking"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-soft-muted">
                  Used to identify this skip on site. Auto-generated if left blank.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>Notes (optional)</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  placeholder="Any notes about this skip…"
                  className={cn(inputClass, 'resize-none')}
                />
              </div>

              {serverError && (
                <div className="rounded-btn bg-red-50 px-4 py-3 text-sm text-red-600">
                  {serverError}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {!success && (
            confirmDiscard ? (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
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
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {submitting ? 'Adding…' : 'Add to Fleet'}
                </button>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  )
}
