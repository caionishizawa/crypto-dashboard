import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY

// Verificar se o Supabase está configurado
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key'

// Singleton para o cliente principal
let supabaseInstance: any = null

// Singleton para o cliente anônimo
let supabaseAnonInstance: any = null

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) return null
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return supabaseInstance
}

export const getSupabaseAnonClient = () => {
  if (!isSupabaseConfigured) return null
  
  if (!supabaseAnonInstance) {
    supabaseAnonInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storageKey: 'supabase-anon-singleton'
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-anon-singleton'
        }
      }
    })
  }
  
  return supabaseAnonInstance
}

export { isSupabaseConfigured }
