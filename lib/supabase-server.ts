/**
 * Server-side Supabase client for Route Handlers (API routes).
 * Use this in app/api/* routes so auth.getUser() can read the session from cookies.
 * For Client Components use createClient from @/lib/supabase instead.
 */
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createServerSupabase() {
  return createRouteHandlerClient({
    cookies: () => cookies(),
  })
}
