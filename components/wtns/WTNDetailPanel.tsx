'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { JOB_TYPE_LABELS, SKIP_SIZE_LABELS, WTN_STATUS_LABELS, type WTNStatus } from '@/types'
import { WTNStatusBadge } from './WTNStatusBadge'
import { updateWTNStatus, type WTNDetail } from '@/lib/actions/wtns'
import { useToast } from '@/components/ui/toast'

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function jobRef(id: string) {
  return `JOB-${id.slice(-6).toUpperCase()}`
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Not set'
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ─────────────────────────────────────────────────────────
// Label/value row
// ─────────────────────────────────────────────────────────

function Row({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-2 py-2', className)}>
      <span className="w-32 flex-shrink-0 text-xs font-semibold text-soft-muted">{label}</span>
      <span className="min-w-0 flex-1 text-sm text-soft-text">{value || <span className="text-soft-muted/60 italic">—</span>}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Status timeline
// ─────────────────────────────────────────────────────────

const TIMELINE_STEPS: WTNStatus[] = ['DRAFT', 'SIGNED', 'SUBMITTED', 'ACCEPTED']

function StatusTimeline({ status }: { status: WTNStatus }) {
  const isRejected = status === 'REJECTED'
  const currentIdx = isRejected
    ? TIMELINE_STEPS.indexOf('SUBMITTED')
    : TIMELINE_STEPS.indexOf(status)

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {TIMELINE_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx
        const isCurrent   = idx === currentIdx
        const isUpcoming  = idx > currentIdx

        return (
          <div key={step} className="flex flex-1 flex-col items-center">
            <div className="relative flex w-full items-center">
              {/* Left connector */}
              {idx > 0 && (
                <div className={cn(
                  'absolute left-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2',
                  isCompleted || isCurrent ? 'bg-orange-400' : 'bg-gray-200'
                )} />
              )}
              {/* Right connector */}
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={cn(
                  'absolute right-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2',
                  isCompleted ? 'bg-orange-400' : 'bg-gray-200'
                )} />
              )}
              {/* Circle */}
              <div className="relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full">
                {isCompleted && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-orange">
                    <svg viewBox="0 0 20 20" fill="white" className="h-4 w-4">
                      <path fillRule="evenodd" clipRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" />
                    </svg>
                  </div>
                )}
                {isCurrent && !isRejected && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-orange-500 bg-white">
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  </div>
                )}
                {isCurrent && isRejected && step === 'SUBMITTED' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 bg-red-50">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-red-500">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </div>
                )}
                {isUpcoming && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
                    <div className="h-2 w-2 rounded-full bg-gray-200" />
                  </div>
                )}
              </div>
            </div>

            {/* Step label */}
            <span className={cn(
              'mt-2 text-[0.65rem] font-semibold uppercase tracking-wide',
              isCurrent && isRejected && step === 'SUBMITTED' ? 'text-red-500' :
              isCompleted || isCurrent ? 'text-orange-500' : 'text-soft-muted'
            )}>
              {isCurrent && isRejected && step === 'SUBMITTED' ? 'Rejected' : WTN_STATUS_LABELS[step]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Footer actions
// ─────────────────────────────────────────────────────────

function FooterActions({
  wtn,
  onStatusChange,
}: {
  wtn: WTNDetail
  onStatusChange: (status: WTNStatus) => void
}) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  async function transition(status: WTNStatus) {
    setLoading(true)
    try {
      await onStatusChange(status)
    } finally {
      setLoading(false)
    }
  }

  const btn = (label: string, onClick: () => void, variant: 'primary' | 'secondary' | 'ghost' | 'disabled' = 'primary') => {
    const base = 'w-full rounded-btn px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.025em] transition-all'
    const styles = {
      primary:   'bg-gradient-orange text-white shadow-soft hover:shadow-md disabled:opacity-70',
      secondary: 'border border-gray-200 bg-white text-soft-text shadow-soft hover:bg-gray-50 disabled:opacity-50',
      ghost:     'text-soft-muted hover:bg-gray-50',
      disabled:  'bg-gray-100 text-gray-400 cursor-not-allowed',
    }
    return (
      <button
        onClick={onClick}
        disabled={loading || variant === 'disabled'}
        className={cn(base, styles[variant])}
      >
        {loading && variant === 'primary' ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Processing…
          </span>
        ) : label}
      </button>
    )
  }

  if (wtn.status === 'DRAFT') {
    return (
      <div className="space-y-2">
        {btn('Mark as Signed', () => transition('SIGNED'))}
      </div>
    )
  }

  if (wtn.status === 'SIGNED') {
    return (
      <div className="space-y-2">
        {btn('Submit to Environment Agency', () => {
          transition('SUBMITTED').then(() => {
            showToast({
              type: 'info',
              title: 'Submitted',
              message: 'In production this will connect directly to the EA digital service.',
            })
          })
        })}
        {btn('Back to Draft', () => transition('DRAFT'), 'ghost')}
        <p className="text-center text-xs italic text-soft-muted">
          Submitting will lock this WTN from further edits
        </p>
      </div>
    )
  }

  if (wtn.status === 'SUBMITTED') {
    return (
      <div className="space-y-2">
        {btn('Awaiting EA Response', () => {}, 'disabled')}
        {btn('Download PDF', () =>
          showToast({ type: 'info', title: 'Coming soon', message: 'PDF export coming in the next update' }),
        'secondary')}
      </div>
    )
  }

  if (wtn.status === 'ACCEPTED') {
    return (
      <div className="space-y-2">
        <div className="rounded-btn bg-green-50 px-4 py-3 text-center text-xs font-semibold text-green-700">
          ✓ This WTN has been accepted by the Environment Agency
        </div>
        {btn('Download PDF', () =>
          showToast({ type: 'info', title: 'Coming soon', message: 'PDF export coming in the next update' }),
        'secondary')}
      </div>
    )
  }

  if (wtn.status === 'REJECTED') {
    return (
      <div className="space-y-2">
        <div className="rounded-btn bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-600">
          Rejected — see notes for reason
        </div>
        {btn('Resubmit', () => transition('SUBMITTED'))}
        {btn('Back to Draft to Edit', () => transition('DRAFT'), 'ghost')}
      </div>
    )
  }

  return null
}

