import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyJWT } from './lib/supabase/mockAuthHelper'

// Force Vercel build trigger to bake in environment variables

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /account routes are protected client-side by AuthGuard in app/account/layout.tsx.
  // Skip all Supabase auth checks here to avoid cookie modifications that could
  // clear the client-side session state during navigation.
  if (pathname.startsWith('/account')) {
    return NextResponse.next()
  }

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

  // Only check auth for routes that need server-side protection (/admin)
  if (pathname.startsWith('/admin')) {
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

