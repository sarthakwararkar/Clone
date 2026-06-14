'use client'
import { createBrowserClient } from '@supabase/ssr'
import { getClientMockSession, clearClientMockSession } from './mockAuthHelper'

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function clearMockSessionAndReset() {
  clearClientMockSession()
  clientInstance = null
}

export function createClient(): ReturnType<typeof createBrowserClient> {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Check if we have a real Supabase session cookie (including chunked cookies)
  const hasRealCookie = typeof document !== 'undefined' && document.cookie.split(';').some(c => {
    const name = c.trim().split('=')[0]
    return name.startsWith('sb-') && name.includes('-auth-token')
  })

  if (hasRealCookie) {
    // Clear mock session and reset the cached instance
    clearClientMockSession()
    clientInstance = null
  }

  if (clientInstance) {
    return clientInstance
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const mockSession = getClientMockSession()
  if (!mockSession) {
    clientInstance = client
    return clientInstance
  }

  const originalAuth = client.auth

  const mockAuth = new Proxy(originalAuth, {
    get(target, prop, receiver) {
      if (prop === 'getSession') {
        return async () => {
          const mockSession = getClientMockSession()
          if (mockSession) {
            return { data: { session: mockSession as any }, error: null }
          }
          return target.getSession()
        }
      }
      if (prop === 'getUser') {
        return async (jwt?: string) => {
          const mockSession = getClientMockSession()
          if (mockSession) {
            return { data: { user: mockSession.user as any }, error: null }
          }
          return target.getUser(jwt)
        }
      }
      if (prop === 'setSession') {
        return async (currentSession: { access_token: string; refresh_token: string }) => {
          const mockSession = getClientMockSession()
          if (mockSession && mockSession.access_token === currentSession.access_token) {
            return { data: { session: mockSession as any, user: mockSession.user as any }, error: null }
          }
          try {
            const res = await target.setSession(currentSession)
            if (res.error && mockSession) {
              return { data: { session: mockSession as any, user: mockSession.user as any }, error: null }
            }
            return res
          } catch (err) {
            if (mockSession) {
              return { data: { session: mockSession as any, user: mockSession.user as any }, error: null }
            }
            throw err
          }
        }
      }
      if (prop === 'onAuthStateChange') {
        return (callback: any) => {
          const mockSession = getClientMockSession()
          if (mockSession) {
            setTimeout(() => {
              callback('INITIAL_SESSION', mockSession as any)
            }, 0)
          }
          return target.onAuthStateChange(callback)
        }
      }
      if (prop === 'signOut') {
        return async () => {
          clearClientMockSession()
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

  clientInstance = client
  return clientInstance
}

