import { useState, useEffect } from 'react';
import type { Usuario, LoginData, RegisterData } from '../types/usuario';
import { authService } from '../services/authService';

interface AuthState {
  user: Usuario | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Verificar se há sessão salva ao inicializar
  useEffect(() => {
    const checkSavedSession = () => {
      const sessaoSalva = localStorage.getItem('sessaoUsuario');
      if (sessaoSalva) {
        try {
          const dadosSessao = JSON.parse(sessaoSalva);
          // Restaurar dados completos do usuário
          setAuthState({
            user: dadosSessao.user,
            loading: false,
            error: null
          });
        } catch (error) {
          localStorage.removeItem('sessaoUsuario');
          setAuthState({
            user: null,
            loading: false,
            error: null
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkSavedSession();
  }, []);

  const login = async (dados: LoginData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const resultado = await authService.login(dados);
      
      if (resultado.success && resultado.usuario) {
        // Salvar sessão completa do usuário
        localStorage.setItem('sessaoUsuario', JSON.stringify({
          user: resultado.usuario,
          timestamp: Date.now()
        }));

        setAuthState({
          user: resultado.usuario,
          loading: false,
          error: null
        });

        return { success: true };
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: resultado.error || 'Erro ao fazer login'
        });
        return { success: false, error: resultado.error || 'Erro ao fazer login' };
      }
    } catch (error) {
      const errorMessage = 'Erro inesperado ao fazer login';
      setAuthState({
        user: null,
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (dados: RegisterData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const resultado = await authService.register(dados);
      
      if (resultado.success && resultado.usuario) {
        setAuthState({
          user: null, // Não loga automaticamente após registro
          loading: false,
          error: null
        });
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: resultado.error || 'Erro ao fazer cadastro'
        }));
        return { success: false, error: resultado.error || 'Erro ao fazer cadastro' };
      }
    } catch (error) {
      const errorMessage = 'Erro inesperado ao fazer cadastro';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('sessaoUsuario');
    setAuthState({
      user: null,
      loading: false,
      error: null
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!authState.user,
    isAdmin: authState.user?.tipo === 'admin'
  };
}; 