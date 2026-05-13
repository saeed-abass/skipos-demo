'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { getJobs, updateJobStatus, type JobRow } from '@/lib/actions/jobs'
import { JobFilters, type FilterState } from '@/components/jobs/JobFilters'
import { JobsTable } from '@/components/jobs/JobsTable'
import { NewJobModal } from '@/components/jobs/NewJobModal'
import type { JobStatus, JobType } from '@/types'

const DEMO_COMPANY_ID = 'demo-company'

const INITIAL_FILTERS: FilterState = {
  status: '',
  jobType: '',
  search: '',
  dateFrom: '',
  dateTo: '',
}

// ─────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────

type Toast = { id: string; message: string; type: 'success' | 'error' }

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewJobModal, setShowNewJobModal] = useState(false)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [toasts, setToasts] = useState<Toast[]>([])

  function showToast(message: string, type: 'success' | 'error') {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const loadJobs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getJobs(DEMO_COMPANY_ID, {
        status: (filters.status as JobStatus) || undefined,
        jobType: (filters.jobType as JobType) || undefined,
        search: filters.search || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      })
      setJobs(data)
    } catch {
      showToast('Failed to load jobs', 'error')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  async function handleStatusUpdate(jobId: string, status: JobStatus) {
    try {
      await updateJobStatus(jobId, status)
      showToast('Status updated', 'success')
      await loadJobs()
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  return (
    <PageWrapper>
      {/* ── Page header ─────────────────────────────── */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-soft-text">Jobs</h2>
          <p className="mt-0.5 text-sm text-soft-muted">
            {loading ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" />
            ) : (
              `${jobs.length} job${jobs.length !== 1 ? 's' : ''} total`
            )}
          </p>
        </div>
        <button
          onClick={() => setShowNewJobModal(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
        >
          + New Job
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────── */}
      <JobFilters
        filters={filters}
        onChange={setFilters}
        totalResults={jobs.length}
      />

      {/* ── Table ───────────────────────────────────── */}
      <div className="mt-4">
        <JobsTable
          jobs={jobs}
          loading={loading}
          onNewJob={() => setShowNewJobModal(true)}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>

      {/* ── New job modal ────────────────────────────── */}
      <NewJobModal
        open={showNewJobModal}
        companyId={DEMO_COMPANY_ID}
        onClose={() => setShowNewJobModal(false)}
        onSuccess={jobId => {
          setShowNewJobModal(false)
          showToast(`Job JOB-${jobId.slice(-6).toUpperCase()} created`, 'success')
          loadJobs()
        }}
      />

      {/* ── Toast notifications ──────────────────────── */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              'flex min-w-[260px] max-w-[340px] items-start gap-3 rounded-card bg-white p-4 shadow-soft-md',
              'border-l-[4px]',
              toast.type === 'success' ? 'border-l-green-500' : 'border-l-red-500'
            )}
          >
            <div
              className={cn(
                'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              )}
            >
              {toast.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm text-soft-text">{toast.message}</p>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
