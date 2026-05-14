'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast'

const DELETE_ITEMS = [
  'All jobs and job history',
  'All customers',
  'All waste transfer notes',
  'All team members',
  'Your company profile',
]

export function DangerZoneSection() {
  const { showToast } = useToast()
  const [showModal, setShowModal]       = useState(false)
  const [confirmText, setConfirmText]   = useState('')
  const [showExportInfo, setShowExportInfo] = useState(false)

  function openModal() {
    setConfirmText('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setConfirmText('')
  }

  function handleDeleteSubmit() {
    showToast({
      type: 'info',
      title: 'Account deletion coming soon',
      message: 'Please contact support@skipos.co.uk',
    })
    closeModal()
  }

  return (
    <>
      <div className="rounded-card border border-red-100 bg-white p-6 shadow-soft">
        {/* Header */}
        <div className="mb-6 border-b border-red-100 pb-4">
          <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
          <p className="mt-1 text-sm text-red-400">Irreversible actions. Proceed with caution.</p>
        </div>

        {/* Export data */}
        <div className="border-b border-gray-50 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-soft-text">Export All Data</p>
              <p className="mt-0.5 text-xs text-soft-muted">
                Download all your jobs, customers, WTNs and fleet data as CSV
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowExportInfo(v => !v)}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-btn border border-gray-200 px-4 py-2 text-sm font-medium text-soft-text transition-colors hover:bg-gray-50"
            >
              Export
              <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-orange-600">
                Beta
              </span>
            </button>
          </div>
          {showExportInfo && (
            <p className="mt-2 text-xs text-soft-muted">
              CSV export is coming in the next update. All your data is securely stored and can be
              exported on request by emailing{' '}
              <a href="mailto:support@skipos.co.uk" className="underline hover:text-soft-text">
                support@skipos.co.uk
              </a>
            </p>
          )}
        </div>

        {/* Delete account */}
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-red-600">Delete Account</p>
            <p className="mt-0.5 max-w-xs text-xs text-red-400">
              Permanently delete your SkipOS account and all associated data. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="flex-shrink-0 rounded-btn border-2 border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-card bg-white shadow-xl">
            {/* Modal header */}
            <div className="bg-gradient-danger px-6 py-4">
              <h2 className="text-base font-semibold text-white">Delete Account</h2>
            </div>

            {/* Modal body */}
            <div className="p-6">
              <p className="mb-3 text-sm font-semibold text-soft-text">This will permanently delete:</p>
              <ul className="mb-5 space-y-1.5">
                {DELETE_ITEMS.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-soft-muted">
                    <span className="text-red-400">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mb-2 text-xs font-semibold text-soft-text">Type DELETE to confirm:</p>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-btn border border-gray-200 px-3 py-2 text-sm text-soft-text placeholder-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-colors"
              />
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-btn border border-gray-200 px-4 py-2 text-sm font-medium text-soft-text transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmText !== 'DELETE'}
                onClick={handleDeleteSubmit}
                className="rounded-btn bg-gradient-danger px-4 py-2 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
