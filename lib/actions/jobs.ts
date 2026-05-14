'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import type { JobStatus, JobType, SkipSize } from '@/types'

async function getCompanyId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function getJobs(filters?: {
  status?: JobStatus
  jobType?: JobType
  search?: string
  dateFrom?: string
  dateTo?: string
}) {
  try {
    const companyId = await getCompanyId()
    return await prisma.job.findMany({
      where: {
        company_id: companyId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.jobType && { job_type: filters.jobType }),
        ...((filters?.dateFrom || filters?.dateTo) && {
          scheduled_date: {
            ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
            ...(filters.dateTo && { lte: new Date(filters.dateTo + 'T23:59:59') }),
          },
        }),
        ...(filters?.search && {
          OR: [
            { delivery_address: { contains: filters.search, mode: 'insensitive' as const } },
            { customer: { name: { contains: filters.search, mode: 'insensitive' as const } } },
          ],
        }),
      },
      select: {
        id: true,
        company_id: true,
        customer_id: true,
        driver_id: true,
        job_number: true,
        job_type: true,
        status: true,
        skip_size: true,
        delivery_address: true,
        delivery_postcode: true,
        scheduled_date: true,
        permit_required: true,
        permit_number: true,
        price: true,
        notes: true,
        created_at: true,
        customer: { select: { id: true, name: true, phone: true } },
        driver: { select: { id: true, full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    })
  } catch (err) {
    console.error('[getJobs]', err)
    return []
  }
}

export async function createJob(data: {
  customer_id: string
  job_type: JobType
  skip_size: SkipSize
  delivery_address: string
  delivery_postcode: string
  scheduled_date?: Date | null
  driver_id?: string | null
  notes?: string | null
  price?: number | null
  permit_required?: boolean
}) {
  const companyId = await getCompanyId()
  const created = await prisma.job.create({
    data: {
      company_id: companyId,
      customer_id: data.customer_id,
      job_type: data.job_type,
      skip_size: data.skip_size,
      delivery_address: data.delivery_address,
      delivery_postcode: data.delivery_postcode,
      scheduled_date: data.scheduled_date ?? null,
      driver_id: data.driver_id ?? null,
      notes: data.notes ?? null,
      price: data.price ?? null,
      permit_required: data.permit_required ?? false,
      status: 'PENDING',
    },
    select: { id: true },
  })
  const jobNumber = `JOB-${created.id.slice(-6).toUpperCase()}`
  return prisma.job.update({
    where: { id: created.id },
    data: { job_number: jobNumber },
    select: { id: true, job_number: true, status: true, job_type: true },
  })
}

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const companyId = await getCompanyId()
  return prisma.job.update({
    where: { id: jobId, company_id: companyId },
    data: { status },
    select: { id: true, status: true },
  })
}

export async function getCustomersForCompany() {
  try {
    const companyId = await getCompanyId()
    return await prisma.customer.findMany({
      where: { company_id: companyId },
      select: { id: true, name: true, phone: true, address: true, postcode: true },
      orderBy: { name: 'asc' },
    })
  } catch (err) {
    console.error('[getCustomersForCompany]', err)
    return []
  }
}

export async function getDriversForCompany() {
  try {
    const companyId = await getCompanyId()
    return await prisma.user.findMany({
      where: { company_id: companyId, role: 'DRIVER' },
      select: { id: true, full_name: true },
      orderBy: { full_name: 'asc' },
    })
  } catch (err) {
    console.error('[getDriversForCompany]', err)
    return []
  }
}

export type JobRow = Awaited<ReturnType<typeof getJobs>>[number]
export type CustomerOption = Awaited<ReturnType<typeof getCustomersForCompany>>[number]
export type DriverOption = Awaited<ReturnType<typeof getDriversForCompany>>[number]
