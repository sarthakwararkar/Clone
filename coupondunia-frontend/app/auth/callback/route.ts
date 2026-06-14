import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const oauthError = requestUrl.searchParams.get('error')
  const oauthErrorDescription = requestUrl.searchParams.get('error_description')
  let next = requestUrl.searchParams.get('next') ?? '/'

  if (!next.startsWith('/')) {
    next = '/'
  }

  const origin = requestUrl.origin

  if (oauthError) {
    console.error('OAuth provider error:', oauthError, oauthErrorDescription)
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set(
      'error',
      oauthErrorDescription || oauthError || 'oauth_failed'
    )
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const cookieStore = await cookies()
    let response = NextResponse.redirect(new URL(next, origin))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      response.cookies.set('sb-mock-session', '', { maxAge: 0, path: '/' })
      return response
    }

    console.error('Supabase code exchange error:', error)
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', error.message)
    return NextResponse.redirect(loginUrl)
  }

  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('error', 'missing_code')
  return NextResponse.redirect(loginUrl)
}
