import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Configuração do Supabase
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY

// Verificar se o Supabase está configurado
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key'

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
export { isSupabaseConfigured }

// Função helper para queries seguras
const safeQuery = async (queryFn: () => Promise<any>) => {
  try {
    if (!supabase) {
      throw new Error('Supabase não configurado - Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY')
    }
    return await queryFn()
  } catch (error: any) {
    console.error('Erro na query:', error)
    throw error
  }
}

// Função para criptografar senha
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Função para verificar senha
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

// Função para gerar token JWT simples (em produção, use uma biblioteca JWT)
const generateToken = (userId: string): string => {
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 horas
    iat: Math.floor(Date.now() / 1000)
  }
  return btoa(JSON.stringify(payload)) // Base64 encoding (simplificado)
}

// Função para verificar token
const verifyToken = (token: string): { userId: string; valid: boolean } => {
  try {
    const payload = JSON.parse(atob(token))
    const now = Math.floor(Date.now() / 1000)
    
    if (payload.exp < now) {
      return { userId: '', valid: false }
    }
    
    return { userId: payload.userId, valid: true }
  } catch {
    return { userId: '', valid: false }
  }
}

// Tipos para as respostas da API
interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  requiresEmailConfirmation?: boolean;
  [key: string]: any;
}

class SupabaseApiClient {
  
  // === MÉTODOS DE AUTENTICAÇÃO ===
  
