import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mockClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isLiveConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('YOUR_PROJECT_ID')

if (!isLiveConfigured) {
  console.info(
    'ℹ️ PUSLATKP Hub berjalan dalam Demo Mode (Local Storage). Untuk menghubungkan ke database live, isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di file .env'
  )
}

export const supabase = isLiveConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabase

export const isDemoMode = !isLiveConfigured
