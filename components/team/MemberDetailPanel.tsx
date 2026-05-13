'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { RoleBadge } from './RoleBadge'
import { updateMemberRole, updateMemberDetails, removeMember, type UserWithJobs } from '@/lib/actions/team'
import { useToast } from '@/components/ui/toast'
import { JOB_TYPE_LABELS } from '@/types'
import type { Role } from '@/types'

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))
}

function fmtJobDate(date: Date | null | undefined): string {
  if (!date) return 'Unscheduled'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(date))
}

function jobRef(id: string) { return `JOB-${id.slice(-6).toUpperCase()}` }

const AVATAR_GRADIENT: Record<string, string> = {
  ADMIN:  'bg-gradient-navy',
  OFFICE: 'bg-gradient-info',
  DRIVER: 'bg-gradient-orange',
}

const STATUS_CLASSES: Record<string, string> = {
  PENDING:     'bg-slate-100 text-slate-600',
  SCHEDULED:   'bg-blue-50 text-blue-600',
  IN_PROGRESS: 'bg-amber-50 text-amber-600',
  COMPLETED:   'bg-green-50 text-green-700',
  CANCELLED:   'bg-red-50 text-red-600',
}

// ─────────────────────────────────────────────────────────
// Permissions matrix
// ─────────────────────────────────────────────────────────

const PERMISSIONS: { label: string; roles: Role[] }[] = [
  { label: 'View and manage all jobs',       roles: ['ADMIN', 'OFFICE'] },
  { label: 'View and manage all customers',  roles: ['ADMIN', 'OFFICE'] },
  { label: 'Create and submit WTNs',         roles: ['ADMIN', 'OFFICE'] },
  { label: 'Manage team members',            roles: ['ADMIN'] },
  { label: 'Access billing and settings',    roles: ['ADMIN'] },
  { label: 'View assigned jobs only',        roles: ['DRIVER'] },
]

