'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { PageWrapper } from '@/components/layout/page-wrapper'
import {
  getTeamMembers,
  getMemberById,
  type UserWithJobCount,
  type UserWithJobs,
} from '@/lib/actions/team'
import { TeamTable } from '@/components/team/TeamTable'
import { InviteMemberModal } from '@/components/team/InviteMemberModal'
import { MemberDetailPanel } from '@/components/team/MemberDetailPanel'
import { useToast } from '@/components/ui/toast'

// ─────────────────────────────────────────────────────────
// Role summary cards
// ─────────────────────────────────────────────────────────

type SummaryCardProps = {
  count: number
  label: string
  sublabel: string
  gradient: string
  iconPath: string
}

function SummaryCard({ count, label, sublabel, gradient, iconPath }: SummaryCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-card bg-white p-4 shadow-soft">
      <div className={cn(
        'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-btn',
        gradient,
      )}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <div>
        <p className="text-xl font-bold text-soft-text">{count}</p>
        <p className="text-sm font-semibold text-soft-text">{label}</p>
        <p className="text-xs text-soft-muted">{sublabel}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

export default function TeamPage() {
  const { showToast } = useToast()

  const [members, setMembers] = useState<UserWithJobCount[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Detail panel
  const [showPanel, setShowPanel] = useState(false)
  const [selectedMember, setSelectedMember] = useState<UserWithJobs | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadTeam = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTeamMembers()
      setMembers(data.members)
      setCurrentUserId(data.currentUserId)
    } catch {
      showToast({ type: 'error', title: 'Load failed', message: 'Could not load team members' })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadTeam() }, [loadTeam])

  async function openPanel(member: UserWithJobCount) {
    setSelectedId(member.id)
    setShowPanel(true)
    setSelectedMember(null)
    const detail = await getMemberById(member.id)
    setSelectedMember(detail)
  }

  function closePanel() {
    setShowPanel(false)
    setSelectedId(null)
    setSelectedMember(null)
  }

  async function handleRoleChanged() {
    await loadTeam()
    if (selectedId) {
      const updated = await getMemberById(selectedId)
      setSelectedMember(updated)
    }
  }

  function handleRemoved() {
    closePanel()
    loadTeam()
  }

  const adminCount  = members.filter(m => m.role === 'ADMIN').length
  const officeCount = members.filter(m => m.role === 'OFFICE').length
  const driverCount = members.filter(m => m.role === 'DRIVER').length

  return (
    <PageWrapper>

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-soft-text">Team</h2>
          <p className="mt-0.5 text-sm text-soft-muted">
            {loading ? (
              <span className="inline-block h-4 w-20 animate-pulse rounded bg-gray-200" />
            ) : (
              `${members.length} member${members.length !== 1 ? 's' : ''}`
            )}
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-gradient-orange px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.025em] text-white shadow-soft hover:shadow-md transition-all"
        >
          + Invite Member
        </button>
      </div>

      {/* Role summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          count={adminCount}
          label="Admins"
          sublabel="Full access"
          gradient="bg-gradient-navy"
          iconPath="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
        <SummaryCard
          count={officeCount}
          label="Office Staff"
          sublabel="Jobs and customers"
          gradient="bg-gradient-info"
          iconPath="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
        />
        <SummaryCard
          count={driverCount}
          label="Drivers"
          sublabel="Assigned jobs only"
          gradient="bg-gradient-orange"
          iconPath="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
        />
      </div>

      {/* Table + detail panel */}
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <TeamTable
            members={members}
            loading={loading}
            currentUserId={currentUserId}
            onView={openPanel}
            onRoleChanged={handleRoleChanged}
            onRemoved={handleRemoved}
            onNew={() => setShowInviteModal(true)}
          />
        </div>

        {/* Mobile overlay panel */}
        {showPanel && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
            <div className="absolute inset-x-0 bottom-0 top-14 overflow-hidden rounded-t-2xl bg-white shadow-soft-md">
              <MemberDetailPanel
                member={selectedMember}
                currentUserId={currentUserId}
                onClose={closePanel}
                onRoleChanged={handleRoleChanged}
                onRemoved={handleRemoved}
              />
            </div>
          </div>
        )}

        {/* Desktop slide-in panel */}
        <div className={cn(
          'hidden flex-shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out lg:block',
          showPanel ? 'w-[360px] opacity-100' : 'w-0 opacity-0 pointer-events-none',
        )}>
          <div className="w-[360px]">
            <MemberDetailPanel
              member={selectedMember}
              currentUserId={currentUserId}
              onClose={closePanel}
              onRoleChanged={handleRoleChanged}
              onRemoved={handleRemoved}
            />
          </div>
        </div>
      </div>

      {/* Invite modal */}
      <InviteMemberModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={loadTeam}
      />

    </PageWrapper>
  )
}
