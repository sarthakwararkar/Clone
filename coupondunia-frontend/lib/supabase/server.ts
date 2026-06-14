import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { MOCK_SESSION_KEY, verifyJWT } from './mockAuthHelper'

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies can't be set from here; middleware handles this
          }
        },
      },
    }
  )

  const originalAuth = client.auth
  const jwtSecret = process.env.SUPABASE_JWT_SECRET

  const { data: { session: realSession } } = await client.auth.getSession()
  if (realSession) {
    return client
  }

  // Get mock session from cookie and verify
  let verifiedSession: any = null
  const mockSessionCookie = cookieStore.get(MOCK_SESSION_KEY)?.value
  if (mockSessionCookie && jwtSecret) {
    try {
      const parsedSession = JSON.parse(decodeURIComponent(mockSessionCookie))
      if (parsedSession?.access_token) {
        const payload = await verifyJWT(parsedSession.access_token, jwtSecret)
        if (payload) {
          verifiedSession = parsedSession
        }
      }
    } catch {
      // ignore
    }
  }

  if (!verifiedSession) {
    return client
  }

  const mockAuth = new Proxy(originalAuth, {
    get(target, prop, receiver) {
      if (prop === 'getSession') {
        return async () => {
          if (verifiedSession) {
            return { data: { session: verifiedSession }, error: null }
          }
          return target.getSession()
        }
      }
      if (prop === 'getUser') {
        return async (jwt?: string) => {
          if (verifiedSession) {
            return { data: { user: verifiedSession.user }, error: null }
          }
          return target.getUser(jwt)
        }
      }
      if (prop === 'onAuthStateChange') {
        return (callback: any) => {
          if (verifiedSession) {
            setTimeout(() => {
              callback('INITIAL_SESSION', verifiedSession)
            }, 0)
          }
          return target.onAuthStateChange(callback)
        }
      }
      if (prop === 'signOut') {
        return async () => {
          try {
            cookieStore.set(MOCK_SESSION_KEY, '', { maxAge: 0, path: '/' })
          } catch {
            // ignore
          }
          return target.signOut()
        }
      }

      const value = Reflect.get(target, prop, receiver)
      if (typeof value === 'function') {
        return value.bind(target)
      }
      return value
    }
  })

  Object.defineProperty(client, 'auth', {
    get() {
      return mockAuth
    }
  })

  return client
}

