'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/utils/supabase/client'
import { AUTH_CONFIG, logAuthBypass, logAuthOperation } from '@/lib/auth-config'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (AUTH_CONFIG.isDisabled) {
      logAuthBypass('AuthProvider', { mockUserId: AUTH_CONFIG.mockUser.id })
      setUser(AUTH_CONFIG.mockUser)
      setLoading(false)
      return
    }

    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    if (AUTH_CONFIG.isDisabled) {
      logAuthOperation('signIn', true, { email, bypassed: true })
      return { error: null }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    logAuthOperation('signIn', !error, { email, hasError: !!error })
    return { error }
  }

  const signOut = async () => {
    if (AUTH_CONFIG.isDisabled) {
      logAuthOperation('signOut', true, { bypassed: true })
      return
    }
    
    await supabase.auth.signOut()
    logAuthOperation('signOut', true)
  }

  const signUp = async (email: string, password: string) => {
    if (AUTH_CONFIG.isDisabled) {
      logAuthOperation('signUp', true, { email, bypassed: true })
      return { error: null }
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    logAuthOperation('signUp', !error, { email, hasError: !!error })
    return { error }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}