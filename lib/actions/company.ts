'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import type { SkipSize, Condition } from '@/types'

async function getCompanyId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function getCompanyData() {
  const companyId = await getCompanyId()
  return prisma.company.findUnique({ where: { id: companyId } })
}

export async function checkNeedsOnboarding(): Promise<boolean> {
  const companyId = await getCompanyId()
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { ea_registration: true },
  })
  return company?.ea_registration === null
}

export async function updateCompany(data: {
  name?: string
  phone?: string
  address?: string
  postcode?: string
  ea_registration?: string | null
}) {
  const companyId = await getCompanyId()
  return prisma.company.update({ where: { id: companyId }, data })
}

export async function createSkip(data: {
  skip_number: string
  size: SkipSize
  condition?: Condition
}) {
  const companyId = await getCompanyId()
  return prisma.skip.create({
    data: {
      company_id: companyId,
      skip_number: data.skip_number.trim().toUpperCase(),
      size: data.size,
      condition: data.condition ?? 'GOOD',
    },
  })
}