function PermissionsSection({ role }: { role: Role }) {
  return (
    <div className="space-y-1.5">
      {PERMISSIONS.map(p => {
        const allowed = p.roles.includes(role)
        return (
          <div key={p.label} className={cn('flex items-center gap-2 text-xs', allowed ? 'text-green-600' : 'text-gray-400')}>
            <span className="flex-shrink-0 text-sm">{allowed ? '✅' : '❌'}</span>
            <span className={cn(!allowed && 'line-through')}>{p.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Inline role picker
// ─────────────────────────────────────────────────────────

const ROLE_OPTIONS: { role: Role; label: string; description: string }[] = [
  { role: 'ADMIN',  label: 'Admin',        description: 'Full access to all features' },
  { role: 'OFFICE', label: 'Office Staff', description: 'Jobs, customers, WTNs. No billing.' },
  { role: 'DRIVER', label: 'Driver',       description: 'Assigned jobs only' },
]

function RolePicker({
  currentRole,
  memberName,
  onSave,
  onCancel,
}: {
  currentRole: Role
  memberName: string
  onSave: (role: Role) => Promise<void>
  onCancel: () => void
}) {
  const [selected, setSelected] = useState<Role>(currentRole)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (selected === currentRole) { onCancel(); return }
    setSaving(true)
    await onSave(selected)
    setSaving(false)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-soft-muted">
        Change role for {memberName.split(' ')[0]}
      </p>
      {ROLE_OPTIONS.map(o => (
        <label
          key={o.role}
          className={cn(
            'flex cursor-pointer items-start gap-2 rounded-btn border p-2.5 transition-all',
            selected === o.role ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300',
          )}
        >
          <input
            type="radio"
            className="mt-0.5 accent-orange-500"
            checked={selected === o.role}
            onChange={() => setSelected(o.role)}
          />
          <div>
            <p className="text-xs font-semibold text-soft-text">{o.label}</p>
            <p className="text-[0.65rem] text-soft-muted">{o.description}</p>
          </div>
        </label>
      ))}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 rounded-btn border border-gray-200 py-1.5 text-xs font-semibold text-soft-text hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-btn bg-gradient-orange py-1.5 text-xs font-semibold text-white disabled:opacity-60 transition-all"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 p-5">
        <div className="h-14 w-14 flex-shrink-0 rounded-full bg-gray-100" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="h-3 w-40 rounded bg-gray-100" />
        </div>
      </div>
      <div className="space-y-3 border-t border-gray-100 p-5">
        {[90, 60, 80, 50].map((w, i) => (
          <div key={i} className="h-3 rounded bg-gray-100" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Panel
// ─────────────────────────────────────────────────────────

interface MemberDetailPanelProps {
  member: UserWithJobs | null
  currentUserId: string
  onClose: () => void
  onRoleChanged: () => void
  onRemoved: () => void
}

export function MemberDetailPanel({
  member,
  currentUserId,
  onClose,
  onRoleChanged,
  onRemoved,
}: MemberDetailPanelProps) {
  const { showToast } = useToast()
  const [showRolePicker, setShowRolePicker] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [removing, setRemoving] = useState(false)

  const isCurrentUser = member?.id === currentUserId

  function startEditName() {
    setNameInput(member?.full_name ?? '')
    setEditingName(true)
    setShowRolePicker(false)
    setShowRemoveConfirm(false)
  }

  async function saveNameEdit() {
    if (!member || !nameInput.trim()) return
    setSavingName(true)
    try {
      await updateMemberDetails(member.id, { name: nameInput.trim() })
      showToast({ type: 'success', title: 'Name updated' })
      onRoleChanged() // triggers parent reload
    } catch {
      showToast({ type: 'error', title: 'Update failed' })
    }
    setSavingName(false)
    setEditingName(false)
  }

  async function handleRoleSave(role: Role) {
    if (!member) return
    try {
      await updateMemberRole(member.id, role)
      showToast({ type: 'success', title: 'Role updated' })
      onRoleChanged()
    } catch {
      showToast({ type: 'error', title: 'Update failed' })
    }
    setShowRolePicker(false)
  }

  async function handleRemove() {
    if (!member) return
    setRemoving(true)
    try {
      const result = await removeMember(member.id)
      if (result?.error) {
        showToast({ type: 'error', title: 'Remove failed', message: result.error })
      } else {
        showToast({ type: 'success', title: 'Member removed' })
        onRemoved()
        onClose()
      }
    } catch {
      showToast({ type: 'error', title: 'Remove failed' })
    }
    setRemoving(false)
    setShowRemoveConfirm(false)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card bg-white shadow-soft">

      {/* Header */}
      <div className="flex items-start gap-3 p-5">
        {!member ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className={cn(
              'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-white',
              AVATAR_GRADIENT[member.role] ?? 'bg-gradient-orange',
            )}>
              {initials(member.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveNameEdit(); if (e.key === 'Escape') setEditingName(false) }}
                    className="w-full rounded-btn border border-orange-300 px-2 py-1 text-sm font-semibold text-soft-text focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <button
                    onClick={saveNameEdit}
                    disabled={savingName}
                    className="flex-shrink-0 rounded-btn bg-gradient-orange px-2 py-1 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {savingName ? '…' : 'Save'}
                  </button>
                </div>
              ) : (
                <p className="truncate text-base font-semibold text-soft-text">{member.full_name}</p>
              )}
              <div className="mt-1">
                <RoleBadge role={member.role as Role} />
              </div>
              <p className="mt-1 truncate text-xs text-soft-muted">{member.email}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {!editingName && (
                <button
                  onClick={startEditName}
                  title="Edit name"
                  className="flex h-7 w-7 items-center justify-center rounded-btn text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-btn text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {member && (
        <div className="flex-1 overflow-y-auto">

          {/* Section 1 — Contact */}
          <div className="border-t border-gray-100 p-5">
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
              Contact
            </p>
            <div className="space-y-2">
              {[
                { label: 'Email',  value: member.email },
                { label: 'Role',   value: <RoleBadge role={member.role as Role} /> },
                { label: 'Joined', value: fmtDate(member.created_at) },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-soft-muted">{row.label}</span>
                  <span className="text-right text-xs font-semibold text-soft-text">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 — Assigned Jobs */}
          <div className="border-t border-gray-100 p-5">
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
              Assigned Jobs
            </p>
            {member.role !== 'DRIVER' ? (
              <p className="text-xs italic text-soft-muted">
                Job assignment is available for Driver role members only.
              </p>
            ) : member.jobs.length === 0 ? (
              <p className="text-xs text-soft-muted">No jobs assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {member.jobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between gap-2 rounded-btn border border-gray-100 p-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.65rem] font-semibold text-soft-text">
                        {jobRef(job.id)}
                      </span>
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[0.6rem] font-semibold text-blue-600">
                        {JOB_TYPE_LABELS[job.job_type as keyof typeof JOB_TYPE_LABELS] ?? job.job_type}
                      </span>
                      <span className={cn(
                        'rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold',
                        STATUS_CLASSES[job.status] ?? 'bg-gray-100 text-gray-600',
                      )}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[0.65rem] text-soft-muted">
                      {fmtJobDate(job.scheduled_date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3 — Access Level */}
          <div className="border-t border-gray-100 p-5">
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted">
              Access Level
            </p>
            <PermissionsSection role={member.role as Role} />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-5">
            {showRolePicker ? (
              <RolePicker
                currentRole={member.role as Role}
                memberName={member.full_name}
                onSave={handleRoleSave}
                onCancel={() => setShowRolePicker(false)}
              />
            ) : showRemoveConfirm ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-soft-text">
                  Remove {member.full_name} from your team?
                </p>
                <p className="text-xs text-soft-muted">
                  They will lose access to the platform immediately.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRemoveConfirm(false)}
                    className="flex-1 rounded-btn border border-gray-200 py-2 text-xs font-semibold text-soft-text hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="flex-1 rounded-btn bg-red-500 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-all"
                  >
                    {removing ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => { setShowRolePicker(true); setShowRemoveConfirm(false) }}
                  className="w-full rounded-btn border border-gray-200 py-2 text-xs font-semibold text-soft-text hover:bg-gray-50 transition-colors"
                >
                  Change Role
                </button>
                {!isCurrentUser && (
                  <button
                    onClick={() => { setShowRemoveConfirm(true); setShowRolePicker(false) }}
                    className="w-full rounded-btn border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Remove from Team
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
