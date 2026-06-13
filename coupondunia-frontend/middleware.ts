import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyJWT } from './lib/supabase/mockAuthHelper'


export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const jwtSecret = process.env.SUPABASE_JWT_SECRET
  let user: any = null

  // Check if mock session exists and is valid
  const mockSessionCookie = request.cookies.get('sb-mock-session')?.value
  if (mockSessionCookie && jwtSecret) {
    try {
      const parsedSession = JSON.parse(decodeURIComponent(mockSessionCookie))
      if (parsedSession?.access_token) {
        const payload = await verifyJWT(parsedSession.access_token, jwtSecret)
        if (payload) {
          user = parsedSession.user
        }
      }
    } catch {
      // ignore
    }
  }

  // If not mock authenticated, use Supabase getUser
  if (!user) {
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch (err) {
      console.error('Supabase getUser error in middleware:', err)
    }
  }


  const { pathname } = request.nextUrl

  // Protect /account routes
  if (pathname.startsWith('/account')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check admin role from user metadata
    const role = (user.app_metadata as { role?: string })?.role
    if (role !== 'admin') {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
