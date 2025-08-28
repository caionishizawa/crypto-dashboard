import React, { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import type { LoginData } from '../../types/usuario';

interface LoginFormProps {
  onLogin: (loginData: LoginData & { manterConectado?: boolean }) => Promise<{ success: boolean; error?: string }>;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState<LoginData>({ email: '', senha: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [manterConectado, setManterConectado] = useState<boolean>(false);

  // Carregar email salvo quando o componente montar
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const shouldRemember = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && shouldRemember) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setManterConectado(true);
    }
  }, []);

  // Função para salvar email no localStorage
  const saveEmailToStorage = (email: string) => {
    if (manterConectado) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    }
  };

  // Função para limpar dados salvos
  const clearSavedData = () => {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.senha) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    const result = await onLogin({ ...formData, manterConectado });
    if (result.success) {
      // Salvar email se "Lembrar de mim" estiver ativado
      saveEmailToStorage(formData.email);
    } else {
      setError(result.error || 'Erro ao fazer login');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md relative mx-4 lg:mx-0">
      {/* Elementos decorativos de fundo */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tl from-purple-500/20 to-green-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      {/* Formulário de Login */}
      <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-800/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-gray-700/50 shadow-2xl">
        {/* Header elegante */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Bem-vindo de volta
          </h2>
          <p className="text-gray-400 text-sm">
            Acesse sua conta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-green-400" />
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="relative w-full bg-gray-800/80 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 focus:bg-gray-800/90 transition-all duration-300"
                placeholder="seu@email.com"
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-green-400" />
              Senha
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                className="relative w-full bg-gray-800/80 border border-gray-600/50 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 focus:bg-gray-800/90 transition-all duration-300"
                placeholder="••••••••"
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-700/50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Checkbox Lembrar de Mim */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="manterConectado"
                checked={manterConectado}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setManterConectado(isChecked);
                  
                  // Se desmarcou, limpar dados salvos
                  if (!isChecked) {
                    clearSavedData();
                  }
                }}
                className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="manterConectado" className="ml-3 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                Lembrar de mim
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse"></div>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Entrando...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900/90 text-gray-400">ou</span>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>

        {/* Elemento decorativo inferior */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent rounded-full opacity-50"></div>
      </div>
    </div>
  );
}; 