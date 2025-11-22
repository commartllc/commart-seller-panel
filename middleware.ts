import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/', '/products', '/orders', '/finance', '/store', '/language']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  )

  if (isProtectedPath && !user) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (request.nextUrl.pathname === '/login' && user) {
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/products/:path*',
    '/orders/:path*',
    '/finance/:path*',
    '/store/:path*',
    '/language/:path*',
    '/login',
  ],
}
