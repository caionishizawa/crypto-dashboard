import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { usuariosIniciais } from '../data/usuarios'
import { clientesData } from '../data/clientes'

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
      throw new Error('Supabase não configurado')
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

// Tipos para as respostas da API
interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

class SupabaseApiClient {
  
  // === MÉTODOS DE AUTENTICAÇÃO ===
  
  async login(email: string, senha: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        // Modo offline - usar dados locais
        const usuarios = this.getLocalUsers()
        const usuario = usuarios.find(u => u.email === email && u.senha === senha)
        
        if (usuario) {
          return {
            success: true,
            user: {
              id: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
              tipo: usuario.tipo,
              dataRegistro: usuario.dataRegistro
            },
            token: 'local-token'
          }
        }
        
        return { success: false, error: 'Email ou senha incorretos' }
      }

      // Modo online - verificar diretamente na tabela usuarios
      const { data: userData, error } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .select('id, nome, email, senha, tipo, dataRegistro')
          .eq('email', email)
          .single()
      })

      if (error) {
        console.error('Erro ao fazer login:', error)
        return { success: false, error: 'Email ou senha incorretos' }
      }

      if (userData) {
        // Verificar se a senha está correta
        const senhaCorreta = await verifyPassword(senha, userData.senha)
        
        if (senhaCorreta) {
          return { 
            success: true, 
            user: {
              id: userData.id,
              nome: userData.nome,
              email: userData.email,
              tipo: userData.tipo,
              dataRegistro: userData.dataRegistro
            },
            token: 'user-token'
          }
        }
      }

      return { success: false, error: 'Email ou senha incorretos' }
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
        // Simular registro local
        const novoUsuario = {
          id: `user-${Date.now()}`,
          nome,
          email,
          tipo: 'admin',
          dataRegistro: new Date().toISOString()
        }
        return { success: true, user: novoUsuario, token: 'local-token' }
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

      // Criar usuário diretamente na tabela usuarios
      const senhaCriptografada = await hashPassword(senha)
      
      const { data: userData, error: insertError } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .insert([
            {
              id: `user-${Date.now()}`,
              nome,
              email,
              senha: senhaCriptografada, // Senha criptografada
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
        console.error('Erro ao criar usuário:', insertError)
        return { success: false, error: 'Erro ao criar usuário' }
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
        message: 'Conta criada com sucesso!'
      }
    } catch (error: any) {
      console.error('Erro no registro:', error)
      return { success: false, error: error.message }
    }
  }

  async getCurrentUser(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Modo offline' }
      }

      // Verificar se há token salvo
      const token = localStorage.getItem('userToken');
      if (!token) {
        return { success: false, error: 'Usuário não autenticado' }
      }

      // Buscar o último usuário logado (simplificado)
      // Em um sistema real, você salvaria o ID do usuário no token
      const { data: userData, error: userError } = await safeQuery(async () => {
        return await supabase!
          .from('usuarios')
          .select('id, nome, email, tipo, dataRegistro')
          .order('createdAt', { ascending: false })
          .limit(1)
          .single()
      })

      if (userError) {
        console.error('Erro ao buscar usuário:', userError)
        return { success: false, error: 'Erro ao carregar usuário' }
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

      const { error } = await safeQuery(async () => {
        return await supabase!.auth.signOut()
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Erro no logout:', error)
      return { success: false, error: error.message }
    }
  }

  // === MÉTODOS AUXILIARES ===
  
  private getLocalUsers() {
    return usuariosIniciais
  }

  private getLocalClients() {
    return clientesData
  }

  // === MÉTODOS DE CLIENTES ===
  
  async getClientes(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        return { success: true, data: Object.values(this.getLocalClients()) }
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
        return { success: true, data: { id: `cliente-${Date.now()}`, ...clienteData } }
      }

      const { data, error } = await safeQuery(async () => {
        return await supabase!
          .from('clientes')
          .insert([clienteData])
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
        const clientes = this.getLocalClients()
        const cliente = clientes[id]
        return cliente ? { success: true, data: cliente } : { success: false, error: 'Cliente não encontrado' }
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
        return { success: true, data: { id, ...clienteData } }
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
        return { success: true }
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
        return { success: true, data: { id: `transacao-${Date.now()}`, ...transacaoData } }
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
        return { success: true, data: [] }
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
        return { success: true, data: null }
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
        return { success: true, data: { id: `carteira-${Date.now()}`, ...carteiraData } }
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
        return { success: true, data: { id, ...carteiraData } }
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
        return { success: true }
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
        return { success: true, data: null }
      }

      // Simular refresh de carteira
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
        return { success: true, data: { totalClientes: 2, valorTotal: 500000, rendimentoMedio: 24.5 } }
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
        return { success: true, data: [] }
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
        return { success: true, data: {} }
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
        return { success: true, data: [] }
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