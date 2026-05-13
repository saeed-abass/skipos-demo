import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use in Client Components
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Typed DB helper (server-side usage — import createClient from ./supabase/server instead)
export type { SupabaseClient } from '@supabase/supabase-js'
