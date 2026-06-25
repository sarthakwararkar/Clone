'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { useAuthStore } from '@/stores/useAuthStore'
import { api } from '@/lib/api'
import type { User } from '@/types'

function firebaseUserToFallbackUser(firebaseUser: any, provider: string): User {
  return {
    id: firebaseUser.uid,
    supabase_uid: firebaseUser.uid, // compatibility field
    email: firebaseUser.email ?? '',
    name: firebaseUser.displayName || null,
    avatar_url: firebaseUser.photoURL || null,
    role: 'user',
    created_at: new Date().toISOString(),
  }
}

export function useAuth() {
  const { user, session, isLoading, setUser, clearUser, setLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' || 
       window.location.hostname.startsWith('192.168.') || 
       window.location.hostname.endsWith('.local'));

    // 1. Check for mock session first (only on local)
    const mockSessionStr = typeof window !== 'undefined' ? localStorage.getItem('mock_firebase_session') : null
    if (mockSessionStr) {
      if (isLocal) {
        try {
          const mockData = JSON.parse(mockSessionStr)
          setUser(mockData.user, { access_token: mockData.access_token })
          setLoading(false)
          return
        } catch {
          localStorage.removeItem('mock_firebase_session')
        }
      } else {
        localStorage.removeItem('mock_firebase_session')
      }
    }

    // 2. Otherwise use real Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken()
          
          // Write token to secure cookie for Next.js SSR / middleware
          await fetch('/api/auth/cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          })

          // Retrieve or auto-create backend profile
          let profile: User
          try {
            profile = await api.getMe()
          } catch {
            const provider = firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
            profile = firebaseUserToFallbackUser(firebaseUser, provider)
          }

          setUser(profile, { access_token: token })
        } catch (err) {
          console.error('Error handling Firebase auth state change:', err)
          clearUser()
        }
      } else {
        // No user logged in via Firebase
        clearUser()
      }
    })

    return () => unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signInWithGoogle = async (next?: string) => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const token = await result.user.getIdToken()
      
      // Update cookie
      await fetch('/api/auth/cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      // Redirect if needed
      if (next && next.startsWith('/')) {
        router.push(next as any)
      } else {
        router.push('/')
      }
    } catch (error: any) {
      console.warn('Firebase Google signin failed:', error.message)
      
      const isLocal = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.hostname.startsWith('192.168.') || 
         window.location.hostname.endsWith('.local'));
      
      if (!isLocal) {
        console.error('Google Sign In failed in production:', error)
        throw new Error(
          `Google Sign In failed: ${error.message || 'Pop-up blocked or closed'}. ` +
          `If this is a production URL, make sure it is added to the Authorized Domains list in Firebase Console, ` +
          `or sign in using your Admin Email and Password instead.`
        );
      }
      
      console.log('Falling back to mock OAuth in development...');
      try {
        const res = await fetch('/api/auth/mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'google-user@example.com',
            password: 'google-mock-password-123',
            name: 'Google Mock User',
            type: 'login',
            provider: 'google.com',
          }),
        })
        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error || 'Failed to authenticate with mock OAuth')
        }
        const { session: mockSession } = await res.json()
        
        // Save mock session locally
        localStorage.setItem('mock_firebase_session', JSON.stringify(mockSession))
        
        // Update cookie
        await fetch('/api/auth/cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: mockSession.access_token }),
        })

        setUser(mockSession.user, { access_token: mockSession.access_token })
        
        if (next && next.startsWith('/')) {
          router.push(next as any)
        } else {
          router.push('/')
        }
        router.refresh()
      } catch (mockErr: any) {
        console.error('Google Sign In and fallback failed:', mockErr)
        throw mockErr
      }
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const token = await result.user.getIdToken()

      await fetch('/api/auth/cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
    } catch (err: any) {
      console.warn('Firebase login failed:', err.message)
      
      const isLocal = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.hostname.startsWith('192.168.') || 
         window.location.hostname.endsWith('.local'));
      
      if (!isLocal) {
        console.error('Firebase login failed in production:', err)
        throw err;
      }
      
      console.log('Falling back to mock auth in development...');
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
      
      // Save mock session locally
      localStorage.setItem('mock_firebase_session', JSON.stringify(mockSession))
      
      // Update cookie
      await fetch('/api/auth/cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mockSession.access_token }),
      })

      setUser(mockSession.user, { access_token: mockSession.access_token })
      router.refresh()
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await firebaseUpdateProfile(result.user, { displayName: name })
      const token = await result.user.getIdToken()

      await fetch('/api/auth/cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
    } catch (err: any) {
      console.warn('Firebase signup failed:', err.message)
      
      const isLocal = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.hostname.startsWith('192.168.') || 
         window.location.hostname.endsWith('.local'));
      
      if (!isLocal) {
        console.error('Firebase signup failed in production:', err)
        throw err;
      }
      
      console.log('Falling back to mock auth in development...');
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
      
      // Save mock session locally
      localStorage.setItem('mock_firebase_session', JSON.stringify(mockSession))
      
      // Update cookie
      await fetch('/api/auth/cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mockSession.access_token }),
      })

      setUser(mockSession.user, { access_token: mockSession.access_token })
      router.refresh()
    }
  }

  const signOut = async () => {
    localStorage.removeItem('mock_firebase_session')
    try {
      await firebaseSignOut(auth)
    } catch (e) {
      // ignore
    }
    
    // Clear cookie
    await fetch('/api/auth/cookie', { method: 'DELETE' })
    clearUser()
    router.push('/')
    router.refresh()
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
