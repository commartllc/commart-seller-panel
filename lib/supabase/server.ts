import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              domain: process.env.NODE_ENV === 'production' ? '.comm.art' : undefined,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            })
          } catch (error) {
            // Handle cookies in read-only contexts (Server Components)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              domain: process.env.NODE_ENV === 'production' ? '.comm.art' : undefined,
            })
          } catch (error) {
            // Handle cookies in read-only contexts
          }
        },
      },
    }
  )
}

// Admin client - NEVER expose to browser
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return '' },
        set() {},
        remove() {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Legacy export for backward compatibility
export function supabaseServer() {
  return createClient()
}
