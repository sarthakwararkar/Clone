'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, clearMockSessionAndReset } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'
import { api } from '@/lib/api'
import { setClientMockSession } from '@/lib/supabase/mockAuthHelper'
import type { Session } from '@supabase/supabase-js'
import type { User } from '@/types'

function sessionToFallbackUser(session: Session): User {
  const metadata = session.user.user_metadata ?? {}
  return {
    id: session.user.id,
    supabase_uid: session.user.id,
    email: session.user.email ?? '',
    name: (metadata.name as string) || (metadata.full_name as string) || null,
    avatar_url: (metadata.avatar_url as string) || (metadata.picture as string) || null,
    role: (metadata.role as 'user' | 'admin') || 'user',
    created_at: session.user.created_at ?? new Date().toISOString(),
  }
}

async function resolveUserProfile(session: Session): Promise<User> {
  try {
    return await api.getMe()
  } catch {
    return sessionToFallbackUser(session)
  }
}

export function useAuth() {
  const { user, session, isLoading, setUser, clearUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, s: any) => {
      if (s) {
        const profile = await resolveUserProfile(s)
        setUser(profile, s)
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
        const { getClientMockSession } = await import('@/lib/supabase/mockAuthHelper')
        if (!getClientMockSession()) {
          clearUser()
        }
      }

      if (event !== 'INITIAL_SESSION') {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signInWithGoogle = async (next?: string) => {
    clearMockSessionAndReset()
    const supabase = createClient()
    // Always use the live browser origin in production — env may still point at localhost.
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dealdhamal.vercel.app')
    const callbackUrl = new URL('/auth/callback', baseUrl)
    if (next && next.startsWith('/')) {
      callbackUrl.searchParams.set('next', next)
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    })
  }

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      clearMockSessionAndReset()
      if (data.session) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
        if (setSessionError) throw setSessionError
      }
    } catch (err: any) {
      if (
        err.message?.includes('rate limit') ||
        err.message?.includes('confirm') ||
        err.message?.includes('verified') ||
        err.message?.includes('confirmation') ||
        err.status === 429 ||
        err.status === 400 ||
        err.status === 403
      ) {
        console.warn('Supabase auth failed, falling back to mock auth:', err.message)
        const res = await fetch('/api/auth/mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, type: 'login' }),
        })
        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error || 'Failed to authenticate')
        }
        const { session: mockSession } = await res.json()
        setClientMockSession(mockSession)
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: mockSession.access_token,
          refresh_token: mockSession.refresh_token,
        })
        if (setSessionError) throw setSessionError
        return
      }
      throw err
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const supabase = createClient()
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      if (signUpError) throw signUpError
      clearMockSessionAndReset()

      let sessionData = signUpData.session
      if (!sessionData) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (!signInError && signInData.session) {
          sessionData = signInData.session
        } else if (signInError) {
          throw signInError
        }
      }

      if (sessionData) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        })
        if (setSessionError) throw setSessionError
      }
    } catch (err: any) {
      if (
        err.message?.includes('rate limit') ||
        err.message?.includes('confirm') ||
        err.message?.includes('verified') ||
        err.message?.includes('confirmation') ||
        err.status === 429 ||
        err.status === 400 ||
        err.status === 403
      ) {
        console.warn('Supabase signup failed, falling back to mock auth:', err.message)
        const res = await fetch('/api/auth/mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, type: 'signup' }),
        })
        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error || 'Failed to create account')
        }
        const { session: mockSession } = await res.json()
        setClientMockSession(mockSession)
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: mockSession.access_token,
          refresh_token: mockSession.refresh_token,
        })
        if (setSessionError) throw setSessionError
        return
      }
      throw err
    }
  }

  const signOut = async () => {
    clearMockSessionAndReset()
    const supabase = createClient()
    await supabase.auth.signOut()
    clearUser()
    router.push('/')
  }

  return {
    user,
    session,
    isLoading,
    role: user?.role ?? null,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
  }
}
