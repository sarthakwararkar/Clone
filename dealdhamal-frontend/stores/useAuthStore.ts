import { create } from 'zustand'
import type { User } from '@/types'

export interface FirebaseSession {
  access_token: string
}

interface AuthState {
  user: User | null
  session: FirebaseSession | null
  isLoading: boolean
  setUser: (user: User | null, session: FirebaseSession | null) => void
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
