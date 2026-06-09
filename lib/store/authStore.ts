import { create } from 'zustand'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User | null) => void
  logoutStore: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  setAuth: user => set({ user, isAuthenticated: !!user }),
  logoutStore: () => set({ user: null, isAuthenticated: false }),
}))
