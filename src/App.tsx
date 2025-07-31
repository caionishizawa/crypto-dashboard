import { useState, useEffect } from 'react';
import { Shield, Wifi, WifiOff } from 'lucide-react';
import type { Cliente, ClientesData } from './types/cliente';
import type { Usuario, LoginData, RegisterData } from './types/usuario';
import { authService } from './services/authService';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { AdminPage } from './pages/AdminPage';
import { ClientPage } from './pages/ClientPage';
import { isSupabaseConfigured } from './lib/api';
import { useAuth } from './hooks/useAuth';
import { apiClient } from './lib/api';
import Notification from './components/Notification';
import EmailVerificationScreen from './components/EmailVerificationScreen';
import EmailConfirmationPage from './components/EmailConfirmationPage';

function App() {
  const { usuario, token, loading, error, login, register, logout, isAuthenticated } = useAuth();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [clienteVisualizando, setClienteVisualizando] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<ClientesData>({});
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Estados para notificações e verificação de email
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Carregar clientes quando o usuário estiver autenticado
  useEffect(() => {
    const carregarClientes = async () => {
      if (isAuthenticated && token) {
        setLoadingClientes(true);
        try {
          const response = await apiClient.getClientes();
          if (response.success && response.data) {
            // Converter array para objeto com IDs como chaves
            const clientesObj: ClientesData = {};
            response.data.forEach((cliente: any) => {
              clientesObj[cliente.id] = cliente;
            });
            setClientes(clientesObj);
          }
        } catch (error) {
          console.error('Erro ao carregar clientes:', error);
        } finally {
          setLoadingClientes(false);
        }
      }
    };

    carregarClientes();
  }, [isAuthenticated, token]);

  const handleLogin = async (dados: LoginData & { manterConectado?: boolean }) => {
    const resultado = await login(dados);
    if (!resultado.success) {
      setNotification({
        message: resultado.error || 'Erro ao fazer login',
        type: 'error',
        isVisible: true
      });
      return { success: false, error: resultado.error || 'Erro ao fazer login' };
    }
    
    setNotification({
      message: 'Login realizado com sucesso!',
      type: 'success',
      isVisible: true
    });
    return { success: true };
  };

  const handleRegister = async (dados: RegisterData) => {
    const resultado = await register(dados);
    if (!resultado.success) {
      return { success: false, error: resultado.error || 'Erro ao fazer cadastro' };
    }
    
    // Se o registro foi bem-sucedido e requer confirmação de email
    if (resultado.requiresEmailConfirmation) {
      setVerificationEmail(dados.email);
      setShowEmailVerification(true);
      setNotification({
        message: 'Conta criada com sucesso! Verifique seu email para confirmar.',
        type: 'success',
        isVisible: true
      });
      return { 
        success: true, 
        requiresEmailConfirmation: true,
        message: 'Verifique seu email para confirmar sua conta.'
      };
    }
    
    // Se não requer confirmação, voltar para login
    setModoRegistro(false);
    setNotification({
      message: 'Conta criada com sucesso! Faça login para continuar.',
      type: 'success',
      isVisible: true
    });
    return { success: true };
  };

  const handleLogout = () => {
    logout();
    setClienteVisualizando(null);
  };

  // Funções para a tela de verificação de email
  const handleVerificationComplete = () => {
    setShowEmailVerification(false);
    setVerificationEmail('');
    setModoRegistro(false);
    setNotification({
      message: 'Email verificado com sucesso! Faça login para continuar.',
      type: 'success',
      isVisible: true
    });
  };

  const handleBackToLogin = () => {
    setShowEmailVerification(false);
    setVerificationEmail('');
    setModoRegistro(false);
  };

  const handleViewClient = (client: Cliente) => {
    setClienteVisualizando(client);
  };

  const handleBackToAdmin = () => {
    setClienteVisualizando(null);
  };

  const handleEditClient = () => {
    setNotification({
      message: 'Funcionalidade de edição será implementada em breve!',
      type: 'info',
      isVisible: true
    });
  };

  const handleAddTransaction = () => {
    setNotification({
      message: 'Funcionalidade de nova transação será implementada em breve!',
      type: 'info',
      isVisible: true
    });
  };

  const handleCreateClient = async (clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'>) => {
    try {
      if (!token) {
        alert('Usuário não autenticado');
        return;
      }

      const response = await apiClient.createCliente(clienteData);
      
      if (response.success && response.data) {
        // Atualizar estado local
        setClientes(prev => ({
          ...prev,
          [response.data.id]: response.data
        }));

        setNotification({
          message: 'Cliente criado com sucesso!',
          type: 'success',
          isVisible: true
        });
      } else {
        setNotification({
          message: 'Erro ao criar cliente: ' + (response.error || 'Erro desconhecido'),
          type: 'error',
          isVisible: true
        });
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      setNotification({
        message: 'Erro ao criar cliente. Tente novamente.',
        type: 'error',
        isVisible: true
      });
    }
  };

  // Componente para indicador de modo
  const ModeIndicator = () => (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
      isSupabaseConfigured 
        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    }`}>
      {isSupabaseConfigured ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Modo Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Modo Offline</span>
        </>
      )}
    </div>
  );

  // Mostrar loading enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Removido: não vamos mais redirecionar para página de confirmação
  // O email será confirmado diretamente no Supabase sem redirecionamento

  // Se não estiver autenticado, mostrar tela de login/registro ou verificação de email
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <ModeIndicator />
        
        {/* Notificação */}
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        />
        
        {/* Tela de verificação de email */}
        {showEmailVerification ? (
          <EmailVerificationScreen
            email={verificationEmail}
            onVerificationComplete={handleVerificationComplete}
            onBackToLogin={handleBackToLogin}
          />
        ) : (
          <div className="w-full max-w-md">
            {modoRegistro ? (
              <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setModoRegistro(false)} />
            ) : (
              <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setModoRegistro(true)} />
            )}
          </div>
        )}
      </div>
    );
  }

  // Se estiver visualizando um cliente específico
  if (clienteVisualizando) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ModeIndicator />
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        />
        <ClientPage 
          client={clienteVisualizando} 
          onGoBack={handleBackToAdmin}
          onAddTransaction={handleAddTransaction}
          onEditClient={handleEditClient}
        />
      </div>
    );
  }

  // Dashboard principal (AdminPage)
  return (
    <div className="min-h-screen bg-black text-white">
      <ModeIndicator />
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
      <AdminPage
        currentUser={usuario!}
        clients={clientes}
        onLogout={handleLogout}
        onViewClient={handleViewClient}
        onAddWallet={() => {}} // Implementar quando necessário
        onCreateSnapshot={() => {}} // Implementar quando necessário
        onCreateClient={handleCreateClient}
      />
    </div>
  );
}

export default App; 