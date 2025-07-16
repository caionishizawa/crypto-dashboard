import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      {/* Formulário de Login */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <LogIn className="w-6 h-6 mr-2 text-green-400" />
            Fazer Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-12 py-2.5 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Checkbox Manter Conectado */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="manterConectado"
                checked={manterConectado}
                onChange={(e) => setManterConectado(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-800 border-gray-700 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="manterConectado" className="ml-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                Manter conectado
              </label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-green-400 hover:text-green-300 font-medium"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </div>
  );
}; 