import { createClient } from '@supabase/supabase-js'
import { usuariosIniciais } from '../data/usuarios'
import { clientesData } from '../data/clientes'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar se o Supabase está configurado
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key'

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

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
              data_registro: usuario.dataRegistro
            },
            token: 'local-token'
          }
        }
        
        return { success: false, error: 'Email ou senha incorretos' }
      }

      // Modo online - usar Supabase
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password: senha
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Buscar dados do usuário na tabela usuarios
        const { data: userData, error: userError } = await supabase!
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .single()

        if (userError) {
          return { success: false, error: 'Erro ao carregar dados do usuário' }
        }

        return { 
          success: true, 
          user: userData,
          token: data.session?.access_token
        }
      }

      return { success: false, error: 'Usuário não encontrado' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async register(nome: string, email: string, senha: string, confirmarSenha: string): Promise<ApiResponse> {
    try {
      if (senha !== confirmarSenha) {
        return { success: false, error: 'Senhas não coincidem' }
      }

      if (!isSupabaseConfigured) {
        // Modo offline - usar localStorage
        const usuarios = this.getLocalUsers()
        
        // Verificar se o email já existe
        if (usuarios.find(u => u.email === email)) {
          return { success: false, error: 'Email já cadastrado' }
        }

        const novoUsuario = {
          id: `user-${Date.now()}`,
          nome,
          email,
          senha,
          tipo: 'cliente' as const,
          dataRegistro: new Date().toISOString()
        }

        usuarios.push(novoUsuario)
        localStorage.setItem('dashboardUsers', JSON.stringify(usuarios))

        return {
          success: true,
          user: {
            id: novoUsuario.id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            tipo: novoUsuario.tipo,
            data_registro: novoUsuario.dataRegistro
          },
          token: 'local-token'
        }
      }

      // Modo online - usar Supabase
      const { data, error } = await supabase!.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            name: nome
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Criar registro na tabela usuarios
        const { data: userData, error: insertError } = await supabase!
          .from('usuarios')
          .insert([
            {
              nome,
              email,
              tipo: 'cliente',
              data_registro: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (insertError) {
          return { success: false, error: 'Erro ao criar usuário' }
        }

        return { 
          success: true, 
          user: userData,
          token: data.session?.access_token
        }
      }

      return { success: false, error: 'Erro ao registrar usuário' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getCurrentUser(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        // Modo offline - verificar localStorage
        const userData = localStorage.getItem('dashboardUser')
        if (userData) {
          const user = JSON.parse(userData)
          return { success: true, user }
        }
        return { success: false, error: 'Usuário não autenticado' }
      }

      // Modo online - usar Supabase
      const { data: { session } } = await supabase!.auth.getSession()
      
      if (!session) {
        return { success: false, error: 'Usuário não autenticado' }
      }

      const { data: userData, error } = await supabase!
        .from('usuarios')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (error) {
        return { success: false, error: 'Erro ao carregar usuário' }
      }

      return { success: true, user: userData }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // === MÉTODOS HELPER PARA MODO OFFLINE ===

  private getLocalUsers() {
    try {
      const stored = localStorage.getItem('dashboardUsers')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
    return [...usuariosIniciais]
  }

  // === MÉTODOS DE CLIENTES ===

  async getClientes(): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        // Modo offline - usar dados locais
        const clientes = Object.values(clientesData)
        return { success: true, data: clientes }
      }

      // Modo online - usar Supabase
      const { data, error } = await supabase!
        .from('clientes')
        .select(`
          *,
          transacoes(*),
          carteiras(*, tokens(*)),
          snapshots:daily_snapshots(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getCliente(id: string): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        // Modo offline - usar dados locais
        const cliente = clientesData[id]
        if (cliente) {
          return { success: true, data: cliente }
        }
        return { success: false, error: 'Cliente não encontrado' }
      }

      // Modo online - usar Supabase
      const { data, error } = await supabase!
        .from('clientes')
        .select(`
          *,
          transacoes(*),
          carteiras(*, tokens(*)),
          snapshots:daily_snapshots(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async createCliente(clienteData: any): Promise<ApiResponse> {
    try {
      if (!isSupabaseConfigured) {
        // Modo offline - simular criação
        const novoCliente = {
          id: `cliente-${Date.now()}`,
          ...clienteData,
          transacoes: [],
          carteiras: [],
          snapshots: []
        }
        
        return { success: true, data: novoCliente }
      }

      // Modo online - usar Supabase
      const { data, error } = await supabase!
        .from('clientes')
        .insert([clienteData])
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Implementar outros métodos conforme necessário...
  async updateCliente(id: string, clienteData: any): Promise<ApiResponse> {
    return { success: true, data: clienteData }
  }

  async deleteCliente(id: string): Promise<ApiResponse> {
    return { success: true }
  }

  async addTransacao(clienteId: string, transacaoData: any): Promise<ApiResponse> {
    return { success: true, data: transacaoData }
  }

  async getCarteirasCliente(clienteId: string): Promise<ApiResponse> {
    return { success: true, data: [] }
  }

  async getCarteira(id: string): Promise<ApiResponse> {
    return { success: true, data: null }
  }

  async createCarteira(carteiraData: any): Promise<ApiResponse> {
    return { success: true, data: carteiraData }
  }

  async updateCarteira(id: string, carteiraData: any): Promise<ApiResponse> {
    return { success: true, data: carteiraData }
  }

  async deleteCarteira(id: string): Promise<ApiResponse> {
    return { success: true }
  }

  async refreshCarteira(id: string): Promise<ApiResponse> {
    return { success: true, data: null }
  }

  async getDashboardStats(): Promise<ApiResponse> {
    return { success: true, data: { totalClientes: 2, valorTotal: 500000, rendimentoMedio: 24.5 } }
  }

  async getPerformanceData(): Promise<ApiResponse> {
    return { success: true, data: [] }
  }

  async getDistributionData(): Promise<ApiResponse> {
    return { success: true, data: {} }
  }

  async getRecentActivity(): Promise<ApiResponse> {
    return { success: true, data: [] }
  }
}

// Exportar instância única
export const apiClient = new SupabaseApiClient()

// Exportar tipos
export type { ApiResponse }
export { supabase as supabaseClient }

// Exportar status da configuração
export { isSupabaseConfigured } 