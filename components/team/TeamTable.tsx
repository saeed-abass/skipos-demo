'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { RoleBadge } from './RoleBadge'
import { updateMemberRole, removeMember, type UserWithJobCount } from '@/lib/actions/team'
import { useToast } from '@/components/ui/toast'
import type { Role } from '@/types'

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))
}

const AVATAR_GRADIENT: Record<string, string> = {
  ADMIN:  'bg-gradient-navy',
  OFFICE: 'bg-gradient-info',
  DRIVER: 'bg-gradient-orange',
}

// ─────────────────────────────────────────────────────────
// Inline role picker
// ─────────────────────────────────────────────────────────

const ROLE_OPTIONS: { role: Role; label: string; description: string }[] = [
  { role: 'ADMIN',  label: 'Admin',        description: 'Full access to all features' },
  { role: 'OFFICE', label: 'Office Staff',  description: 'Jobs, customers, WTNs. No billing.' },
  { role: 'DRIVER', label: 'Driver',        description: 'Assigned jobs only' },
]

function RolePicker({
  member,
  onSave,
  onCancel,
}: {
  member: UserWithJobCount
  onSave: (role: Role) => Promise<void>
  onCancel: () => void
}) {
  const [selected, setSelected] = useState<Role>(member.role as Role)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (selected === member.role) { onCancel(); return }
    setSaving(true)
    await onSave(selected)
    setSaving(false)
  }

  return (
    <div className="w-64 rounded-btn border border-gray-200 bg-white p-3 shadow-soft-md">
      <p className="mb-2.5 text-xs font-semibold text-soft-text">
        Change role for {member.full_name.split(' ')[0]}
      </p>
      <div className="space-y-1.5">
        {ROLE_OPTIONS.map(o => (
          <label
            key={o.role}
            className={cn(
              'flex cursor-pointer items-start gap-2 rounded-btn border p-2 transition-all',
              selected === o.role
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300',
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
      </div>
      <div className="mt-3 flex items-center gap-2">
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
// Three-dot menu
// ─────────────────────────────────────────────────────────

type MenuMode = 'menu' | 'role' | 'remove'

function ActionsMenu({
  member,
  currentUserId,
  isLastAdmin,
  onView,
  onRoleChanged,
  onRemoved,
}: {
  member: UserWithJobCount
  currentUserId: string
  isLastAdmin: boolean
  onView: () => void
  onRoleChanged: () => void
  onRemoved: () => void
}) {
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<MenuMode>('menu')
  const [removing, setRemoving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isCurrentUser = member.id === currentUserId

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setMode('menu')
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleSaveRole(role: Role) {
    try {
      await updateMemberRole(member.id, role)
      showToast({ type: 'success', title: 'Role updated' })
      onRoleChanged()
    } catch {
      showToast({ type: 'error', title: 'Update failed', message: 'Could not update role' })
    }
    setOpen(false)
    setMode('menu')
  }

  async function handleRemove() {
    setRemoving(true)
    try {
      const result = await removeMember(member.id)
      if (result?.error) {
        showToast({ type: 'error', title: 'Remove failed', message: result.error })
      } else {
        showToast({ type: 'success', title: 'Member removed' })
        onRemoved()
      }
    } catch {
      showToast({ type: 'error', title: 'Remove failed', message: 'Could not remove member' })
    }
    setRemoving(false)
    setOpen(false)
    setMode('menu')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(p => !p); setMode('menu') }}
        className="flex h-7 w-7 items-center justify-center rounded-btn text-soft-muted hover:bg-gray-100 hover:text-soft-text transition-colors"
        aria-label="Actions"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4">
          <circle cx="12" cy="5"  r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20">
          {mode === 'menu' && (
            <div className="w-48 overflow-hidden rounded-btn border border-gray-200 bg-white shadow-soft-md">
              <button
                onClick={() => { setOpen(false); onView() }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors"
              >
                View details
              </button>
              <button
                onClick={() => setMode('role')}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-soft-text hover:bg-gray-50 transition-colors"
              >
                Change role
              </button>
              <div className="my-1 border-t border-gray-100" />
              {isCurrentUser ? (
                <div className="px-3 py-2 text-xs text-soft-muted">This is you</div>
              ) : isLastAdmin ? (
                <div className="px-3 py-2 text-xs text-soft-muted">Cannot remove the last admin</div>
              ) : (
                <button
                  onClick={() => setMode('remove')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Remove from team
                </button>
              )}
            </div>
          )}

          {mode === 'role' && (
            <RolePicker
              member={member}
              onSave={handleSaveRole}
              onCancel={() => { setMode('menu'); setOpen(false) }}
            />
          )}

          {mode === 'remove' && (
            <div className="w-64 rounded-btn border border-gray-200 bg-white p-4 shadow-soft-md">
              <p className="text-sm font-semibold text-soft-text">Remove {member.full_name}?</p>
              <p className="mt-1 text-xs text-soft-muted">
                They will lose access to the platform immediately.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => { setMode('menu'); setOpen(false) }}
                  className="flex-1 rounded-btn border border-gray-200 py-1.5 text-xs font-semibold text-soft-text hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="flex-1 rounded-btn bg-red-500 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-all"
                >
                  {removing ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <tr key={i} className="animate-pulse border-t border-gray-100">
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gray-100" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-gray-100" />
                <div className="h-2.5 w-36 rounded bg-gray-100" />
              </div>
            </div>
          </td>
          {[...Array(5)].map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-3 w-16 rounded bg-gray-100" />
            </td>
          ))}
          <td className="px-4 py-3" />
        </tr>
      ))}
    </>
  )
}

// ─────────────────────────────────────────────────────────
// Table
// ─────────────────────────────────────────────────────────

interface TeamTableProps {
  members: UserWithJobCount[]
  loading: boolean
  currentUserId: string
  onView: (member: UserWithJobCount) => void
  onRoleChanged: () => void
  onRemoved: () => void
  onNew: () => void
}

export function TeamTable({
  members,
  loading,
  currentUserId,
  onView,
  onRoleChanged,
  onRemoved,
  onNew,
}: TeamTableProps) {
  const adminCount = members.filter(m => m.role === 'ADMIN').length

  const sorted = [...members].sort((a, b) => {
    if (a.id === currentUserId) return -1
    if (b.id === currentUserId) return 1
    return 0
  })

  return (
    <div className="overflow-hidden rounded-card bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Member', 'Role', 'Jobs Assigned', 'Joined', 'Status', ''].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-widest text-soft-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-10 w-10 text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-soft-text">No team members yet</p>
                    <p className="text-xs text-soft-muted">Invite drivers and office staff to collaborate</p>
                    <button
                      onClick={onNew}
                      className="mt-1 inline-flex items-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
                    >
                      + Invite Member
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map(member => {
                const isCurrentUser = member.id === currentUserId
                const isLastAdmin = member.role === 'ADMIN' && adminCount === 1

                return (
                  <tr
                    key={member.id}
                    className={cn(
                      'border-t border-gray-100 hover:bg-gray-50/60 transition-colors',
                      isCurrentUser && 'bg-orange-50/30',
                    )}
                  >
                    {/* Member */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                          AVATAR_GRADIENT[member.role] ?? 'bg-gradient-orange',
                        )}>
                          {initials(member.full_name)}
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-soft-text">
                            {member.full_name}
                            {isCurrentUser && (
                              <span className="text-[0.65rem] font-normal text-soft-muted">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-soft-muted">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <RoleBadge role={member.role as Role} />
                    </td>

                    {/* Jobs Assigned */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        member._count.jobs > 0
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-gray-100 text-gray-500',
                      )}>
                        {member._count.jobs}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-sm text-soft-muted">
                      {formatDate(member.created_at)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <ActionsMenu
                        member={member}
                        currentUserId={currentUserId}
                        isLastAdmin={isLastAdmin}
                        onView={() => onView(member)}
                        onRoleChanged={onRoleChanged}
                        onRemoved={onRemoved}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && sorted.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 text-xs text-soft-muted">
          {sorted.length} member{sorted.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
