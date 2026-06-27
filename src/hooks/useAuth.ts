import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isDemoModeEmail } from '@/lib/demoMode'

export type LocalUser = {
  id: string
  email: string
}

type AuthContextValue = {
  user: LocalUser | null
  isDemoMode: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const localUser: LocalUser = {
  email: 'local@flipsite.local',
  id: 'local',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(localUser)
  const loading = false

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isDemoMode: isDemoModeEmail(user?.email),
      loading,
      async signIn() {
        setUser(localUser)
      },
      async signUp() {
        setUser(localUser)
      },
      async signOut() {
        setUser(null)
      },
    }),
    [loading, user],
  )

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
