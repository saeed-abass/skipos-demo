'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getCompanyId } from '@/lib/actions/utils'
import type { Prisma } from '@prisma/client'
import type { Role } from '@/types'

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function emailToName(email: string): string {
  const first = email.split('@')[0].split('.')[0]
  return first.charAt(0).toUpperCase() + first.slice(1)
}

const ROLE_ORDER: Record<string, number> = { ADMIN: 0, OFFICE: 1, DRIVER: 2 }

// ─────────────────────────────────────────────────────────
// Exported types (defined before functions to break cycles)
// ─────────────────────────────────────────────────────────

export type UserWithJobCount = Prisma.UserGetPayload<{
  include: { _count: { select: { jobs: true } } }
}>

export type UserWithJobs = Prisma.UserGetPayload<{
  include: {
    jobs: {
      select: {
        id: true
        job_type: true
        status: true
        skip_size: true
        scheduled_date: true
        customer: { select: { name: true } }
      }
    }
  }
}>

// ─────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────

export async function getTeamMembers(): Promise<{ members: UserWithJobCount[]; currentUserId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { members: [], currentUserId: '' }

  const companyId = user.id

  // Ensure the logged-in user has a record in the users table
  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        company_id: companyId,
        email: user.email,
        full_name: emailToName(user.email),
        role: 'ADMIN',
      },
    })
  } catch {
    // Company FK may not exist in dev — safe to ignore
  }

  const rows = await prisma.user.findMany({
    where: { company_id: companyId },
    include: { _count: { select: { jobs: true } } },
    orderBy: { created_at: 'asc' },
  })

  const members = [...rows].sort(
    (a, b) => (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99)
  )

  return { members, currentUserId: user.id }
}

export async function getMemberById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      jobs: {
        select: {
          id: true,
          job_type: true,
          status: true,
          skip_size: true,
          scheduled_date: true,
          customer: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 5,
      },
    },
  })
}

// ─────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────

export async function inviteTeamMember(data: {
  email: string
  name: string
  role: Role
}) {
  const companyId = await getCompanyId()

  const existing = await prisma.user.findFirst({
    where: { email: data.email, company_id: companyId },
  })
  if (existing) return { error: 'This email is already a member of your team.' }

  const { data: inviteData, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    data.email,
    {
      data: { companyId, name: data.name, role: data.role },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/update-password`,
    }
  )
  if (error) return { error: error.message }

  await prisma.user.create({
    data: {
      id: inviteData.user.id,
      company_id: companyId,
      email: data.email,
      full_name: data.name,
      role: data.role,
    },
  })

  return {}
}

export async function updateMemberRole(userId: string, role: Role) {
  await prisma.user.update({ where: { id: userId }, data: { role } })
}

export async function updateMemberDetails(userId: string, data: { name?: string }) {
  if (!data.name) return
  await prisma.user.update({
    where: { id: userId },
    data: { full_name: data.name },
  })
}

export async function removeMember(userId: string) {
  const member = await prisma.user.findUnique({ where: { id: userId } })
  if (!member) return { error: 'Member not found.' }

  if (member.role === 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: { company_id: member.company_id, role: 'ADMIN' },
    })
    if (adminCount <= 1) return { error: 'Cannot remove the last admin.' }
  }

  await prisma.user.delete({ where: { id: userId } })
  try {
    await supabaseAdmin.auth.admin.deleteUser(userId)
  } catch {
    // Auth user may already be gone
  }

  return {}
}
