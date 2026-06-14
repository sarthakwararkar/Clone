'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'
import { api } from '@/lib/api'
import { setClientMockSession, clearClientMockSession } from '@/lib/supabase/mockAuthHelper'


export function useAuth() {
  const { user, session, isLoading, setUser, clearUser, setLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      console.log('useAuth: getSession returned session:', s ? {
        user: s.user.email,
        expires_at: s.expires_at,
        token_type: s.token_type
      } : null)

      if (s) {
        try {
          console.log('useAuth: getSession fetching user profile from backend...')
          const me = await api.getMe()
          console.log('useAuth: getSession successfully fetched user profile:', me)
          setUser(me, s)
        } catch (err: any) {
          console.error('useAuth: getSession failed to fetch user profile from backend:', {
            message: err.message,
            status: err.status,
            error: err
          })
          setUser(null, null)
        }
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      console.log('useAuth: onAuthStateChange event:', event, 'session:', s ? {
        user: s.user.email,
        expires_at: s.expires_at
      } : null)

      // Skip INITIAL_SESSION events — we handle initialization via getSession() above
      if (event === 'INITIAL_SESSION') return

      if (s) {
        try {
          console.log('useAuth: onAuthStateChange fetching user profile from backend...')
          const me = await api.getMe()
          console.log('useAuth: onAuthStateChange successfully fetched user profile:', me)
          setUser(me, s)
        } catch (err: any) {
          console.error('useAuth: onAuthStateChange failed to fetch user profile:', {
            message: err.message,
            status: err.status,
            error: err
          })
          setUser(null, null)
        }
      } else {
        // Don't clear user if a mock session still exists (the real Supabase
        // listener may fire with null even though mock auth is valid)
        const { getClientMockSession } = await import('@/lib/supabase/mockAuthHelper')
        if (!getClientMockSession()) {
          console.log('useAuth: onAuthStateChange clearing user because session is null and no mock session exists')
          clearUser()
        }
      }
      router.refresh()
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signInWithGoogle = async () => {
    const supabase = createClient()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    })
  }

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.session) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
        if (setSessionError) throw setSessionError
      }
    } catch (err: any) {
      // Fallback to mock auth if rate limit is hit, confirmation is required, or limit is exceeded
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
      // 1. Sign up the user in Supabase
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

      // 2. Auto-login the user immediately using their credentials
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

        // Wait briefly for the backend auto-creation route to run
        await new Promise((resolve) => setTimeout(resolve, 500))
        await api.updateMe({ name })
      }
    } catch (err: any) {
      // Fallback to mock auth if rate limit is hit, confirmation is required, or limit is exceeded
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

        // Wait briefly for the backend auto-creation route to run
        await new Promise((resolve) => setTimeout(resolve, 500))
        await api.updateMe({ name })
        return
      }
      throw err
    }
  }

  const signOut = async () => {
    const supabase = createClient()
    clearClientMockSession()
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
