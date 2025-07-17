import type { Usuario, LoginData, RegisterData } from '../types';
import { supabaseClient } from '../lib/api';
import { apiClient } from '../lib/api';

class AuthService {
  // Login do usuário
  async login(loginData: LoginData): Promise<{ success: boolean; usuario?: Usuario; error?: string }> {
    try {
      const response = await apiClient.login(loginData.email, loginData.senha);
      
      if (response.success && response.user) {
        // Salvar dados do usuário autenticado
        const userData = {
          id: response.user.id,
          nome: response.user.nome,
          email: response.user.email,
          tipo: response.user.tipo,
          dataRegistro: response.user.data_registro || response.user.dataRegistro
        };
        
        // Salvar no localStorage para compatibilidade
        localStorage.setItem('dashboardUser', JSON.stringify({
          ...userData,
          token: response.token,
          timestamp: Date.now()
        }));

        return { success: true, usuario: userData };
      }
      
      return { success: false, error: response.error || 'Email ou senha incorretos' };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message || 'Erro interno do servidor' };
    }
  }

  // Registro de novo usuário
  async register(registerData: RegisterData): Promise<{ success: boolean; usuario?: Usuario; error?: string }> {
    try {
      const response = await apiClient.register(
        registerData.nome,
        registerData.email,
        registerData.senha,
        registerData.confirmarSenha
      );
      
      if (response.success && response.user) {
        const userData = {
          id: response.user.id,
          nome: response.user.nome,
          email: response.user.email,
          tipo: response.user.tipo,
          dataRegistro: response.user.data_registro || response.user.dataRegistro
        };

        return { success: true, usuario: userData };
      }
      
      return { success: false, error: response.error || 'Erro no registro' };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { success: false, error: error.message || 'Erro interno do servidor' };
    }
  }

  // Logout do usuário
  async logout(): Promise<void> {
    try {
      // Logout do Supabase
      await supabaseClient.auth.signOut();
      
      // Limpar localStorage
      localStorage.removeItem('dashboardUser');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpar localStorage
    localStorage.removeItem('dashboardUser');
  }
  }

  // Verificar se usuário está logado
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      return !!session;
      } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
      }
  }

  // Obter usuário atual
  async getCurrentUser(): Promise<Usuario | null> {
    try {
      const response = await apiClient.getCurrentUser();
      
      if (response.success && response.user) {
        return {
          id: response.user.id,
          nome: response.user.nome,
          email: response.user.email,
          tipo: response.user.tipo,
          dataRegistro: response.user.data_registro || response.user.dataRegistro
        };
  }

      return null;
    } catch (error: any) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  // Validar dados de usuário (compatibilidade com sistema antigo)
  async validateUser(email: string, senha: string): Promise<Usuario | null> {
    try {
      const result = await this.login({ email, senha });
      return result.success ? result.usuario || null : null;
    } catch (error: any) {
      console.error('Erro ao validar usuário:', error);
      return null;
    }
  }

  // Atualizar dados do usuário
  async updateUser(userData: Partial<Usuario>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Atualizar metadados do usuário no Supabase Auth
      if (userData.nome) {
        await supabaseClient.auth.updateUser({
          data: { name: userData.nome }
        });
      }

      // Atualizar dados na tabela usuarios
      const { error } = await supabaseClient
        .from('usuarios')
        .update({
          nome: userData.nome,
          ...(userData.email && { email: userData.email })
        })
        .eq('email', user.email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, error: error.message };
    }
  }

  // Resetar senha
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      return { success: false, error: error.message };
    }
  }

  // Confirmar reset de senha
  async confirmPasswordReset(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao confirmar reset de senha:', error);
      return { success: false, error: error.message };
    }
  }
}

export const authService = new AuthService(); 