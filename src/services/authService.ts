import type { Usuario, LoginData, RegisterData } from '../types';
import { apiClient } from '../lib/api';

class AuthService {
  // Login do usuário
  async login(loginData: LoginData): Promise<{ success: boolean; usuario?: Usuario; error?: string }> {
    try {
      const response = await apiClient.login(loginData.email, loginData.senha);
      
      if (response.success && response.user) {
        return { success: true, usuario: response.user };
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
        return { success: true, usuario: response.user };
      }
      
      return { success: false, error: response.error || 'Erro no registro' };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { success: false, error: error.message || 'Erro interno do servidor' };
    }
  }

  // Logout do usuário
  logout(): void {
    localStorage.removeItem('dashboardUser');
  }

  // Verificar sessão salva
  checkSavedSession(): Usuario | null {
    const savedUser = localStorage.getItem('dashboardUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Erro ao recuperar sessão:', error);
        this.logout();
        return null;
      }
    }
    return null;
  }

  // Obter usuário atual
  getCurrentUser(): Usuario | null {
    return this.checkSavedSession();
  }

  // Validar usuário atual (buscar dados atualizados do servidor)
  async validateUser(): Promise<Usuario | null> {
    try {
      const response = await apiClient.getCurrentUser() as { user?: Usuario };
      return response.user || null;
    } catch (error) {
      console.error('Erro ao validar usuário:', error);
      return null;
    }
  }
}

// Exportar instância única (Singleton)
export const authService = new AuthService(); 