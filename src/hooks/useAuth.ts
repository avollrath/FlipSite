import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { isDemoModeEmail } from '@/lib/demoMode'
import { supabase } from '@/lib/supabase'

type AuthContextValue = {
  user: User | null
  isDemoMode: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) {
        return
      }

      if (error) {
        setUser(null)
      } else {
        setUser(data.user)
      }

      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isDemoMode: isDemoModeEmail(user?.email),
      loading,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }
      },
      async signUp(email, password) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          throw error
        }
      },
      async signOut() {
        const { error } = await supabase.auth.signOut()

        if (error) {
          throw error
        }
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
