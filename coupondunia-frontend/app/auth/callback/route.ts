import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const cookieStore = await cookies()
      cookieStore.set('sb-mock-session', '', { maxAge: 0, path: '/' })
      return NextResponse.redirect(new URL(next, request.url))
    } else {
      console.error('Supabase code exchange error:', error)
    }
  }

  // Redirect to homepage if OAuth exchange fails
  // We can also append the error parameter to the homepage if we want to show a toast, but redirecting is safer.
  return NextResponse.redirect(new URL('/', request.url))
}
