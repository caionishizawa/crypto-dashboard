import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import type { RegisterData } from '../../types/usuario';
import Notification from '../Notification';

// Função para validar email APENAS com provedores conhecidos e confiáveis
const validarEmailAvancado = (email: string): boolean => {
  // Regex básico para formato de email
  const regexBasico = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!regexBasico.test(email)) {
    return false;
  }
  
  // Lista RESTRITA de provedores de email conhecidos e confiáveis
  const provedoresConhecidos = [
    // Principais provedores internacionais
    'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
    'live.com', 'msn.com', 'aol.com', 'protonmail.com', 'zoho.com',
    'mail.com', 'yandex.com', 'gmx.com', 'fastmail.com', 'tutanota.com',
    'me.com', 'mac.com', 'yahoo.com.br', 'outlook.com.br',
    
    // Provedores brasileiros populares
    'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br', 'globo.com',
    'r7.com', 'oi.com.br', 'zipmail.com.br', 'designa.com.br', 'superig.com.br',
    'pop.com.br', 'click21.com.br', 'ibest.com.br', 'itelefonica.com.br',
    
    // Alguns provedores educacionais específicos (removidos genéricos como .com.br)
    'usp.br', 'unicamp.br', 'ufrj.br', 'ufmg.br',
    
    // Outros provedores conhecidos
    'rediffmail.com', 'inbox.com', 'mail.ru', 'rambler.ru', 'ymail.com',
    'rocketmail.com', 'sbcglobal.net', 'verizon.net', 'att.net', 'comcast.net'
  ];
  
  const dominio = email.split('@')[1].toLowerCase();
  
  // APENAS aceitar provedores da lista conhecida
  return provedoresConhecidos.includes(dominio);
};

interface RegisterFormProps {
  onRegister: (registerData: RegisterData) => Promise<{ 
    success: boolean; 
    error?: string; 
    message?: string;
    requiresEmailConfirmation?: boolean;
  }>;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterData>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(0);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  // Efeito SIMPLIFICADO para countdown visual apenas
  useEffect(() => {
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [redirectCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    // Validação avançada de email
    if (!validarEmailAvancado(formData.email)) {
      setError('Por favor, use um email válido de um provedor conhecido (Gmail, Outlook, Yahoo, etc.)');
      setLoading(false);
      return;
    }

    const result = await onRegister(formData);
    console.log('🎯 FRONTEND - Resultado recebido:', result);
    
    if (result.success) {
      console.log('🎯 FRONTEND - Definindo mensagem de sucesso...');
      // Mostrar notificação de sucesso
      setSuccess('🎉 Conta criada com sucesso! Redirecionando para login...');
      setShowNotification(true);
      setRedirectCountdown(5); // Reduzido para 5 segundos
      console.log('🎯 FRONTEND - Mensagem definida! Success:', '🎉 Conta criada com sucesso! Redirecionando para login...');
      console.log('🎯 FRONTEND - Countdown definido:', 5);
      
      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
      });
      
      // Redirecionamento após 5 segundos
      setTimeout(() => {
        console.log('🎯 FRONTEND - Executando redirecionamento...');
        onSwitchToLogin();
      }, 5000);
      
    } else {
      console.log('🎯 FRONTEND - Definindo erro:', result.error);
      setError(result.error || 'Erro ao criar conta');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md relative">
      {/* Notificação de sucesso */}
      <Notification
        message="🎉 Conta criada com sucesso! Redirecionando para login..."
        type="success"
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        autoClose={true}
        duration={5000}
      />

      {/* Elementos decorativos de fundo */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tl from-green-500/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      {/* Formulário de Cadastro */}
      <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
        {/* Header elegante */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Criar conta
          </h2>
          <p className="text-gray-400 text-sm">
            Junte-se à nossa plataforma
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2 text-blue-400" />
              Nome Completo
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="relative w-full bg-gray-800/80 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-800/90 transition-all duration-300"
                placeholder="Seu nome"
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-blue-400" />
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="relative w-full bg-gray-800/80 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-800/90 transition-all duration-300"
                placeholder="seu@email.com"
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-blue-400" />
              Senha
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                className="relative w-full bg-gray-800/80 border border-gray-600/50 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-800/90 transition-all duration-300"
                placeholder="••••••••"
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-700/50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-blue-400" />
              Confirmar Senha
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmarSenha}
                onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                className="relative w-full bg-gray-800/80 border border-gray-600/50 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-800/90 transition-all duration-300"
                placeholder="••••••••"
              />
              <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-700/50"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse"></div>
              {error}
            </div>
          )}

          {success && redirectCountdown > 0 && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-xl p-6 text-green-300 text-center shadow-lg animate-pulse">
              <div className="flex items-center justify-center mb-3">
                <div className="w-6 h-6 bg-green-400 rounded-full mr-3 animate-bounce"></div>
                <div className="text-2xl font-bold">🎉 CONTA CRIADA COM SUCESSO! 🎉</div>
              </div>
              <div className="text-green-200 text-lg font-semibold">
                ⏰ Redirecionando para login em {redirectCountdown} segundo{redirectCountdown !== 1 ? 's' : ''}...
              </div>
              <div className="mt-3 text-green-300 text-sm">
                Você será redirecionado automaticamente para fazer login
              </div>
            </div>
          )}
          
          {/* Log de debug para ver se está renderizando */}
          {success && console.log('🎯 FRONTEND - RENDERIZANDO mensagem de sucesso:', success)}
          {redirectCountdown > 0 && console.log('🎯 FRONTEND - RENDERIZANDO countdown:', redirectCountdown)}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700 hover:from-blue-600 hover:via-purple-700 hover:to-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Criando conta...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Criar Conta</span>
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
              Já tem uma conta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
              >
                Faça login
              </button>
            </p>
          </div>
        </div>

        {/* Elemento decorativo inferior */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full opacity-50"></div>
      </div>
    </div>
  );
}; 