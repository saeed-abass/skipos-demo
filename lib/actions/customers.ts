'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

async function getCompanyId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function getCustomers(search?: string) {
  try {
    const companyId = await getCompanyId()
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
    const companyId = await getCompanyId()
    return await prisma.customer.findUnique({
      where: { id, company_id: companyId },
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
  name: string
  email?: string | null
  phone?: string | null
  address: string
  postcode?: string | null
  notes?: string | null
}) {
  const companyId = await getCompanyId()
  return prisma.customer.create({
    data: {
      company_id: companyId,
      name: data.name,
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
    phone: string
    address: string
    postcode: string
    notes: string | null
  }
) {
  const companyId = await getCompanyId()
  return prisma.customer.update({
    where: { id, company_id: companyId },
    data,
  })
}

export async function deleteCustomer(id: string): Promise<void> {
  const companyId = await getCompanyId()
  const activeCount = await prisma.job.count({
    where: {
      customer_id: id,
      company_id: companyId,
      status: { in: ['PENDING', 'SCHEDULED', 'IN_PROGRESS'] },
    },
  })
  if (activeCount > 0) throw new Error('Customer has active jobs')
  await prisma.customer.delete({ where: { id, company_id: companyId } })
}

export type CustomerWithJobCount = Awaited<ReturnType<typeof getCustomers>>[number]
export type CustomerWithJobs = NonNullable<Awaited<ReturnType<typeof getCustomerById>>>
