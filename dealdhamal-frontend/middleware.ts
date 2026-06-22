import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify, createRemoteJWKSet } from 'jose'

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
)

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('firebase-auth-token')?.value
  const pathname = request.nextUrl.pathname

  let user: any = null

  if (token) {
    try {
      let payload: any = null

      // In development, support verifying mock tokens with local secret
      const isDev = process.env.NODE_ENV === 'development'
      const mockSecret = process.env.FIREBASE_MOCK_JWT_SECRET
      if (isDev && mockSecret) {
        try {
          const secret = new TextEncoder().encode(mockSecret)
          const verified = await jwtVerify(token, secret)
          payload = verified.payload
        } catch {
          // ignore, fall back to live Google JWKS
        }
      }

      if (!payload) {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        const verified = await jwtVerify(token, JWKS, {
          issuer: `https://securetoken.google.com/${projectId}`,
          audience: projectId,
        })
        payload = verified.payload
      }

      if (payload) {
        user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role || 'user',
        }
      }
    } catch (err) {
      console.warn('Middleware: Token verification failed')
      // If verification fails, clear the invalid cookie
      const response = NextResponse.next()
      response.cookies.delete('firebase-auth-token')
      
      if (pathname.startsWith('/account') || pathname.startsWith('/admin')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
      }
      return response
    }
  }

  // Route protection
  if (pathname.startsWith('/account') || pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    // Since the Firebase JWT claim does not automatically sync database role promotions,
    // fetch the up-to-date role from the backend API for protected routes.
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dealdhamal-backend.sarthakwararkar2.workers.dev'
      const res = await fetch(`${apiUrl}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          user.role = body.data.role
        }
      }
    } catch (err) {
      console.warn('Middleware: Failed to fetch user role from API, falling back to JWT:', err)
    }

    if (pathname.startsWith('/admin')) {
      if (user.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt|html)$).*)',
  ],
}
