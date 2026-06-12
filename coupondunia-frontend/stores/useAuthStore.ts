import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  setUser: (user: User | null, session: Session | null) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user, session) => set({ user, session, isLoading: false }),
  clearUser: () => set({ user: null, session: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))