// ─────────────────────────────────────────────────────────
// Panel
// ─────────────────────────────────────────────────────────

interface WTNDetailPanelProps {
  wtn: WTNDetail | null
  onClose: () => void
  onStatusChange: (status: WTNStatus) => void
}

export function WTNDetailPanel({ wtn, onClose, onStatusChange }: WTNDetailPanelProps) {
  if (!wtn) {
    return (
      <div className="w-[400px] overflow-hidden rounded-card bg-white shadow-soft">
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-300 border-t-orange-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-[400px] overflow-hidden rounded-card bg-white shadow-soft">

      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 p-4">
        <div>
          <p className="font-mono text-lg font-bold text-soft-text">{wtn.wtn_number}</p>
          <div className="mt-1 flex items-center gap-2">
            <WTNStatusBadge status={wtn.status as WTNStatus} />
            <span className="text-xs text-soft-muted">
              Created {new Date(wtn.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">

        {/* Status timeline */}
        <div className="border-b border-gray-100 px-2">
          <StatusTimeline status={wtn.status as WTNStatus} />
        </div>

        {/* Waste details */}
        <div className="border-b border-gray-100 px-4">
          <p className="pb-1 pt-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
            Waste Details
          </p>
          <Row label="Description" value={wtn.waste_description} />
          {wtn.ewc_code && <Row label="EWC Code" value={<span className="font-mono">{wtn.ewc_code}</span>} />}
          {wtn.quantity_kg != null && (
            <Row label="Quantity" value={`${wtn.quantity_kg} kg`} />
          )}
          <Row label="Container" value={wtn.container_type} />
        </div>

        {/* Addresses */}
        <div className="border-b border-gray-100 px-4">
          <p className="pb-1 pt-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
            Collection & Disposal
          </p>
          <Row label="Collection" value={`${wtn.collection_address}, ${wtn.collection_postcode}`} />
          {wtn.disposal_site_name && <Row label="Disposal Site" value={wtn.disposal_site_name} />}
          {wtn.disposal_site_address && <Row label="Disposal Addr" value={wtn.disposal_site_address} />}
          <Row label="Transfer Date" value={formatDate(wtn.transfer_date)} />
        </div>

        {/* Carrier */}
        <div className="border-b border-gray-100 px-4">
          <p className="pb-1 pt-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
            Carrier
          </p>
          <Row label="Name" value={wtn.carrier_name} />
          {wtn.carrier_ea_number && (
            <Row label="EA Number" value={<span className="font-mono">{wtn.carrier_ea_number}</span>} />
          )}
        </div>

        {/* Linked job */}
        <div className="border-b border-gray-100 px-4">
          <p className="pb-1 pt-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
            Linked Job
          </p>
          <Link
            href="/jobs"
            className="my-2 flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-soft-text">
                  {jobRef(wtn.job.id)}
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[0.6rem] font-semibold text-blue-600">
                  {JOB_TYPE_LABELS[wtn.job.job_type as keyof typeof JOB_TYPE_LABELS] ?? wtn.job.job_type}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.6rem] font-semibold text-soft-muted">
                  {SKIP_SIZE_LABELS[wtn.job.skip_size as keyof typeof SKIP_SIZE_LABELS] ?? wtn.job.skip_size}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-soft-muted">{wtn.job.customer.name}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 flex-shrink-0 text-soft-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        {/* Notes */}
        {(wtn.consignee_name || wtn.consignee_address) && (
          <div className="border-b border-gray-100 px-4">
            <p className="pb-1 pt-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
              Consignee
            </p>
            {wtn.consignee_name    && <Row label="Name"    value={wtn.consignee_name} />}
            {wtn.consignee_address && <Row label="Address" value={wtn.consignee_address} />}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-gray-100 p-4">
        <FooterActions wtn={wtn} onStatusChange={onStatusChange} />
      </div>
    </div>
  )
}
