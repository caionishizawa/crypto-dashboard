import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY

// Verificar se o Supabase está configurado
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key'

// Singleton para o cliente principal (única instância)
let supabaseInstance: any = null

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) return null
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storageKey: 'supabase-singleton'
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-singleton'
        }
      }
    })
  }
  
  return supabaseInstance
}

// Usar a mesma instância para o cliente anônimo
export const getSupabaseAnonClient = () => {
  return getSupabaseClient()
}

export { isSupabaseConfigured }
