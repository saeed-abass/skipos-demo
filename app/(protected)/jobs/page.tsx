'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { getJobs, updateJobStatus, type JobRow } from '@/lib/actions/jobs'
import { JobFilters, type FilterState } from '@/components/jobs/JobFilters'
import { JobsTable } from '@/components/jobs/JobsTable'
import { NewJobModal } from '@/components/jobs/NewJobModal'
import { useToast } from '@/components/ui/toast'
import type { JobStatus, JobType } from '@/types'

const INITIAL_FILTERS: FilterState = {
  status: '',
  jobType: '',
  search: '',
  dateFrom: '',
  dateTo: '',
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

export default function JobsPage() {
  const { showToast } = useToast()
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewJobModal, setShowNewJobModal] = useState(false)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)

  const loadJobs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getJobs({
        status: (filters.status as JobStatus) || undefined,
        jobType: (filters.jobType as JobType) || undefined,
        search: filters.search || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      })
      setJobs(data)
    } catch {
      showToast({ type: 'error', title: 'Load failed', message: 'Could not load jobs' })
    } finally {
      setLoading(false)
    }
  }, [filters, showToast])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  async function handleStatusUpdate(jobId: string, status: JobStatus) {
    try {
      await updateJobStatus(jobId, status)
      showToast({ type: 'success', title: 'Status updated' })
      await loadJobs()
    } catch {
      showToast({ type: 'error', title: 'Update failed', message: 'Could not update job status' })
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
        onClose={() => setShowNewJobModal(false)}
        onSuccess={() => {
          setShowNewJobModal(false)
          loadJobs()
        }}
      />
    </PageWrapper>
  )
}
