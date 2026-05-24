import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  profile: any | null // Type properly if possible
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: any | null) => void
  initialize: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// Helper with retry logic to fix race condition when trigger is still creating profile
async function fetchProfileWithRetry(supabase: any, userId: string, maxRetries = 5, delayMs = 500) {
  for (let i = 0; i < maxRetries; i++) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, offices(nama, radius, latitude, longitude)')
      .eq('id', userId)
      .single()
      
    if (profile) return profile;
    
    // If not found, wait and retry
    if (i < maxRetries - 1) {
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  return null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  refreshProfile: async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchProfileWithRetry(supabase, session.user.id);
      if (profile) set({ profile })
    }
  },
  initialize: async () => {
    try {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error

      if (session) {
        set({ session, user: session.user })
        
        // Fetch profile with retry
        const profile = await fetchProfileWithRetry(supabase, session.user.id);
          
        if (profile) {
          set({ profile })
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth', error)
    } finally {
      set({ isLoading: false })
    }

    // Set up subscription
    const supabase = createClient()
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user || null })
      if (session?.user) {
        // Trigger fetch with retry for new signups
        const profile = await fetchProfileWithRetry(supabase, session.user.id);
        set({ profile })
      } else {
        set({ profile: null })
      }
    })
  },
}))
