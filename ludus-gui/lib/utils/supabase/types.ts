// Mock Supabase client for when credentials are not available
// Uses minimal interface to avoid complex type compatibility issues
export interface MockSupabaseClient {
  auth: {
    getUser: () => Promise<{ data: { user: null }, error: null }>
    signInWithPassword: () => Promise<{ data: null, error: Error }>
    signUp: () => Promise<{ data: null, error: Error }>
    signOut: () => Promise<{ error: null }>
    onAuthStateChange: () => { data: { subscription: { unsubscribe: () => void } } }
  }
}

// Factory function to create a mock Supabase client
export function createMockSupabaseClient(): MockSupabaseClient {
  return {
    auth: {
      getUser: () => 
        Promise.resolve({ data: { user: null }, error: null }),
      
      signInWithPassword: () => 
        Promise.resolve({ 
          data: null, 
          error: new Error('Supabase not configured')
        }),
      
      signUp: () => 
        Promise.resolve({ 
          data: null, 
          error: new Error('Supabase not configured')
        }),
      
      signOut: () => Promise.resolve({ error: null }),
      
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } } 
      })
    }
  }
}