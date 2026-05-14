'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

async function getCompanyId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function getCompanySettings() {
  const companyId = await getCompanyId()
  return prisma.company.findUnique({ where: { id: companyId } })
}

export async function updateCompanyProfile(data: {
  name?: string
  phone?: string
  email?: string
  address?: string
  postcode?: string
  company_number?: string | null
}) {
  const companyId = await getCompanyId()
  return prisma.company.update({ where: { id: companyId }, data })
}

export async function updateEARegistration(data: {
  ea_registration?: string | null
}) {
  const companyId = await getCompanyId()
  return prisma.company.update({ where: { id: companyId }, data })
}
