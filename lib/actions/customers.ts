'use server'

import { prisma } from '@/lib/prisma'

export async function getCustomers(companyId: string, search?: string) {
  try {
    return await prisma.customer.findMany({
      where: {
        company_id: companyId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
            { postcode: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      },
      include: {
        _count: { select: { jobs: true } },
      },
      orderBy: { created_at: 'desc' },
    })
  } catch (err) {
    console.error('[getCustomers]', err)
    return []
  }
}

export async function getCustomerById(id: string) {
  try {
    return await prisma.customer.findUnique({
      where: { id },
      include: {
        jobs: {
          select: {
            id: true,
            job_type: true,
            status: true,
            skip_size: true,
            scheduled_date: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          take: 5,
        },
      },
    })
  } catch (err) {
    console.error('[getCustomerById]', err)
    return null
  }
}

export async function createCustomer(data: {
  company_id: string
  name: string
  email?: string | null
  phone?: string | null
  address: string
  postcode?: string | null
  notes?: string | null
}) {
  return prisma.customer.create({
    data: {
      company_id: data.company_id,
      name: data.name,
      // phone and postcode are non-nullable in the schema; use '' when not provided
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || null,
      address: data.address,
      postcode: data.postcode?.trim() || '',
      notes: data.notes?.trim() || null,
    },
  })
}

export async function updateCustomer(
  id: string,
  data: {
    name: string
    email: string | null
    phone: string        // non-nullable in schema
    address: string
    postcode: string     // non-nullable in schema
    notes: string | null
  }
) {
  return prisma.customer.update({
    where: { id },
    data,
  })
}

export async function deleteCustomer(id: string): Promise<void> {
  const activeCount = await prisma.job.count({
    where: {
      customer_id: id,
      status: { in: ['PENDING', 'SCHEDULED', 'IN_PROGRESS'] },
    },
  })
  if (activeCount > 0) throw new Error('Customer has active jobs')
  await prisma.customer.delete({ where: { id } })
}

export type CustomerWithJobCount = Awaited<ReturnType<typeof getCustomers>>[number]
export type CustomerWithJobs = NonNullable<Awaited<ReturnType<typeof getCustomerById>>>
