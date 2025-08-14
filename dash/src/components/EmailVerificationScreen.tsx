import React, { useState } from 'react';
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
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendSuccess(false);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        console.error('Erro ao reenviar email:', error);
      } else {
        setResendSuccess(true);
        console.log('Email reenviado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-2xl">
          {/* Ícone de email */}
          <div className="mb-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
              <span className="text-2xl">📧</span>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Verifique seu email
          </h2>

          {/* Mensagem */}
          <p className="text-gray-300 mb-6 text-center">
            Enviamos um link de verificação para:
          </p>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6">
            <p className="text-green-400 font-medium text-center">{email}</p>
          </div>

          {/* Status do reenvio */}
          {resendSuccess && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm text-center">
                ✅ Email reenviado com sucesso!
              </p>
            </div>
          )}

          {/* Instruções */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-green-400 mb-2">📋 Instruções:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Verifique sua caixa de entrada</li>
              <li>• Clique no link de verificação</li>
              <li>• Você será redirecionado para a página de login</li>
              <li>• Faça login com suas credenciais</li>
            </ul>
          </div>

          {/* Informação importante */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-blue-400 mb-2">ℹ️ Importante:</h4>
            <p className="text-sm text-gray-300">
              Após clicar no link de verificação, você será redirecionado para a página de login. 
              Faça login normalmente com seu email e senha.
            </p>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all transform hover:scale-105 disabled:transform-none"
            >
              {isResending ? 'Reenviando...' : 'Reenviar email'}
            </button>
            
            <button
              onClick={onBackToLogin}
              className="w-full bg-gray-800 border border-gray-700 text-gray-300 py-2.5 px-4 rounded-lg hover:bg-gray-700 hover:text-white transition-all"
            >
              Voltar ao login
            </button>
          </div>

          {/* Dicas */}
          <div className="mt-6 space-y-2">
            <p className="text-xs text-gray-400 text-center">
              Não recebeu o email? Verifique sua pasta de spam.
            </p>
            <p className="text-xs text-gray-400 text-center">
              O link de verificação expira em 24 horas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationScreen; 