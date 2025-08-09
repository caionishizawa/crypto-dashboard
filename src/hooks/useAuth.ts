import { useState, useEffect } from 'react';
import type { Usuario, LoginData, RegisterData } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    usuario: null,
    token: null,
    loading: true,
    error: null
  });

  // Verificar se há sessão ativa do Supabase ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Não há mais confirmação de email - removido essa lógica

        // Verificar se há sessão ativa do Supabase apenas uma vez
        try {
          const result = await authService.getCurrentUser('');
          
          if (result.success && result.usuario) {
            setAuthState({
              usuario: result.usuario,
              token: 'supabase-session',
              loading: false,
              error: null
            });
          } else {
            setAuthState({
              usuario: null,
              token: null,
              loading: false,
              error: null
            });
          }
        } catch (sessionError) {
          console.log('🔍 Sem sessão ativa (normal):', sessionError);
          setAuthState({
            usuario: null,
            token: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setAuthState({
          usuario: null,
          token: null,
          loading: false,
          error: 'Erro ao verificar autenticação'
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (loginData: LoginData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authService.login(loginData);
      
      if (result.success && result.usuario) {
        setAuthState({
          usuario: result.usuario,
          token: 'supabase-session',
          loading: false,
          error: null
        });
        
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Erro ao fazer login'
        }));
        
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro interno do servidor'
      }));
      
      return { success: false, error: error.message };
    }
  };

  const register = async (registerData: RegisterData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authService.register(registerData);
      
      // NUNCA fazer login automático após registro
      // Sempre manter o usuário deslogado após o registro
      setAuthState({
        usuario: null,
        token: null,
        loading: false,
        error: null
      });
      
      if (result.success && result.requiresEmailConfirmation) {
        return { success: true, requiresEmailConfirmation: true };
      } else if (result.success) {
        // Mesmo se não requer confirmação, manter deslogado
        return { success: true, requiresEmailConfirmation: false };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Erro ao fazer registro'
        }));
        
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro interno do servidor'
      }));
      
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setAuthState({
        usuario: null,
        token: null,
        loading: false,
        error: null
      });
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    // Estado
    usuario: authState.usuario,
    token: authState.token,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.usuario && !!authState.token,
    
    // Ações
    login,
    register,
    logout,
    clearError
  };
}; 