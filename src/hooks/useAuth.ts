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

  // Verificar se há token salvo na sessão ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se há token na sessão (sessionStorage é mais seguro que localStorage)
        const token = sessionStorage.getItem('authToken');
        
        if (token) {
          // Verificar se o token ainda é válido
          const result = await authService.getCurrentUser(token);
          
          if (result.success && result.usuario) {
            setAuthState({
              usuario: result.usuario,
              token,
              loading: false,
              error: null
            });
          } else {
            // Token inválido, limpar sessão
            sessionStorage.removeItem('authToken');
            setAuthState({
              usuario: null,
              token: null,
              loading: false,
              error: null
            });
          }
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        sessionStorage.removeItem('authToken');
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
      
      if (result.success && result.usuario && result.token) {
        // Salvar token na sessão
        sessionStorage.setItem('authToken', result.token);
        
        setAuthState({
          usuario: result.usuario,
          token: result.token,
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
      
      if (result.success && result.usuario && result.token) {
        // Salvar token na sessão
        sessionStorage.setItem('authToken', result.token);
        
        setAuthState({
          usuario: result.usuario,
          token: result.token,
          loading: false,
          error: null
        });
        
        return { success: true };
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
      if (authState.token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar sessão independente do resultado
      sessionStorage.removeItem('authToken');
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