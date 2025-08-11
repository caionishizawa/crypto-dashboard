import { supabase, supabaseAnon, isSupabaseConfigured } from './api'

export async function debugSupabaseConnection() {
  console.log('=== DEBUG SUPABASE CONNECTION ===')
  
  // 1. Verificar configuração
  console.log('isSupabaseConfigured:', isSupabaseConfigured)
  console.log('supabase exists:', !!supabase)
  console.log('supabaseAnon exists:', !!supabaseAnon)
  
  if (!isSupabaseConfigured || !supabaseAnon) {
    console.error('Supabase não está configurado corretamente')
    return
  }
  
  // 2. Testar inserção direta
  try {
    console.log('Tentando inserção anônima...')
    const { data, error } = await supabaseAnon
      .from('solicitacoes_usuarios')
      .insert([
        {
          nome: 'Debug Test',
          email: 'debug.test@email.com',
          senha_hash: '$2a$12$debug.hash',
          status: 'pendente',
          observacoes: 'Teste de debug'
        }
      ])
      .select('id, nome, email, status')
      .single()
    
    if (error) {
      console.error('Erro na inserção:', error)
    } else {
      console.log('Inserção bem-sucedida:', data)
    }
  } catch (err) {
    console.error('Exceção na inserção:', err)
  }
  
  // 3. Verificar se foi inserido
  try {
    const { data: checkData, error: checkError } = await supabaseAnon
      .from('solicitacoes_usuarios')
      .select('*')
      .eq('email', 'debug.test@email.com')
      .maybeSingle()
    
    if (checkError) {
      console.error('Erro ao verificar:', checkError)
    } else {
      console.log('Verificação:', checkData)
    }
  } catch (err) {
    console.error('Exceção na verificação:', err)
  }
  
  // 4. Limpar teste
  try {
    await supabaseAnon
      .from('solicitacoes_usuarios')
      .delete()
      .eq('email', 'debug.test@email.com')
    console.log('Teste limpo')
  } catch (err) {
    console.error('Erro ao limpar:', err)
  }
}
