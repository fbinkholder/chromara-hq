/**
 * Server-side Supabase client for Route Handlers (API routes).
 * Use this in app/api/* routes so auth.getUser() can read the session from cookies.
 * For Client Components use createClient from @/lib/supabase instead.
 */
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createServerSupabase() {
  return createRouteHandlerClient({
    cookies: () => cookies(),
  })
}

/**
 * Admin Supabase client using service role key. Bypasses RLS.
 * Use only in API routes for authenticated operations where we pass user_id explicitly.
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 */
export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
  return createClient(url, key)
}
