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
        // Verificar se o usuário vem de uma confirmação de email
        const urlParams = new URLSearchParams(window.location.search);
        const isEmailConfirmation = urlParams.get('type') === 'signup' || 
                                   urlParams.get('type') === 'recovery' ||
                                   window.location.hash.includes('access_token');
        
        // Se vem de confirmação de email, fazer logout e limpar a sessão
        if (isEmailConfirmation) {
          console.log('🔍 Detectada confirmação de email, fazendo logout automático...');
          await authService.logout();
          
          // Limpar a URL para remover os parâmetros
          window.history.replaceState({}, document.title, window.location.pathname);
          
          setAuthState({
            usuario: null,
            token: null,
            loading: false,
            error: null
          });
          return;
        }

        // Verificar se há sessão ativa do Supabase
        const result = await authService.getCurrentUser('');
        
        if (result.success && result.usuario) {
          setAuthState({
            usuario: result.usuario,
            token: 'supabase-session', // Token simbólico para indicar sessão ativa
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
          token: 'supabase-session', // Token simbólico para indicar sessão ativa
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
      
      if (result.success && result.usuario) {
        setAuthState({
          usuario: result.usuario,
          token: 'supabase-session', // Token simbólico para indicar sessão ativa
          loading: false,
          error: null
        });
        
        return { success: true };
      } else if (result.success && result.requiresEmailConfirmation) {
        // Usuário criado mas precisa confirmar email
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: null
        }));
        
        return { success: true, requiresEmailConfirmation: true };
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