import bcrypt from 'bcryptjs'
import { getSupabaseClient, getSupabaseAnonClient, isSupabaseConfigured } from './supabaseClient'

// Usar os singletons
export const supabase = getSupabaseClient()
export const supabaseAnon = getSupabaseAnonClient()

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

      // Primeiro, verificar se o usuário já existe na tabela usuarios (usuários antigos)
      const { data: existingUser, error: existingUserError } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .select('id, nome, email, tipo, dataRegistro')
          .eq('email', email)
          .single()
      })

      if (existingUser && !existingUserError) {
        // Usuário já existe na tabela usuarios, tentar login normal no Supabase Auth
        const { data, error } = await supabase!.auth.signInWithPassword({
          email,
          password: senha
        })

        if (!error && data.user) {
          return { 
            success: true, 
            user: {
              id: existingUser.id,
              nome: existingUser.nome,
              email: existingUser.email,
              tipo: existingUser.tipo,
              dataRegistro: existingUser.dataRegistro
            },
            message: 'Login realizado com sucesso (usuário existente)'
          }
        }
      }

      // Se não encontrou usuário existente, verificar se existe uma solicitação aprovada
      const { data: solicitacao, error: solicitacaoError } = await safeQuery(async () => {
        return await supabase!
          .from('solicitacoes_usuarios')
          .select('*')
          .eq('email', email)
          .eq('status', 'aprovado')
          .single()
      })

      if (solicitacao && !solicitacaoError) {
        // Existe solicitação aprovada, verificar senha original
        const senhaValida = await verifyPassword(senha, solicitacao.senha_hash)
        
        if (senhaValida) {
          // Senha válida, buscar dados do usuário na tabela usuarios
          const { data: userData, error: userError } = await safeQuery(async () => {
            return await supabase!
              .from('usuarios')
              .select('id, nome, email, tipo, dataRegistro')
              .eq('email', email)
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
            },
            message: 'Login realizado com sucesso usando senha original da solicitação'
          }
        }
      }

      // Se não encontrou solicitação aprovada ou senha inválida, tentar login normal no Supabase Auth
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password: senha
      })

      if (error) {
        return { success: false, error: 'Email ou senha incorretos' }
      }

      if (!data.user) {
        return { success: false, error: 'Usuário não encontrado' }
      }

      // Login normal funcionou, buscar dados do usuário
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

      // Criar usuário usando Supabase Auth (FORÇAR sem confirmação por email)
      const { data: authData, error: authError } = await supabase!.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            tipo: 'user',
            email_confirmed_at: new Date().toISOString() // Forçar como já confirmado
          },
          // Desabilitar completamente o envio de email de confirmação
          emailRedirectTo: null,
          captchaToken: null
        }
      })
      


      if (authError) {
        console.error('🔧 API - Erro ao criar usuário no Auth:', authError)
        return { success: false, error: `Erro ao criar usuário: ${authError.message}` }
      }

      if (!authData.user) {

        return { success: false, error: 'Erro ao criar usuário - nenhum dado retornado' }
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
              tipo: 'user',
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

      // SEMPRE fazer logout após criar conta (sem confirmação por email)
      await supabase!.auth.signOut();
      
      return { 
        success: true, 
        message: 'Conta criada com sucesso! Faça login para acessar sua conta.',
        requiresEmailConfirmation: false
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

      // Usar a sessão atual do Supabase com tratamento de erro melhorado
      let session;
      try {
        const { data, error: sessionError } = await supabase!.auth.getSession()
        
        if (sessionError) {
          console.log('Erro ao obter sessão:', sessionError)
          return { success: false, error: 'Sessão não encontrada' }
        }
        
        session = data.session
      } catch (sessionError: any) {
        console.log('Erro ao verificar sessão (refresh token inválido):', sessionError.message)
        return { success: false, error: 'Sessão expirada' }
      }
      
      if (!session) {
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
      
      // Se for erro de refresh token, retornar erro específico
      if (error.message?.includes('Refresh Token') || error.message?.includes('refresh')) {
        return { success: false, error: 'Sessão expirada' }
      }
      
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
      console.log('🚀 Criando cliente com dados:', clienteData);
      
      if (!isSupabaseConfigured) {
        console.log('❌ Supabase não configurado');
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
        // Campo obrigatório - usar o ID do usuário logado
        usuarioId: user.id,
        // Campos com valores padrão (não precisam ser enviados)
        // id: undefined, // Gerado automaticamente
        // apyMedio: undefined, // Padrão: 0
        // tempoMercado: undefined, // Padrão: ''
        // scoreRisco: undefined, // Padrão: ''
        // createdAt: undefined // Padrão: CURRENT_TIMESTAMP
      }

      console.log('📋 Dados completos para inserção:', clienteCompleto);

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
          .select('id, endereco, tipo, nome, valorAtual, ultimaAtualizacao, clienteId, createdAt, updatedAt')
          .eq('clienteId', clienteId)
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
          .select('id, endereco, tipo, nome, valorAtual, ultimaAtualizacao, clienteId, createdAt, updatedAt')
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
          .select('id, endereco, tipo, nome, valorAtual, ultimaAtualizacao, clienteId, createdAt, updatedAt')
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
          .select('id, endereco, tipo, nome, valorAtual, ultimaAtualizacao, clienteId, createdAt, updatedAt')
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
          .update({ ultimaAtualizacao: new Date().toISOString() })
          .eq('id', id)
          .select('id, endereco, tipo, nome, valorAtual, ultimaAtualizacao, clienteId, createdAt, updatedAt')
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

  // === MÉTODOS PARA SOLICITAÇÕES DE USUÁRIOS ===

  async getSolicitacoes(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase não configurado' }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('solicitacoes_usuarios')
          .select('*')
          .order('data_solicitacao', { ascending: false })
      })

      if (error) {
        console.error('Erro ao buscar solicitações:', error)
        return { success: false, error: 'Erro ao buscar solicitações' }
      }

      return { success: true, data: data || [] }
    } catch (error: any) {
      console.error('Erro ao buscar solicitações:', error)
      return { success: false, error: error.message }
    }
  }

  async aprovarSolicitacao(solicitacaoId: string, aprovado: boolean, motivo_rejeicao?: string, observacoes?: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase não configurado' }
      }

      // Buscar a solicitação
      const { data: solicitacao, error: fetchError } = await safeQuery(async () => {
        return await supabase!
          .from('solicitacoes_usuarios')
          .select('*')
          .eq('id', solicitacaoId)
          .single()
      })

      if (fetchError || !solicitacao) {
        return { success: false, error: 'Solicitação não encontrada' }
      }

      if (aprovado) {
        // Aprovar a solicitação
        const { error: updateError } = await safeQuery(async () => {
          return await supabase!
            .from('solicitacoes_usuarios')
            .update({
              status: 'aprovado',
              data_aprovacao: new Date().toISOString(),
              aprovado_por: (await supabase!.auth.getUser()).data.user?.id
            })
            .eq('id', solicitacaoId)
        })

        if (updateError) {
          console.error('Erro ao aprovar solicitação:', updateError)
          return { success: false, error: 'Erro ao aprovar solicitação' }
        }

        // NÃO criar usuário no Auth - ele usará a senha original da solicitação
        // O usuário será criado apenas na tabela usuarios

        // Fallback: Criar apenas na tabela usuarios (usuário precisará ser criado manualmente no Auth)
        const { error: createUserError } = await safeQuery(async () => {
          return await supabase!
            .from('usuarios')
            .insert([
              {
                id: solicitacao.id,
                nome: solicitacao.nome,
                email: solicitacao.email,
                tipo: 'user',
                dataRegistro: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ])
        })

        if (createUserError) {
          console.error('Erro ao criar usuário:', createUserError)
          return { success: false, error: 'Erro ao criar usuário' }
        }

        return { 
          success: true, 
          message: 'Solicitação aprovada com sucesso! O usuário pode fazer login com a senha original da solicitação.',
          user: {
            id: solicitacao.id,
            email: solicitacao.email,
            nome: solicitacao.nome
          }
        }
      } else {
        // Rejeitar a solicitação
        const { error: updateError } = await safeQuery(async () => {
          return await supabase!
            .from('solicitacoes_usuarios')
            .update({
              status: 'rejeitado',
              data_aprovacao: new Date().toISOString(),
              aprovado_por: (await supabase!.auth.getUser()).data.user?.id,
              motivo_rejeicao,
              observacoes
            })
            .eq('id', solicitacaoId)
        })

        if (updateError) {
          console.error('Erro ao rejeitar solicitação:', updateError)
          return { success: false, error: 'Erro ao rejeitar solicitação' }
        }

        return { success: true, message: 'Solicitação rejeitada' }
      }
    } catch (error: any) {
      console.error('Erro ao processar solicitação:', error)
      return { success: false, error: error.message }
    }
  }

  async solicitarCadastro(nome: string, email: string, senha: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase não configurado' }
      }

      // Usar o cliente anônimo já configurado
      if (!supabaseAnon) {
        return { success: false, error: 'Cliente anônimo não configurado' }
      }

      // Verificar se o email já existe
      const { data: existingUser, error: checkError } = await supabaseAnon
        .from('usuarios')
        .select('id, email')
        .eq('email', email)
        .maybeSingle()

      if (checkError) {
        console.error('Erro ao verificar usuário existente:', checkError)
        return { success: false, error: 'Erro ao verificar usuário existente' }
      }

      if (existingUser) {
        return { success: false, error: 'Email já cadastrado' }
      }

      // Verificar se já existe uma solicitação pendente
      const { data: existingSolicitacao, error: solicitacaoCheckError } = await supabaseAnon
        .from('solicitacoes_usuarios')
        .select('id, email')
        .eq('email', email)
        .maybeSingle()

      if (solicitacaoCheckError) {
        console.error('Erro ao verificar solicitação existente:', solicitacaoCheckError)
        return { success: false, error: 'Erro ao verificar solicitação existente' }
      }

      if (existingSolicitacao) {
        return { success: false, error: 'Já existe uma solicitação pendente para este email' }
      }

      // Criar solicitação usando cliente anônimo
      const senhaHash = await hashPassword(senha)
      const { data, error } = await supabaseAnon
        .from('solicitacoes_usuarios')
        .insert([
          {
            nome,
            email,
            senha_hash: senhaHash,
            status: 'pendente',
            observacoes: 'Aguardando aprovação do administrador'
          }
        ])
        .select('id, nome, email, status, data_solicitacao')
        .single()

      if (error) {
        console.error('Erro ao criar solicitação:', error)
        return { success: false, error: 'Erro ao criar solicitação' }
      }

      return { 
        success: true, 
        message: 'Solicitação enviada com sucesso! Aguarde a aprovação do administrador.',
        data
      }
    } catch (error: any) {
      console.error('Erro ao solicitar cadastro:', error)
      return { success: false, error: error.message }
    }
  }

  async getUsuariosAprovados(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase não configurado' }
      }

      // Buscar todos os usuários aprovados (tipo 'user')
      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .select('id, nome, email, tipo, dataRegistro, createdAt')
          .eq('tipo', 'user')
          .order('dataRegistro', { ascending: false })
      })

      if (error) {
        console.error('Erro ao buscar usuários aprovados:', error)
        return { success: false, error: 'Erro ao buscar usuários aprovados' }
      }

      return { 
        success: true, 
        data: data || [],
        message: 'Usuários aprovados carregados com sucesso!'
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuários aprovados:', error)
      return { success: false, error: error.message }
    }
  }

  async excluirUsuarioAprovado(usuarioId: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase não configurado' }
      }

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase!.auth.getUser()
      
      if (authError || !user) {
        return { 
          success: false, 
          error: 'Usuário não autenticado. Faça login para excluir usuários.' 
        }
      }

      // Verificar se o usuário a ser excluído existe
      const { data: usuarioExistente, error: checkError } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .select('id, nome, email, tipo')
          .eq('id', usuarioId)
          .eq('tipo', 'user')
          .single()
      })

      if (checkError || !usuarioExistente) {
        return { success: false, error: 'Usuário não encontrado ou não é um usuário aprovado' }
      }

      // Verificar se não está tentando excluir a si mesmo
      if (usuarioId === user.id) {
        return { success: false, error: 'Não é possível excluir sua própria conta' }
      }

      // Excluir o usuário da tabela usuarios
      const { error: deleteError } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .delete()
          .eq('id', usuarioId)
          .eq('tipo', 'user')
      })

      if (deleteError) {
        console.error('Erro ao excluir usuário:', deleteError)
        return { success: false, error: 'Erro ao excluir usuário' }
      }

      // Tentar excluir também do Supabase Auth (se existir)
      try {
        // Nota: Esta operação requer permissões especiais no Supabase
        // Em produção, isso seria feito através de uma função edge ou admin
        console.log('Usuário excluído da tabela usuarios. Para excluir do Auth, use o painel do Supabase.')
      } catch (authDeleteError) {
        console.log('Não foi possível excluir do Auth (normal):', authDeleteError)
      }

      return { 
        success: true, 
        message: `Usuário ${usuarioExistente.nome} (${usuarioExistente.email}) excluído com sucesso!`,
        data: usuarioExistente
      }
    } catch (error: any) {
      console.error('Erro ao excluir usuário aprovado:', error)
      return { success: false, error: error.message }
    }
  }

  async apagarHistoricoSolicitacoes(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase não configurado' }
      }

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase!.auth.getUser()
      
      if (authError || !user) {
        return { 
          success: false, 
          error: 'Usuário não autenticado. Faça login para apagar o histórico.' 
        }
      }

      // Apagar apenas solicitações processadas (aprovadas ou rejeitadas)
      const { error } = await safeQuery(async () => {
        return await supabase!
          .from('solicitacoes_usuarios')
          .delete()
          .in('status', ['aprovado', 'rejeitado'])
      })

      if (error) {
        console.error('Erro ao apagar histórico:', error)
        return { success: false, error: 'Erro ao apagar histórico' }
      }

      return { 
        success: true, 
        message: 'Histórico de solicitações processadas apagado com sucesso!' 
      }
    } catch (error: any) {
      console.error('Erro ao apagar histórico:', error)
      return { success: false, error: error.message }
    }
  }

  async vincularCarteiraUsuario(usuarioId: string, dadosCarteiraInput: {
    endereco: string;
    tipo: 'solana' | 'ethereum';
    valorAtual?: number;
    tokens?: any[];
  }): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase não configurado' }
      }

      // Verificar se o usuário existe
      const { data: usuario, error: userError } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .select('id, nome, email')
          .eq('id', usuarioId)
          .single()
      })

      if (userError || !usuario) {
        return { success: false, error: 'Usuário não encontrado' }
      }

      // Criar ou atualizar dados do cliente na tabela clientes
      const dadosCliente = {
        id: usuarioId,
        nome: usuario.nome,
        tipo: 'bitcoin', // Tipo padrão para usuários com carteiras
        dataInicio: new Date().toISOString(),
        investimentoInicial: dadosCarteiraInput.valorAtual || 0,
        valorCarteiraDeFi: dadosCarteiraInput.valorAtual || 0,
        apyMedio: 0,
        tempoMercado: 'Recém iniciado',
        scoreRisco: 'Baixo',
        updatedAt: new Date().toISOString()
      };

      // Inserir ou atualizar cliente (usando upsert)
      const { data: clienteData, error: clienteError } = await safeQuery(async () => {
        return await supabase!
          .from('clientes')
          .upsert([dadosCliente], { onConflict: 'id' })
          .select()
          .single()
      })

      if (clienteError) {
        console.error('Erro ao criar/atualizar cliente:', clienteError)
        return { success: false, error: 'Erro ao vincular carteira ao usuário' }
      }

      // Criar carteira na tabela carteiras
      const dadosCarteira = {
        clienteId: usuarioId,
        endereco: dadosCarteiraInput.endereco,
        tipo: dadosCarteiraInput.tipo,
        valorAtual: dadosCarteiraInput.valorAtual || 0,
        ultimaAtualizacao: new Date().toISOString()
      };

      const { data: carteiraData, error: carteiraError } = await safeQuery(async () => {
        return await supabase!
          .from('carteiras')
          .insert([dadosCarteira])
          .select('id, endereco, tipo, nome, valorAtual, ultimaAtualizacao, clienteId, createdAt, updatedAt')
          .single()
      })

      if (carteiraError) {
        console.error('Erro ao criar carteira:', carteiraError)
        return { success: false, error: 'Erro ao criar carteira' }
      }

      // Criar tokens na tabela tokens se existirem
      if (dadosCarteiraInput.tokens && dadosCarteiraInput.tokens.length > 0) {
        const tokensData = dadosCarteiraInput.tokens.map((token: any) => ({
          carteiraId: carteiraData.id,
          symbol: token.symbol,
          balance: token.balance,
          valueUSD: token.valueUSD
        }));

        const { error: tokensError } = await safeQuery(async () => {
          return await supabase!
            .from('tokens')
            .insert(tokensData)
        });

        if (tokensError) {
          console.error('Erro ao criar tokens:', tokensError)
          // Não retornamos erro aqui pois a carteira já foi criada
        }
      }

      return { 
        success: true, 
        message: `Carteira vinculada com sucesso ao usuário ${usuario.nome}!`,
        data: {
          usuario,
          carteira: carteiraData,
          cliente: clienteData
        }
      }
    } catch (error: any) {
      console.error('Erro ao vincular carteira:', error)
      return { success: false, error: error.message }
    }
  }

  async criarUsuarioAdmin(nome: string, email: string, senha: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase não configurado' }
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
            tipo: 'admin',
            email_confirmed_at: new Date().toISOString()
          }
        }
      })

      if (authError) {
        console.error('Erro ao criar usuário admin no Auth:', authError)
        return { success: false, error: `Erro ao criar usuário: ${authError.message}` }
      }

      if (!authData.user) {
        return { success: false, error: 'Erro ao criar usuário - nenhum dado retornado' }
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
        console.error('Erro ao criar usuário admin na tabela:', insertError)
        return { success: false, error: 'Erro ao criar usuário admin' }
      }

      // Fazer logout após criar conta
      await supabase!.auth.signOut();
      
      return { 
        success: true, 
        message: 'Usuário admin criado com sucesso! Faça login para acessar.',
        user: userData
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário admin:', error)
      return { success: false, error: error.message }
    }
  }
}

// Exportar instância única
export const apiClient = new SupabaseApiClient()
export const supabaseClient = supabase 