import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'pole-auth',
      partialize: (state) => ({ token: state.token }),
    },
  ),
)
