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
import { clienteService } from './services/clienteService';
import Notification from './components/Notification';
import EmailVerificationScreen from './components/EmailVerificationScreen';
import EmailConfirmationPage from './components/EmailConfirmationPage';
import { EditClientModal } from './components/EditClientModal';

function App() {
  const { usuario, token, loading, error, login, register, logout, isAuthenticated } = useAuth();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [clienteVisualizando, setClienteVisualizando] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<ClientesData>({});
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Sistema de roteamento expandido para manter todas as páginas
  const [currentPage, setCurrentPage] = useState<'admin' | 'client' | 'carteiras' | 'snapshots' | 'criando-cliente' | 'editando-cliente'>(() => {
    // Tentar restaurar a página do sessionStorage na inicialização
    try {
      const savedPage = sessionStorage.getItem('currentPage');
      if (savedPage) {
        const pageData = JSON.parse(savedPage);
        console.log('🔍 Inicializando currentPage com:', pageData.currentPage);
        return pageData.currentPage;
      }
    } catch (error) {
      console.error('Erro ao inicializar currentPage:', error);
    }
    return 'admin';
  });

  // Estado para armazenar o ID do cliente que estava sendo visualizado
  const [savedClienteId, setSavedClienteId] = useState<string | null>(() => {
    // Tentar restaurar o ID do cliente do sessionStorage na inicialização
    try {
      const savedPage = sessionStorage.getItem('currentPage');
      if (savedPage) {
        const pageData = JSON.parse(savedPage);
        console.log('🔍 Inicializando savedClienteId com:', pageData.clienteId);
        return pageData.clienteId;
      }
    } catch (error) {
      console.error('Erro ao inicializar savedClienteId:', error);
    }
    return null;
  });

  // Estado para armazenar a aba ativa do admin
  const [activeAdminTab, setActiveAdminTab] = useState<'clientes' | 'carteiras' | 'snapshots'>(() => {
    // Tentar restaurar a aba do sessionStorage na inicialização
    try {
      const savedPage = sessionStorage.getItem('currentPage');
      if (savedPage) {
        const pageData = JSON.parse(savedPage);
        console.log('🔍 Inicializando activeAdminTab com:', pageData.activeTab);
        return pageData.activeTab || 'clientes';
      }
    } catch (error) {
      console.error('Erro ao inicializar activeAdminTab:', error);
    }
    return 'clientes';
  });
  
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
  const [showEditModal, setShowEditModal] = useState(false);

  // Sistema de roteamento - salvar e restaurar página atual
  useEffect(() => {
    if (isAuthenticated) {
      // Salvar página atual no sessionStorage
      const pageData = {
        currentPage,
        clienteId: savedClienteId || clienteVisualizando?.id || null,
        activeTab: activeAdminTab
      };
      
      // Log detalhado para debug
      const oldData = sessionStorage.getItem('currentPage');
      console.log('🔍 Salvando página:', pageData);
      console.log('🔍 Dados anteriores:', oldData ? JSON.parse(oldData) : 'null');
      
      sessionStorage.setItem('currentPage', JSON.stringify(pageData));
    }
  }, [currentPage, clienteVisualizando, savedClienteId, activeAdminTab, isAuthenticated]);

  // Restaurar cliente visualizando quando os clientes carregarem
  useEffect(() => {
    if (isAuthenticated && !loading && !loadingClientes && Object.keys(clientes).length > 0) {
      // Se temos um cliente salvo e estamos na página de cliente
      if (currentPage === 'client' && savedClienteId) {
        const cliente = clientes[savedClienteId];
        console.log('🔍 Tentando restaurar cliente:', savedClienteId);
        console.log('🔍 Cliente encontrado:', cliente);
        
        if (cliente) {
          setClienteVisualizando(cliente);
          console.log('🔍 Cliente restaurado com sucesso!');
        } else {
          console.log('🔍 Cliente não encontrado, voltando para admin');
          setCurrentPage('admin');
          setSavedClienteId(null);
        }
      }
    }
  }, [isAuthenticated, loading, loadingClientes, clientes, currentPage, savedClienteId]);

  // Restaurar aba ativa do admin
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const savedPage = sessionStorage.getItem('currentPage');
      if (savedPage) {
        try {
          const pageData = JSON.parse(savedPage);
          if (pageData.activeTab && pageData.currentPage === 'admin') {
            console.log('🔍 Restaurando aba ativa:', pageData.activeTab);
            setActiveAdminTab(pageData.activeTab);
          }
        } catch (error) {
          console.error('Erro ao restaurar aba ativa:', error);
        }
      }
    }
  }, [isAuthenticated, loading]);

  // Carregar clientes quando o usuário estiver autenticado
  useEffect(() => {
    const carregarClientes = async () => {
      if (isAuthenticated && token) {
        setLoadingClientes(true);
        try {
          const clientesArray = await clienteService.getClientes();
          // Converter array para objeto com IDs como chaves
          const clientesObj: ClientesData = {};
          clientesArray.forEach((cliente: Cliente) => {
            clientesObj[cliente.id] = cliente;
          });
          setClientes(clientesObj);
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
    setCurrentPage('admin');
    // Limpar dados de roteamento
    sessionStorage.removeItem('currentPage');
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
    console.log('🔍 === FUNÇÃO handleViewClient CHAMADA ===');
    console.log('🔍 Cliente recebido:', client);
    console.log('🔍 Navegando para cliente:', client.id, client.nome);
    console.log('🔍 Estado atual antes da navegação:', { currentPage, clienteVisualizando: clienteVisualizando?.id });
    setClienteVisualizando(client);
    setCurrentPage('client');
    setSavedClienteId(client.id);
    console.log('🔍 Estado definido para:', { currentPage: 'client', clienteId: client.id });
  };

  const handleBackToAdmin = () => {
    console.log('🔍 Voltando para admin');
    setClienteVisualizando(null);
    setCurrentPage('admin');
    setSavedClienteId(null);
    // Manter a aba ativa que estava sendo usada
  };

  const handleEditClient = () => {
    setShowEditModal(true);
  };

  const handleSaveClient = async (updatedClient: Cliente) => {
    try {
      console.log('Salvando cliente:', updatedClient);
      
      // Salvar no banco de dados
      const savedClient = await clienteService.updateCliente(updatedClient.id, updatedClient);
      
      if (!savedClient) {
        throw new Error('Falha ao salvar no banco de dados - clienteService.updateCliente retornou null');
      }

      // Atualizar no estado local
      setClientes(prev => ({
        ...prev,
        [updatedClient.id]: savedClient
      }));

      // Atualizar cliente visualizando se for o mesmo
      if (clienteVisualizando && clienteVisualizando.id === updatedClient.id) {
        setClienteVisualizando(savedClient);
      }

      setNotification({
        message: 'Cliente atualizado com sucesso!',
        type: 'success',
        isVisible: true
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      setNotification({
        message: `Erro ao atualizar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        type: 'error',
        isVisible: true
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      // Excluir do banco de dados
      const success = await clienteService.deleteCliente(clientId);
      
      if (!success) {
        throw new Error('Falha ao excluir cliente do banco de dados');
      }

      // Remover do estado local
      setClientes(prev => {
        const newClientes = { ...prev };
        delete newClientes[clientId];
        return newClientes;
      });

      // Se o cliente excluído era o que estava sendo visualizado, voltar para a lista
      if (clienteVisualizando && clienteVisualizando.id === clientId) {
        setClienteVisualizando(null);
      }

      setNotification({
        message: 'Cliente excluído com sucesso!',
        type: 'success',
        isVisible: true
      });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      setNotification({
        message: `Erro ao excluir cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        type: 'error',
        isVisible: true
      });
    }
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

  // Debug da renderização
  console.log('🔍 Renderizando página:', { 
    currentPage, 
    clienteVisualizando: clienteVisualizando?.id,
    isAuthenticated,
    loading,
    loadingClientes,
    clientesCount: Object.keys(clientes).length
  });

  // Renderizar página baseada no estado atual
  if (currentPage === 'client' && clienteVisualizando) {
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
        <EditClientModal
          client={clienteVisualizando}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveClient}
          onDelete={handleDeleteClient}
          isAdmin={usuario?.tipo === 'admin'}
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
        activeTab={activeAdminTab}
        onTabChange={setActiveAdminTab}
      />
    </div>
  );
}

export default App; 