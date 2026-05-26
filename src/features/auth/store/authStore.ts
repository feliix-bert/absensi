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

async function fetchProfile(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, offices(nama, radius, latitude, longitude)')
    .eq('id', userId)
    .single()
    
  return profile || null;
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
      const profile = await fetchProfile(supabase, session.user.id);
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
        const profile = await fetchProfile(supabase, session.user.id);
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
      
      // Only fetch profile on explicit sign in or sign up events to prevent duplicate fetches on initial load
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        const profile = await fetchProfile(supabase, session.user.id);
        set({ profile })
      } else if (!session?.user) {
        set({ profile: null })
      }
    })
  },
}))

