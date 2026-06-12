'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'
import { api } from '@/lib/api'

export function useAuth() {
  const { user, session, isLoading, setUser, clearUser, setLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (s) {
        try {
          const me = await api.getMe()
          setUser(me, s)
        } catch {
          setUser(null, null)
        }
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (s) {
        try {
          const me = await api.getMe()
          setUser(me, s)
        } catch {
          setUser(null, null)
        }
      } else {
        clearUser()
      }
      router.refresh()
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signInWithGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
  }

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string) => {
    const supabase = createClient()
    
    // 1. Sign up the user in Supabase
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password 
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
        // If sign-in fails due to unconfirmed email, let the user know they need to verify
        if (
          signInError.message.toLowerCase().includes('confirm') || 
          signInError.message.toLowerCase().includes('verified') ||
          signInError.message.toLowerCase().includes('confirmation')
        ) {
          throw new Error('Please check your email to verify and confirm your account.')
        }
        throw signInError
      }
    }

    // 3. Sync profile name to database if we have an active session
    if (sessionData) {
      try {
        // Wait briefly for the backend auto-creation route to run
        await new Promise((resolve) => setTimeout(resolve, 500))
        await api.updateMe({ name })
      } catch {
        // Non-critical profile name update failure
      }
    }
  }

  const signOut = async () => {
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
