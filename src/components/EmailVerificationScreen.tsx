import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/api';

interface EmailVerificationScreenProps {
  email: string;
  onVerificationComplete: () => void;
  onBackToLogin: () => void;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  onVerificationComplete,
  onBackToLogin
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Verificar status da verificação a cada 3 segundos
  useEffect(() => {
    const checkVerification = async () => {
      if (isVerified) return;
      
      setIsChecking(true);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user && user.email_confirmed_at) {
          setIsVerified(true);
          // Aguarda 2 segundos para mostrar a mensagem de sucesso
          setTimeout(() => {
            onVerificationComplete();
          }, 2000);
          return;
        }
      } catch (error) {
        console.log('Verificação em andamento...');
      } finally {
        setIsChecking(false);
      }
    };

    // Primeira verificação após 3 segundos
    const initialTimer = setTimeout(checkVerification, 3000);

    // Verificações subsequentes a cada 3 segundos
    const interval = setInterval(() => {
      setCheckCount(prev => prev + 1);
      checkVerification();
    }, 3000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [email, isVerified, onVerificationComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Ícone de email */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📧</span>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Verifique seu email
        </h2>

        {/* Mensagem */}
        <p className="text-gray-600 mb-6">
          Enviamos um link de verificação para:
        </p>
        
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <p className="text-blue-600 font-medium">{email}</p>
        </div>

        {/* Status da verificação */}
        <div className="mb-6">
          {isVerified ? (
            <div className="flex items-center justify-center text-green-600">
              <span className="text-lg mr-2">✅</span>
              <span className="font-medium">Email verificado com sucesso!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              <span className="font-medium">
                {isChecking ? 'Verificando...' : 'Aguardando verificação...'}
              </span>
            </div>
          )}
        </div>

        {/* Contador de tentativas */}
        {!isVerified && checkCount > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Tentativa {checkCount} de verificação
          </p>
        )}

        {/* Instruções */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-blue-900 mb-2">📋 Instruções:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Verifique sua caixa de entrada</li>
            <li>• Clique no link de verificação</li>
            <li>• Aguarde o redirecionamento automático</li>
          </ul>
        </div>

        {/* Botões */}
        <div className="space-y-3">
          {!isVerified && (
            <button
              onClick={() => {
                // Reenviar email de verificação
                supabase.auth.resend({
                  type: 'signup',
                  email: email
                });
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reenviar email
            </button>
          )}
          
          <button
            onClick={onBackToLogin}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Voltar ao login
          </button>
        </div>

        {/* Dica */}
        <p className="text-xs text-gray-500 mt-4">
          Não recebeu o email? Verifique sua pasta de spam.
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationScreen; 