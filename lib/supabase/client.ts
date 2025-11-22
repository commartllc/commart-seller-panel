import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Cookie options for production domain
        get(name: string) {
          if (typeof document === 'undefined') return ''
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
          return match ? decodeURIComponent(match[2]) : ''
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return
          let cookieString = `${name}=${encodeURIComponent(value)}; path=${options.path || '/'}`

          if (options.maxAge) {
            cookieString += `; max-age=${options.maxAge}`
          }
          if (options.domain) {
            cookieString += `; domain=${options.domain}`
          }
          if (options.sameSite) {
            cookieString += `; samesite=${options.sameSite}`
          }
          if (options.secure) {
            cookieString += '; secure'
          }

          document.cookie = cookieString
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return
          document.cookie = `${name}=; path=${options.path || '/'}; max-age=0`
        },
      },
      cookieOptions: {
        name: 'sb-auth',
        domain: process.env.NODE_ENV === 'production' ? '.comm.art' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }
  )
}

// Export for backward compatibility
export const supabaseBrowser = createClient()
