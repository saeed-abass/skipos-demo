'use server'

import { prisma } from '@/lib/prisma'
import { getCompanyId } from '@/lib/actions/utils'
import type { SkipSize, SkipStatus, Condition } from '@/types'
import type { Prisma } from '@prisma/client'

// ─────────────────────────────────────────────────────────
// Exported types
// ─────────────────────────────────────────────────────────

export type SkipRow = Prisma.SkipGetPayload<{}>

export type FleetStats = {
  total: number
  inYard: number
  onSite: number
  atTip: number
  goodCondition: number
  fairCondition: number
  poorCondition: number
}

// ─────────────────────────────────────────────────────────
// Sort helpers
// ─────────────────────────────────────────────────────────

const STATUS_ORDER: Record<string, number> = { IN_YARD: 0, ON_SITE: 1, AT_TIP: 2 }
const SIZE_ORDER: Record<string, number> = {
  TWO_YARD: 2, FOUR_YARD: 4, SIX_YARD: 6, EIGHT_YARD: 8,
  TWELVE_YARD: 12, FOURTEEN_YARD: 14, SIXTEEN_YARD: 16, TWENTY_YARD: 20,
}

function sortSkips(rows: SkipRow[]): SkipRow[] {
  return [...rows].sort((a, b) => {
    const statusDiff = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
    if (statusDiff !== 0) return statusDiff
    return (SIZE_ORDER[a.size] ?? 99) - (SIZE_ORDER[b.size] ?? 99)
  })
}

function generateSkipNumber(): string {
  return `SKP-${Date.now().toString().slice(-6)}`
}

// ─────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────

export async function getSkips(filters?: {
  status?: SkipStatus
  size?: SkipSize
  condition?: Condition
  search?: string
}): Promise<SkipRow[]> {
  try {
    const companyId = await getCompanyId()
    const rows = await prisma.skip.findMany({
      where: {
        company_id: companyId,
        ...(filters?.status    && { status:    filters.status }),
        ...(filters?.size      && { size:       filters.size }),
        ...(filters?.condition && { condition:  filters.condition }),
        ...(filters?.search && {
          OR: [
            { skip_number: { contains: filters.search, mode: 'insensitive' as const } },
            { notes:        { contains: filters.search, mode: 'insensitive' as const } },
          ],
        }),
      },
    })
    return sortSkips(rows)
  } catch (err) {
    console.error('[getSkips]', err)
    return []
  }
}

export async function getFleetStats(): Promise<FleetStats> {
  const companyId = await getCompanyId()
  const [total, inYard, onSite, atTip, good, fair, poor] = await Promise.all([
    prisma.skip.count({ where: { company_id: companyId } }),
    prisma.skip.count({ where: { company_id: companyId, status: 'IN_YARD' } }),
    prisma.skip.count({ where: { company_id: companyId, status: 'ON_SITE' } }),
    prisma.skip.count({ where: { company_id: companyId, status: 'AT_TIP' } }),
    prisma.skip.count({ where: { company_id: companyId, condition: 'GOOD' } }),
    prisma.skip.count({ where: { company_id: companyId, condition: 'FAIR' } }),
    prisma.skip.count({ where: { company_id: companyId, condition: 'POOR' } }),
  ])
  return {
    total, inYard, onSite, atTip,
    goodCondition: good, fairCondition: fair, poorCondition: poor,
  }
}

// ─────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────

export async function createSkip(data: {
  size: SkipSize
  condition: Condition
  serialNumber?: string
  notes?: string
}): Promise<SkipRow> {
  const companyId = await getCompanyId()
  const skipNumber = data.serialNumber?.trim() || generateSkipNumber()
  return prisma.skip.create({
    data: {
      company_id:  companyId,
      skip_number: skipNumber,
      size:        data.size,
      condition:   data.condition,
      status:      'IN_YARD',
      notes:       data.notes?.trim() || null,
    },
  })
}

export async function updateSkipStatus(id: string, status: SkipStatus): Promise<SkipRow> {
  return prisma.skip.update({ where: { id }, data: { status } })
}

export async function updateSkipCondition(id: string, condition: Condition): Promise<SkipRow> {
  return prisma.skip.update({ where: { id }, data: { condition } })
}

export async function updateSkipDetails(
  id: string,
  data: { serialNumber?: string; condition?: Condition; notes?: string }
): Promise<SkipRow> {
  return prisma.skip.update({
    where: { id },
    data: {
      ...(data.serialNumber !== undefined && { skip_number: data.serialNumber.trim() || generateSkipNumber() }),
      ...(data.condition    !== undefined && { condition: data.condition }),
      ...(data.notes        !== undefined && { notes: data.notes.trim() || null }),
    },
  })
}

export async function deleteSkip(id: string): Promise<{ error?: string }> {
  const skip = await prisma.skip.findUnique({ where: { id } })
  if (!skip) return { error: 'Skip not found.' }
  if (skip.status !== 'IN_YARD') {
    return { error: 'Cannot remove a skip that is currently out on site or at tip.' }
  }
  await prisma.skip.delete({ where: { id } })
  return {}
}
