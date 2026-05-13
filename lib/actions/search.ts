'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export interface SearchResults {
  jobs: {
    id: string
    jobNumber: string
    type: string
    status: string
    customer: { name: string }
  }[]
  customers: {
    id: string
    name: string
    phone: string
    email: string | null
  }[]
}

async function getCompanyId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function globalSearch(query: string): Promise<SearchResults> {
  const q = query.trim()
  if (!q) return { jobs: [], customers: [] }

  const companyId = await getCompanyId()
  // Strip "JOB-" prefix so users can search by the short code
  const idSuffix = q.replace(/^job-?/i, '').toLowerCase()

  const [jobs, customers] = await Promise.all([
    prisma.job.findMany({
      where: {
        company_id: companyId,
        OR: [
          ...(idSuffix.length >= 3 ? [{ id: { endsWith: idSuffix } }] : []),
          { customer: { name: { contains: q, mode: 'insensitive' as const } } },
          { delivery_address: { contains: q, mode: 'insensitive' as const } },
          { delivery_postcode: { contains: q, mode: 'insensitive' as const } },
        ],
      },
      include: { customer: { select: { name: true } } },
      take: 3,
      orderBy: { created_at: 'desc' },
    }),
    prisma.customer.findMany({
      where: {
        company_id: companyId,
        OR: [
          { name:  { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
          { phone: { contains: q } },
        ],
      },
      take: 3,
      orderBy: { name: 'asc' },
    }),
  ])

  return {
    jobs: jobs.map(j => ({
      id: j.id,
      jobNumber: `JOB-${j.id.slice(-6).toUpperCase()}`,
      type: j.job_type,
      status: j.status,
      customer: { name: j.customer?.name ?? 'No customer' },
    })),
    customers: customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
    })),
  }
}
