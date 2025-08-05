import { createBrowserClient } from '@supabase/ssr'
import { createMockSupabaseClient } from './types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Return a minimal mock client if credentials are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    return createMockSupabaseClient() as ReturnType<typeof createBrowserClient>
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}