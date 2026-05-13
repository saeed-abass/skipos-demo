'use server'

import { prisma } from '@/lib/prisma'
import type { JobStatus, JobType, SkipSize } from '@/types'

export async function getJobs(
  companyId: string,
  filters?: {
    status?: JobStatus
    jobType?: JobType
    search?: string
    dateFrom?: string
    dateTo?: string
  }
) {
  try {
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
        job_type: true,
        status: true,
        skip_size: true,
        delivery_address: true,
        delivery_postcode: true,
        scheduled_date: true,
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
  company_id: string
  customer_id: string
  job_type: JobType
  skip_size: SkipSize
  delivery_address: string
  delivery_postcode: string
  scheduled_date?: Date | null
  driver_id?: string | null
  notes?: string | null
}) {
  return prisma.job.create({
    data: {
      company_id: data.company_id,
      customer_id: data.customer_id,
      job_type: data.job_type,
      skip_size: data.skip_size,
      delivery_address: data.delivery_address,
      delivery_postcode: data.delivery_postcode,
      scheduled_date: data.scheduled_date ?? null,
      driver_id: data.driver_id ?? null,
      notes: data.notes ?? null,
      status: 'PENDING',
    },
    select: { id: true, status: true, job_type: true },
  })
}

export async function updateJobStatus(jobId: string, status: JobStatus) {
  return prisma.job.update({
    where: { id: jobId },
    data: { status },
    select: { id: true, status: true },
  })
}

export async function getCustomersForCompany(companyId: string) {
  try {
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

export async function getDriversForCompany(companyId: string) {
  try {
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
