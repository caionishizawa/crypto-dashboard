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
        // Verificar status da sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.log('Erro ao verificar sessão:', sessionError);
        }
        
        // Verificar usuário atual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.log('Erro ao verificar usuário:', userError);
        }
        
        // Verificação mais robusta
        const isEmailConfirmed = user && (
          user.email_confirmed_at || 
          (session && session.user && session.user.email_confirmed_at)
        );
        
        // Verificação adicional na tabela de usuários
        let dbUserConfirmed = false;
        if (user?.id) {
          try {
            const { data: dbUser, error: dbError } = await supabase
              .from('usuarios')
              .select('email_confirmed_at')
              .eq('id', user.id)
              .single();
            
            if (!dbError && dbUser) {
              dbUserConfirmed = !!dbUser.email_confirmed_at;
            }
          } catch (dbError) {
            console.log('Erro ao verificar usuário na tabela:', dbError);
          }
        }
        
        console.log('Status da verificação:', {
          user: user?.email,
          email_confirmed_at: user?.email_confirmed_at,
          session_user_confirmed: session?.user?.email_confirmed_at,
          db_user_confirmed: dbUserConfirmed,
          isEmailConfirmed: isEmailConfirmed || dbUserConfirmed
        });
        
        if (isEmailConfirmed || dbUserConfirmed) {
          setIsVerified(true);
          // Aguarda 2 segundos para mostrar a mensagem de sucesso
          setTimeout(() => {
            onVerificationComplete();
          }, 2000);
          return;
        }
      } catch (error) {
        console.log('Erro na verificação:', error);
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
          <h2 className="text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center">
            <span className="mr-2">Verifique seu email</span>
          </h2>

          {/* Mensagem */}
          <p className="text-gray-300 mb-6 text-center">
            Enviamos um link de verificação para:
          </p>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6">
            <p className="text-green-400 font-medium text-center">{email}</p>
          </div>

          {/* Status da verificação */}
          <div className="mb-6">
            {isVerified ? (
              <div className="flex items-center justify-center text-green-400">
                <span className="text-lg mr-2">✅</span>
                <span className="font-medium">Email verificado com sucesso!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center text-green-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 mr-2"></div>
                <span className="font-medium">
                  {isChecking ? 'Verificando...' : 'Aguardando verificação...'}
                </span>
              </div>
            )}
          </div>

          {/* Contador de tentativas */}
          {!isVerified && checkCount > 0 && (
            <p className="text-sm text-gray-400 mb-4 text-center">
              Tentativa {checkCount} de verificação
            </p>
          )}

          {/* Instruções */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-green-400 mb-2">📋 Instruções:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
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
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all transform hover:scale-105"
              >
                Reenviar email
              </button>
            )}
            
            <button
              onClick={onBackToLogin}
              className="w-full bg-gray-800 border border-gray-700 text-gray-300 py-2.5 px-4 rounded-lg hover:bg-gray-700 hover:text-white transition-all"
            >
              Voltar ao login
            </button>
          </div>

          {/* Dica */}
          <p className="text-xs text-gray-400 mt-4 text-center">
            Não recebeu o email? Verifique sua pasta de spam.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationScreen; 