  async login(email: string, senha: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      // Fazer login usando Supabase Auth
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password: senha
      })

      if (error) {
        console.error('Erro ao fazer login:', error)
        return { success: false, error: 'Email ou senha incorretos' }
      }

      if (!data.user) {
        return { success: false, error: 'Usuário não encontrado' }
      }

      // Buscar dados adicionais do usuário na tabela usuarios
      const { data: userData, error: userError } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .select('id, nome, email, tipo, dataRegistro')
          .eq('id', data.user.id)
          .single()
      })

      if (userError || !userData) {
        console.error('Erro ao buscar dados do usuário:', userError)
        return { success: false, error: 'Erro ao carregar dados do usuário' }
      }

      return { 
        success: true, 
        user: {
          id: userData.id,
          nome: userData.nome,
          email: userData.email,
          tipo: userData.tipo,
          dataRegistro: userData.dataRegistro
        }
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      return { success: false, error: error.message }
    }
  }

  async register(nome: string, email: string, senha: string, confirmarSenha: string): Promise<ApiResponse> {
    try {
      if (senha !== confirmarSenha) {
        return { success: false, error: 'Senhas não coincidem' }
      }

      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      // Verificar se o email já existe
      const { data: existingUser, error: checkError } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .select('id, email')
          .eq('email', email)
          .maybeSingle()
      })

      if (existingUser) {
        return { success: false, error: 'Email já cadastrado' }
      }

      // Criar usuário usando Supabase Auth
      const { data: authData, error: authError } = await supabase!.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            tipo: 'admin'
          }
          // Sem emailRedirectTo - apenas confirma o email sem redirecionar
        }
      })

      if (authError) {
        console.error('Erro ao criar usuário no Auth:', authError)
        return { success: false, error: 'Erro ao criar usuário' }
      }

      if (!authData.user) {
        return { success: false, error: 'Erro ao criar usuário' }
      }

      // Criar registro na tabela usuarios
      const { data: userData, error: insertError } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .insert([
            {
              id: authData.user.id,
              nome,
              email,
              tipo: 'admin',
              dataRegistro: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ])
          .select('id, nome, email, tipo, dataRegistro')
          .single()
      })

      if (insertError) {
        console.error('Erro ao criar usuário na tabela:', insertError)
        return { success: false, error: 'Erro ao criar usuário' }
      }

      // SEMPRE requer confirmação de email para todos os provedores
      // Isso garante que Hotmail, Gmail, Yahoo, etc. funcionem igual
      return { 
        success: true, 
        message: 'Conta criada! Verifique seu email e clique no link de confirmação para ativar sua conta.',
        requiresEmailConfirmation: true
      }
    } catch (error: any) {
      console.error('Erro no registro:', error)
      return { success: false, error: error.message }
    }
  }

  async getCurrentUser(token: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      // Usar a sessão atual do Supabase
      const { data: { session }, error: sessionError } = await supabase!.auth.getSession()
      
      if (sessionError || !session) {
        return { success: false, error: 'Sessão não encontrada' }
      }

      // Buscar dados do usuário na tabela usuarios
      const { data: userData, error: userError } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .select('id, nome, email, tipo, dataRegistro')
          .eq('email', session.user.email)
          .single()
      })

      if (userError || !userData) {
        console.error('Erro ao buscar usuário:', userError)
        return { success: false, error: 'Usuário não encontrado' }
      }

      return { success: true, user: userData }
    } catch (error: any) {
      console.error('Erro ao obter usuário:', error)
      return { success: false, error: error.message }
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: true }
      }

      // Fazer logout usando Supabase Auth
      const { error } = await supabase!.auth.signOut()
      
      if (error) {
        console.error('Erro no logout:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Erro no logout:', error)
      return { success: false, error: error.message }
    }
  }

  // === MÉTODOS DE CLIENTES ===
  
  async getClientes(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('clientes')
          .select('*')
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error)
      return { success: false, error: error.message }
    }
  }

  async createCliente(clienteData: any): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase!.auth.getUser()
      
      if (authError || !user) {
        return { 
          success: false, 
          error: 'Usuário não autenticado. Faça login para criar clientes.' 
        }
      }

      // Adicionar campos obrigatórios que podem estar faltando
      const clienteCompleto = {
        ...clienteData,
        // Campos obrigatórios que precisam ser fornecidos
        dataInicio: clienteData.dataInicio || new Date().toISOString(),
        investimentoInicial: clienteData.investimentoInicial || 0,
        updatedAt: new Date().toISOString(),
        // Campos opcionais
        usuarioId: undefined,
        // Campos com valores padrão (não precisam ser enviados)
        // id: undefined, // Gerado automaticamente
        // apyMedio: undefined, // Padrão: 0
        // tempoMercado: undefined, // Padrão: ''
        // scoreRisco: undefined, // Padrão: ''
        // createdAt: undefined // Padrão: CURRENT_TIMESTAMP
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('clientes')
          .insert([clienteCompleto])
          .select()
          .single()
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error)
      return { success: false, error: error.message }
    }
  }

  async getCliente(id: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('clientes')
          .select('*')
          .eq('id', id)
          .single()
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao buscar cliente:', error)
      return { success: false, error: error.message }
    }
  }

  async updateCliente(id: string, clienteData: any): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('clientes')
          .update(clienteData)
          .eq('id', id)
          .select()
          .single()
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteCliente(id: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { error } = await safeQuery(async () => {
        return await supabase!
          .from('clientes')
          .delete()
          .eq('id', id)
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Erro ao deletar cliente:', error)
      return { success: false, error: error.message }
    }
  }

  async addTransacao(clienteId: string, transacaoData: any): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('transaco')
          .insert([{ ...transacaoData, cliente_id: clienteId }])
          .select()
          .single()
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao adicionar transação:', error)
      return { success: false, error: error.message }
    }
  }

  async getCarteirasCliente(clienteId: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('carteiras')
          .select('*')
          .eq('cliente_id', clienteId)
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao buscar carteiras:', error)
      return { success: false, error: error.message }
    }
  }

  async getCarteira(id: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('carteiras')
          .select('*')
          .eq('id', id)
          .single()
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao buscar carteira:', error)
      return { success: false, error: error.message }
    }
  }

  async createCarteira(carteiraData: any): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('carteiras')
          .insert([carteiraData])
          .select()
          .single()
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao criar carteira:', error)
      return { success: false, error: error.message }
    }
  }

  async updateCarteira(id: string, carteiraData: any): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('carteiras')
          .update(carteiraData)
          .eq('id', id)
          .select()
          .single()
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao atualizar carteira:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteCarteira(id: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { error } = await safeQuery(async () => {
        return await supabase!
          .from('carteiras')
          .delete()
          .eq('id', id)
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Erro ao deletar carteira:', error)
      return { success: false, error: error.message }
    }
  }

  async refreshCarteira(id: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('carteiras')
          .update({ ultima_atualizacao: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao atualizar carteira:', error)
      return { success: false, error: error.message }
    }
  }

  async getDashboardStats(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('clientes')
          .select('*')
      })

      if (error) {
        return { success: false, error: error.message }
      }

      const totalClientes = data?.length || 0
      const valorTotal = data?.reduce((sum, cliente) => sum + (cliente.valor_atual_usd || 0), 0) || 0
      const rendimentoMedio = data?.reduce((sum, cliente) => sum + (cliente.apy_medio || 0), 0) / totalClientes || 0

      return { 
        success: true, 
        data: { 
          totalClientes, 
          valorTotal, 
          rendimentoMedio 
        } 
      }
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error)
      return { success: false, error: error.message }
    }
  }

  async getPerformanceData(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('desempenho_data')
          .select('*')
          .order('mes', { ascending: true })
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao buscar dados de performance:', error)
      return { success: false, error: error.message }
    }
  }

  async getDistributionData(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('clientes')
          .select('tipo, valor_atual_usd')
      })

      if (error) {
        return { success: false, error: error.message }
      }

      const distribution = data?.reduce((acc, cliente) => {
        const tipo = cliente.tipo || 'outro'
        acc[tipo] = (acc[tipo] || 0) + (cliente.valor_atual_usd || 0)
        return acc
      }, {} as Record<string, number>) || {}

      return { success: true, data: distribution }
    } catch (error: any) {
      console.error('Erro ao buscar dados de distribuição:', error)
      return { success: false, error: error.message }
    }
  }

  async getRecentActivity(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { 
          success: false, 
          error: 'Supabase não configurado. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify Dashboard.' 
        }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('transaco')
          .select('*')
          .order('data', { ascending: false })
          .limit(10)
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao buscar atividades recentes:', error)
      return { success: false, error: error.message }
    }
  }
}

// Exportar instância única
export const apiClient = new SupabaseApiClient()
export const supabaseClient = supabase 