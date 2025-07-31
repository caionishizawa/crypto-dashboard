import type { Usuario, LoginData, RegisterData } from '../types';
import { apiClient } from '../lib/api';

class AuthService {
  // Login do usuário
  async login(loginData: LoginData): Promise<{ success: boolean; usuario?: Usuario; error?: string }> {
    try {
      const response = await apiClient.login(loginData.email, loginData.senha);
      
      if (response.success && response.user) {
        // Retornar dados do usuário autenticado
        const userData = {
          id: response.user.id,
          nome: response.user.nome,
          email: response.user.email,
          tipo: response.user.tipo,
          dataRegistro: response.user.data_registro || response.user.dataRegistro
        };

        return { 
          success: true, 
          usuario: userData
        };
      }
      
      return { success: false, error: response.error || 'Email ou senha incorretos' };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message || 'Erro interno do servidor' };
    }
  }

  // Registro de novo usuário
  async register(registerData: RegisterData): Promise<{ success: boolean; usuario?: Usuario; error?: string; requiresEmailConfirmation?: boolean }> {
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

        return { 
          success: true, 
          usuario: userData
        };
      }
      
      // Se requer confirmação de email
      if (response.success && response.requiresEmailConfirmation) {
        return { 
          success: true, 
          requiresEmailConfirmation: true
        };
      }
      
      return { success: false, error: response.error || 'Erro no registro' };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { success: false, error: error.message || 'Erro interno do servidor' };
    }
  }

  // Verificar usuário atual
  async getCurrentUser(token: string): Promise<{ success: boolean; usuario?: Usuario; error?: string }> {
    try {
      const response = await apiClient.getCurrentUser(token);
      
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
      
      return { success: false, error: response.error || 'Usuário não autenticado' };
    } catch (error: any) {
      console.error('Erro ao obter usuário atual:', error);
      return { success: false, error: error.message || 'Erro interno do servidor' };
    }
  }

  // Logout
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.logout();
      return { success: response.success, error: response.error };
    } catch (error: any) {
      console.error('Erro no logout:', error);
      return { success: false, error: error.message || 'Erro interno do servidor' };
    }
  }
}

// Exportar instância única
export const authService = new AuthService(); 