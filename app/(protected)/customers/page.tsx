'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { PageWrapper } from '@/components/layout/page-wrapper'
import {
  getCustomers,
  getCustomerById,
  deleteCustomer,
  type CustomerWithJobCount,
  type CustomerWithJobs,
} from '@/lib/actions/customers'
import { useToast } from '@/components/ui/toast'
import { CustomerFilters } from '@/components/customers/CustomerFilters'
import { CustomersTable } from '@/components/customers/CustomersTable'
import { NewCustomerModal } from '@/components/customers/NewCustomerModal'
import { CustomerDetailPanel } from '@/components/customers/CustomerDetailPanel'

export default function CustomersPage() {
  const { showToast } = useToast()

  const [customers, setCustomers] = useState<CustomerWithJobCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)

  // Detail panel
  const [showPanel, setShowPanel] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithJobs | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [startInEditMode, setStartInEditMode] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    function handler() { setShowNewModal(true) }
    window.addEventListener('skipos:open-new-customer', handler)
    return () => window.removeEventListener('skipos:open-new-customer', handler)
  }, [])

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCustomers(debouncedSearch || undefined)
      setCustomers(data)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  async function openPanel(customerId: string, editMode = false) {
    setSelectedId(customerId)
    setStartInEditMode(editMode)
    setShowPanel(true)
    setSelectedCustomer(null)
    const customer = await getCustomerById(customerId)
    setSelectedCustomer(customer)
  }

  function closePanel() {
    setShowPanel(false)
    setSelectedId(null)
    setSelectedCustomer(null)
    setStartInEditMode(false)
  }

  async function handleUpdated() {
    await loadCustomers()
    if (selectedId) {
      const updated = await getCustomerById(selectedId)
      setSelectedCustomer(updated)
    }
  }

  async function handleDelete(customerId: string) {
    try {
      await deleteCustomer(customerId)
      showToast({ type: 'success', title: 'Customer deleted' })
      if (selectedId === customerId) closePanel()
      await loadCustomers()
    } catch (err) {
      if (err instanceof Error && err.message === 'Customer has active jobs') {
        showToast({ type: 'error', title: 'Cannot delete', message: 'Customer has active jobs' })
      } else {
        showToast({ type: 'error', title: 'Delete failed', message: 'Could not delete customer' })
      }
    }
  }

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-soft-text">Customers</h2>
          <p className="mt-0.5 text-sm text-soft-muted">
            {loading ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" />
            ) : (
              `${customers.length} customer${customers.length !== 1 ? 's' : ''}`
            )}
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
        >
          + New Customer
        </button>
      </div>

      {/* Search */}
      <CustomerFilters
        search={searchInput}
        onChange={setSearchInput}
        totalResults={customers.length}
      />

      {/* Table + panel */}
      <div className="mt-4 flex items-start gap-4">
        {/* Table — shrinks when panel is open */}
        <div className="min-w-0 flex-1">
          <CustomersTable
            customers={customers}
            loading={loading}
            selectedId={selectedId}
            onRowClick={id => openPanel(id)}
            onEdit={id => openPanel(id, true)}
            onDelete={handleDelete}
            onNew={() => setShowNewModal(true)}
          />
        </div>

        {/* Mobile overlay panel */}
        {showPanel && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
            <div className="absolute inset-x-0 bottom-0 top-14 overflow-hidden rounded-t-2xl bg-white shadow-soft-md">
              <CustomerDetailPanel
                customer={selectedCustomer}
                startInEditMode={startInEditMode}
                onClose={closePanel}
                onUpdated={handleUpdated}
              />
            </div>
          </div>
        )}

        {/* Desktop slide-in panel */}
        <div
          className={cn(
            'hidden flex-shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out lg:block',
            showPanel ? 'w-[360px] opacity-100' : 'w-0 opacity-0 pointer-events-none'
          )}
        >
          <div className="w-[360px]">
            <CustomerDetailPanel
              customer={selectedCustomer}
              startInEditMode={startInEditMode}
              onClose={closePanel}
              onUpdated={handleUpdated}
            />
          </div>
        </div>
      </div>

      {/* New customer modal */}
      <NewCustomerModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={() => {
          setShowNewModal(false)
          loadCustomers()
        }}
      />
    </PageWrapper>
  )
}
