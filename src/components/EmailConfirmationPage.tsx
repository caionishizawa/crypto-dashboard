import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

const EmailConfirmationPage: React.FC = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular confirmação bem-sucedida
    const timer = setTimeout(() => {
      setIsConfirmed(true);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoToLogin = () => {
    // Redirecionar para a página principal (que mostrará o login)
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Confirmando seu email...
            </h2>
            <p className="text-gray-400">
              Aguarde um momento enquanto verificamos sua conta.
            </p>
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
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center"
          >
            <span>Ir para o login</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>

          {/* Informação adicional */}
          <p className="text-xs text-gray-400 mt-4">
            Você será redirecionado automaticamente para a página de login.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPage; 