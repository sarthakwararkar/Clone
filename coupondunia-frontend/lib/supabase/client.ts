'use client'
import { createBrowserClient } from '@supabase/ssr'
import { getClientMockSession, clearClientMockSession } from './mockAuthHelper'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

  return client
}

