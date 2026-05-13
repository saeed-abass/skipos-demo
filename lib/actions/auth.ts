'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function signUp(data: {
  email: string
  password: string
  companyName: string
  phone?: string
  address: string
  postcode: string
}): Promise<{ error?: string; success?: true }> {
  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error) return { error: error.message }
  if (!authData.user) return { error: 'Failed to create account' }

  const userId = authData.user.id

  try {
    await prisma.company.create({
      data: {
        id: userId,
        name: data.companyName,
        address: data.address,
        postcode: data.postcode.toUpperCase(),
        phone: data.phone?.trim() ?? '',
        email: data.email,
      },
    })

    await prisma.user.create({
      data: {
        id: userId,
        company_id: userId,
        email: data.email,
        full_name: data.companyName,
        role: 'ADMIN',
      },
    })
  } catch (err) {
    console.error('[signUp] DB error', err)
    // Best-effort cleanup of the auth user
    await supabase.auth.admin?.deleteUser?.(userId).catch(() => {})
    return { error: 'Failed to set up your account. Please try again.' }
  }

  return { success: true }
}

export async function signIn(data: {
  email: string
  password: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) return { error: 'Invalid email or password' }

  return {}
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(email: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  })

  // Always return success — don't reveal whether the email exists
  return {}
}

export async function updatePassword(password: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }

  return {}
}
