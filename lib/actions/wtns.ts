'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import type { WTNStatus } from '@/types'

async function getCompanyId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function serializeWTN<T extends { quantity_kg: { toNumber(): number } | null }>(
  w: T
): Omit<T, 'quantity_kg'> & { quantity_kg: number | null } {
  return { ...w, quantity_kg: w.quantity_kg != null ? w.quantity_kg.toNumber() : null }
}

// ─────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────

export async function getWTNs(filters?: {
  status?: WTNStatus
  search?: string
  dateFrom?: string
  dateTo?: string
}) {
  try {
    const companyId = await getCompanyId()
    const rows = await prisma.wasteTransferNote.findMany({
      where: {
        company_id: companyId,
        ...(filters?.status && { status: filters.status }),
        ...((filters?.dateFrom || filters?.dateTo) && {
          transfer_date: {
            ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
            ...(filters.dateTo  && { lte: new Date(filters.dateTo + 'T23:59:59') }),
          },
        }),
        ...(filters?.search && {
          OR: [
            { wtn_number:        { contains: filters.search, mode: 'insensitive' as const } },
            { waste_description: { contains: filters.search, mode: 'insensitive' as const } },
            { job: { customer: { name: { contains: filters.search, mode: 'insensitive' as const } } } },
          ],
        }),
      },
      include: {
        job: {
          select: {
            id: true,
            job_type: true,
            skip_size: true,
            delivery_address: true,
            customer: { select: { id: true, name: true, phone: true, address: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })
    return rows.map(serializeWTN)
  } catch (err) {
    console.error('[getWTNs]', err)
    return []
  }
}

export async function getWTNById(id: string) {
  try {
    const companyId = await getCompanyId()
    const row = await prisma.wasteTransferNote.findFirst({
      where: { id, company_id: companyId },
      include: {
        job: {
          select: {
            id: true,
            job_type: true,
            skip_size: true,
            delivery_address: true,
            delivery_postcode: true,
            customer: { select: { id: true, name: true, phone: true, address: true } },
          },
        },
      },
    })
    return row ? serializeWTN(row) : null
  } catch (err) {
    console.error('[getWTNById]', err)
    return null
  }
}

// ─────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────

export async function createWTN(data: {
  jobId: string
  wasteDescription: string
  ewcCode: string
  quantityKg?: number
  collectionAddress: string
  collectionPostcode: string
  disposalSiteName?: string
  disposalSiteAddress?: string
  consigneeName?: string
  consigneeAddress?: string
  carrierName: string
  carrierEaNumber?: string
  transferDate: string
  notes?: string
}) {
  const companyId = await getCompanyId()
  const wtnNumber = 'WTN-' + Date.now().toString().slice(-6)
  return prisma.wasteTransferNote.create({
    data: {
      company_id:           companyId,
      job_id:               data.jobId,
      wtn_number:           wtnNumber,
      waste_description:    data.wasteDescription,
      ewc_code:             data.ewcCode || '',
      quantity_kg:          data.quantityKg ?? null,
      container_type:       'Skip',
      collection_address:   data.collectionAddress,
      collection_postcode:  data.collectionPostcode,
      disposal_site_name:   data.disposalSiteName    || null,
      disposal_site_address: data.disposalSiteAddress || null,
      consignee_name:       data.consigneeName       || null,
      consignee_address:    data.consigneeAddress    || null,
      carrier_name:         data.carrierName,
      carrier_ea_number:    data.carrierEaNumber     || '',
      transfer_date:        new Date(data.transferDate),
      status:               'DRAFT',
    },
    select: { id: true, wtn_number: true, status: true },
  })
}

export async function updateWTNStatus(id: string, status: WTNStatus) {
  const companyId = await getCompanyId()
  return prisma.wasteTransferNote.update({
    where:  { id, company_id: companyId },
    data:   { status },
    select: { id: true, status: true },
  })
}

// ─────────────────────────────────────────────────────────
// Jobs eligible for a new WTN
// ─────────────────────────────────────────────────────────

export async function getJobsForWTN() {
  try {
    const companyId = await getCompanyId()
    return await prisma.job.findMany({
      where: {
        company_id: companyId,
        wtn: { is: null },
      },
      select: {
        id: true,
        job_type: true,
        skip_size: true,
        delivery_address: true,
        delivery_postcode: true,
        customer_id: true,
        customer: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    })
  } catch (err) {
    console.error('[getJobsForWTN]', err)
    return []
  }
}

// ─────────────────────────────────────────────────────────
// Exported types
// ─────────────────────────────────────────────────────────

export type WTNRow    = Awaited<ReturnType<typeof getWTNs>>[number]
export type WTNDetail = NonNullable<Awaited<ReturnType<typeof getWTNById>>>
export type JobForWTN = Awaited<ReturnType<typeof getJobsForWTN>>[number]
