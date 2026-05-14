'use server'

import { prisma } from '@/lib/prisma'
import { getCompanyId } from '@/lib/actions/utils'
import type { Prisma } from '@prisma/client'

// ─────────────────────────────────────────────────────────
// Return types
// ─────────────────────────────────────────────────────────

export type DashboardStats = {
  todaysJobs: number
  activeSkips: number
  pendingWTNs: number
  thisMonthRevenue: number
}

export type RecentJob = Prisma.JobGetPayload<{
  include: {
    customer: { select: { name: true; phone: true } }
    driver:   { select: { full_name: true } }
  }
}>

export type ScheduleJob = Prisma.JobGetPayload<{
  include: {
    customer: { select: { name: true } }
  }
}>

export type FleetCounts = {
  inYard: number
  onSite: number
  atTip:  number
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function todayBounds(): { start: Date; end: Date } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

// ─────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const companyId = await getCompanyId()
  const { start, end } = todayBounds()

  const [todaysJobs, activeSkips, pendingWTNs] = await Promise.all([
    prisma.job.count({
      where: {
        company_id:     companyId,
        scheduled_date: { gte: start, lte: end },
        status:         { not: 'CANCELLED' },
      },
    }),
    prisma.skip.count({
      where: {
        company_id: companyId,
        status:     { in: ['ON_SITE', 'AT_TIP'] },
      },
    }),
    prisma.wasteTransferNote.count({
      where: {
        company_id: companyId,
        status:     { in: ['DRAFT', 'SIGNED'] },
      },
    }),
  ])

  return { todaysJobs, activeSkips, pendingWTNs, thisMonthRevenue: 0 }
}

export async function getRecentJobs(): Promise<RecentJob[]> {
  const companyId = await getCompanyId()
  return prisma.job.findMany({
    where:   { company_id: companyId },
    include: {
      customer: { select: { name: true, phone: true } },
      driver:   { select: { full_name: true } },
    },
    orderBy: { created_at: 'desc' },
    take:    5,
  })
}

export async function getTodaysSchedule(): Promise<ScheduleJob[]> {
  const companyId = await getCompanyId()
  const { start, end } = todayBounds()

  return prisma.job.findMany({
    where: {
      company_id:     companyId,
      scheduled_date: { gte: start, lte: end },
      status:         { not: 'CANCELLED' },
    },
    include: {
      customer: { select: { name: true } },
    },
    orderBy: { scheduled_date: 'asc' },
  })
}

export async function getFleetStatusCounts(): Promise<FleetCounts> {
  const companyId = await getCompanyId()
  const [inYard, onSite, atTip] = await Promise.all([
    prisma.skip.count({ where: { company_id: companyId, status: 'IN_YARD' } }),
    prisma.skip.count({ where: { company_id: companyId, status: 'ON_SITE' } }),
    prisma.skip.count({ where: { company_id: companyId, status: 'AT_TIP' } }),
  ])
  return { inYard, onSite, atTip }
}

export async function getCompanyComplianceStatus(): Promise<{ ea_registration: string | null } | null> {
  const companyId = await getCompanyId()
  return prisma.company.findUnique({
    where:  { id: companyId },
    select: { ea_registration: true },
  })
}
