'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { updateCompanyProfile } from '@/lib/actions/settings'
import type { Company } from '@/types'

interface Props {
  company: Company | null
  loading: boolean
  onSaved: () => void
}

const inputCls =
  'w-full rounded-btn border border-gray-200 px-3 py-2 text-sm text-soft-text placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors'

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SkeletonForm() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 rounded-btn bg-gray-100" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 rounded-btn bg-gray-100" />
        <div className="h-10 rounded-btn bg-gray-100" />
      </div>
      <div className="h-16 rounded-btn bg-gray-100" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 rounded-btn bg-gray-100" />
        <div className="h-10 rounded-btn bg-gray-100" />
      </div>
    </div>
  )
}

export function CompanyProfileSection({ company, loading, onSaved }: Props) {
  const { showToast } = useToast()

  const [name, setName]             = useState('')
  const [phone, setPhone]           = useState('')
  const [email, setEmail]           = useState('')
  const [address, setAddress]       = useState('')
  const [postcode, setPostcode]     = useState('')
  const [companyNum, setCompanyNum] = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    if (!company) return
    setName(company.name ?? '')
    setPhone(company.phone ?? '')
    setEmail(company.email ?? '')
    setAddress(company.address ?? '')
    setPostcode(company.postcode ?? '')
    setCompanyNum(company.company_number ?? '')
  }, [company])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateCompanyProfile({
        name,
        phone,
        email,
        address,
        postcode,
        company_number: companyNum.trim() || null,
      })
      showToast({ type: 'success', title: 'Company profile updated' })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const updatedAt = company?.updated_at
    ? new Date(company.updated_at as unknown as string).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const initials = (company?.name ?? name)
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="rounded-card bg-white p-6 shadow-soft">
      {/* Header */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-soft-text">Company Profile</h3>
        <p className="mt-1 text-sm text-soft-muted">Your business details and contact information</p>
      </div>

      {/* Logo */}
      <div className="mb-6 flex items-center gap-6">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-navy">
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt="Company logo"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-white">{initials}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-soft-text">Company Logo</p>
          <p className="mt-0.5 text-xs text-soft-muted">Upload a logo to appear on WTNs and emails</p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast({ type: 'info', title: 'Logo upload coming soon' })}
              className="rounded-btn border border-gray-200 px-3 py-1.5 text-xs font-medium text-soft-text hover:bg-gray-50 transition-colors"
            >
              Upload Logo
            </button>
            {company?.logo_url && (
              <button type="button" className="text-xs text-red-400 hover:text-red-500 transition-colors">
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <SkeletonForm />
      ) : (
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 gap-4">
            {/* Company Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-soft-text">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className={inputCls}
                placeholder="Your company name"
              />
            </div>

            {/* Phone | Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-soft-text">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 01234 567890"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-soft-text">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="hello@company.co.uk"
                />
              </div>
            </div>

            {/* Business Address */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-soft-text">
                Business Address <span className="text-red-400">*</span>
              </label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={2}
                className={cn(inputCls, 'resize-none')}
                placeholder="123 Business Street, City"
              />
            </div>

            {/* Postcode | Companies House Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-soft-text">Postcode</label>
                <input
                  type="text"
                  value={postcode}
                  onChange={e => setPostcode(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. SW1A 1AA"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-soft-text">
                  Companies House Number
                </label>
                <input
                  type="text"
                  value={companyNum}
                  onChange={e => setCompanyNum(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 12345678"
                />
                <p className="mt-1 text-xs text-soft-muted">Optional — used for compliance verification</p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-btn border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-xs text-soft-muted">
              {updatedAt ? `Last updated ${updatedAt}` : ''}
            </span>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-btn bg-gradient-orange px-5 py-2 text-sm font-bold text-white shadow-soft transition-all hover:shadow-md disabled:opacity-70"
            >
              {saving && <Spinner />}
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
