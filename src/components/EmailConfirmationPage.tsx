import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

const EmailConfirmationPage: React.FC = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      try {
        // Verificar se há parâmetros de confirmação na URL
        const urlParams = new URLSearchParams(window.location.search);
        const isEmailConfirmation = urlParams.get('type') === 'signup' || 
                                   urlParams.get('type') === 'recovery' ||
                                   window.location.hash.includes('access_token');
        
        if (isEmailConfirmation) {
          console.log('🔍 Detectada confirmação de email, verificando status...');
          
          // Aguardar um pouco para o Supabase processar a confirmação
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verificar se o usuário está autenticado (indicando que a confirmação foi bem-sucedida)
          const result = await authService.getCurrentUser('');
          
          if (result.success && result.usuario) {
            console.log('🔍 Email confirmado com sucesso!');
            setIsConfirmed(true);
            setIsLoading(false);
            
            // Fazer logout após confirmar que foi bem-sucedido
            await authService.logout();
          } else {
            console.log('🔍 Confirmação não detectada ou falhou');
            setError('Não foi possível confirmar o email. Tente novamente.');
            setIsLoading(false);
          }
        } else {
          // Se não há parâmetros de confirmação, simular confirmação (para desenvolvimento)
          console.log('🔍 Sem parâmetros de confirmação, simulando...');
          setTimeout(() => {
            setIsConfirmed(true);
            setIsLoading(false);
          }, 2000);
        }
      } catch (error) {
        console.error('Erro ao verificar confirmação:', error);
        setError('Erro ao verificar a confirmação do email.');
        setIsLoading(false);
      }
    };

    checkEmailConfirmation();
  }, []);

  // Countdown para redirecionamento automático
  useEffect(() => {
    if (isConfirmed && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isConfirmed && countdown === 0) {
      // Redirecionar automaticamente após o countdown
      window.location.href = '/';
    }
  }, [isConfirmed, countdown]);

  const handleGoToLogin = async () => {
    try {
      // Redirecionar para a página principal (que mostrará o login)
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Verificando confirmação...
            </h2>
            <p className="text-gray-400">
              Aguarde um momento enquanto verificamos se seu email foi confirmado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-800 shadow-2xl text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Erro na confirmação
            </h2>
            <p className="text-gray-300 mb-6">
              {error}
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center"
            >
              <span>Voltar ao login</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-2xl text-center">
          {/* Ícone de sucesso */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-semibold text-white mb-4">
            Email confirmado!
          </h2>

          {/* Mensagem */}
          <p className="text-gray-300 mb-6">
            Sua conta foi ativada com sucesso. Agora você pode fazer login e começar a usar o sistema.
          </p>

          {/* Botão para ir ao login */}
          <button
            onClick={handleGoToLogin}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center mb-4"
          >
            <span>Ir para o login</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>

          {/* Informação adicional */}
          <p className="text-xs text-gray-400">
            Redirecionamento automático em {countdown} segundos...
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPage; 