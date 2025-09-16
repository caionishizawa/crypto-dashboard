import React, { useState, useEffect } from 'react';
import { Shield, Wifi, WifiOff } from 'lucide-react';
import type { Cliente, ClientesData } from './types/cliente';
import type { Usuario, LoginData, RegisterData, UsuarioAprovado } from './types/usuario';
import { authService } from './services/authService';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { AdminPage } from './pages/AdminPage';
import { ClientPage } from './pages/ClientPage';
import { UserPage } from './pages/UserPage';
import { SolicitacoesPage } from './pages/SolicitacoesPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { isSupabaseConfigured } from './lib/api';
import { useAuth } from './hooks/useAuth';
import { apiClient } from './lib/api';
import { clienteService } from './services/clienteService';
import Notification from './components/Notification';
import EmailVerificationScreen from './components/EmailVerificationScreen';
import EmailConfirmationPage from './components/EmailConfirmationPage';
import { EditClientModal } from './components/EditClientModal';

// Sistema de transição de cores
const coresPredefinidas = [
  [69, 26, 3],      // Dourado escuro
  [20, 83, 45],     // Verde escuro
  [30, 58, 138],    // Azul escuro
  [88, 28, 135],    // Roxo escuro
  [120, 53, 15],    // Laranja escuro
  [15, 23, 42],     // Azul muito escuro
];

function calcularCor(cor1: number[], cor2: number[], progresso: number): number[] {
  const ret = [];
  for (let i = 0; i < cor1.length; i++) {
    ret[i] = Math.round(cor2[i] * progresso + cor1[i] * (1 - progresso));
  }
  return ret;
}

function App() {
  const { usuario, token, loading, error, login, register, logout, isAuthenticated } = useAuth();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [clienteVisualizando, setClienteVisualizando] = useState<Cliente | null>(null);
  const [usuarioVisualizando, setUsuarioVisualizando] = useState<UsuarioAprovado | null>(null);
  const [clientes, setClientes] = useState<ClientesData>({});
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [usuariosAprovados, setUsuariosAprovados] = useState<UsuarioAprovado[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  
  // Estados para transição de cores
  const [corAtual, setCorAtual] = useState([69, 26, 3]);
  const [progresso, setProgresso] = useState(0);
  const [indiceCores, setIndiceCores] = useState(0);
  
  // Sistema de roteamento expandido para manter todas as páginas
  const [currentPage, setCurrentPage] = useState<'admin' | 'client' | 'carteiras' | 'snapshots' | 'criando-cliente' | 'editando-cliente' | 'solicitacoes' | 'user-detail'>(() => {
    // Tentar restaurar a página do sessionStorage na inicialização
    try {
      const savedPage = sessionStorage.getItem('currentPage');
      if (savedPage) {
        const pageData = JSON.parse(savedPage);

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

  // Animação de transição de cores
  useEffect(() => {
    const interval = setInterval(() => {
      setProgresso(prev => {
        const novoProgresso = prev + 0.003; // Mais lento para transição suave
        
        if (novoProgresso > 1) {
          // Próxima cor
          setIndiceCores(prev => {
            const novoIndice = (prev + 1) % coresPredefinidas.length;
            return novoIndice;
          });
          return 0;
        }
        
        return novoProgresso;
      });
    }, 30); // 30ms para transição mais suave

    return () => clearInterval(interval);
  }, []);

  // Calcular cor atual baseada no progresso entre duas cores
  const corAtualIndex = indiceCores;
  const proximaCorIndex = (indiceCores + 1) % coresPredefinidas.length;
  
  const corAtualRGB = coresPredefinidas[corAtualIndex];
  const proximaCorRGB = coresPredefinidas[proximaCorIndex];
  
  const corCalculada = calcularCor(corAtualRGB, proximaCorRGB, progresso);
  
  const backgroundStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, rgb(${corCalculada.join(',')}) 0%, rgb(${Math.round(corCalculada[0] * 0.7)}, ${Math.round(corCalculada[1] * 0.7)}, ${Math.round(corCalculada[2] * 0.7)}) 100%)`,
    minHeight: '100vh',
    position: 'relative'
  };

  // Sistema de roteamento - salvar e restaurar página atual
  useEffect(() => {
    if (isAuthenticated) {
      // Salvar página atual no sessionStorage
      const pageData = {
        currentPage,
        clienteId: savedClienteId || clienteVisualizando?.id || null,
        activeTab: activeAdminTab
      };
      
      // Salvar página atual no sessionStorage
      sessionStorage.setItem('currentPage', JSON.stringify(pageData));
      
      sessionStorage.setItem('currentPage', JSON.stringify(pageData));
    }
  }, [currentPage, clienteVisualizando, savedClienteId, activeAdminTab, isAuthenticated]);

  // Restaurar cliente visualizando quando os clientes carregarem
  useEffect(() => {
    if (isAuthenticated && !loading && !loadingClientes && Object.keys(clientes).length > 0) {
      // Se temos um cliente salvo e estamos na página de cliente
      if (currentPage === 'client' && savedClienteId) {
        const cliente = clientes[savedClienteId];

        
        if (cliente) {
          setClienteVisualizando(cliente);

        } else {

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

  // Função para carregar usuários aprovados
  const carregarUsuariosAprovados = async () => {
    if (isAuthenticated && token) {
      setLoadingUsuarios(true);
      try {
        const response = await apiClient.getUsuariosAprovados();
        if (response.success && response.data) {
          setUsuariosAprovados(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar usuários aprovados:', error);
      } finally {
        setLoadingUsuarios(false);
      }
    }
  };

  // Carregar usuários aprovados quando o usuário estiver autenticado
  useEffect(() => {
    carregarUsuariosAprovados();
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
    try {
      // Usar o novo sistema de solicitações
      const response = await apiClient.solicitarCadastro(dados.nome, dados.email, dados.senha);
      
      if (!response.success) {
        return { success: false, error: response.error || 'Erro ao enviar solicitação' };
      }
      
      // Mostrar notificação de sucesso
      setNotification({
        message: '📝 Solicitação enviada com sucesso! Aguarde a aprovação do administrador.',
        type: 'success',
        isVisible: true
      });
      
    return { success: true };
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const handleLogout = () => {
    logout();
    setClienteVisualizando(null);
    setCurrentPage('admin');
    // Limpar dados de roteamento
    sessionStorage.removeItem('currentPage');
    
    // Limpar dados do "Lembrar de mim" se não estiver marcado
    const shouldRemember = localStorage.getItem('rememberMe') === 'true';
    if (!shouldRemember) {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    }
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
    setCurrentPage('client');
    setSavedClienteId(client.id);
  };

  const handleViewUser = (usuario: UsuarioAprovado) => {
    setUsuarioVisualizando(usuario);
    setCurrentPage('user-detail');
    
    // Buscar dados do cliente se existir
    const clienteData = clientes[usuario.id];
    if (clienteData) {
      // Se já temos os dados do cliente, não precisamos fazer nada
      // Os dados serão passados automaticamente
    }
  };

  const handleBackFromUserDetail = () => {
    setUsuarioVisualizando(null);
    setCurrentPage('admin');
  };

  const handleBackToAdmin = () => {

    setClienteVisualizando(null);
    setCurrentPage('admin');
    setSavedClienteId(null);
    // Manter a aba ativa que estava sendo usada
  };

  const handleGoToSolicitacoes = () => {
    setCurrentPage('solicitacoes');
  };

  const handleAddWallet = async (usuarioId: string, walletData: any) => {
    try {
      const response = await apiClient.vincularCarteiraUsuario(usuarioId, {
        endereco: walletData.endereco,
        tipo: walletData.tipo,
        valorAtual: walletData.valorAtual,
        tokens: walletData.tokens
      });

      if (response.success) {
        setNotification({
          message: response.message || 'Carteira vinculada com sucesso!',
          type: 'success',
          isVisible: true
        });

        // Recarregar dados dos clientes para atualizar a interface
        const clientesArray = await clienteService.getClientes();
        const clientesObj: ClientesData = {};
        clientesArray.forEach((cliente: Cliente) => {
          clientesObj[cliente.id] = cliente;
        });
        setClientes(clientesObj);

        // Recarregar usuários aprovados
        const usuariosResponse = await apiClient.getUsuariosAprovados();
        if (usuariosResponse.success && usuariosResponse.data) {
          setUsuariosAprovados(usuariosResponse.data);
        }
      } else {
        setNotification({
          message: response.error || 'Erro ao vincular carteira',
          type: 'error',
          isVisible: true
        });
      }
    } catch (error) {
      console.error('Erro ao vincular carteira:', error);
      setNotification({
        message: 'Erro interno ao vincular carteira',
        type: 'error',
        isVisible: true
      });
    }
  };

  const handleEditClient = () => {
    setShowEditModal(true);
  };

  const handleSaveClient = async (updatedClient: Cliente) => {
    try {

      
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

  const handleUpdateCliente = async (clienteId: string, dados: Partial<Cliente>) => {
    try {
      if (!token) {
        alert('Usuário não autenticado');
        return;
      }

      const response = await apiClient.updateCliente(clienteId, dados);
      
      if (response.success && response.data) {
        // Atualizar estado local
        setClientes(prev => ({
          ...prev,
          [clienteId]: { ...prev[clienteId], ...response.data }
        }));

        setNotification({
          message: 'Cliente atualizado com sucesso!',
          type: 'success',
          isVisible: true
        });
      } else {
        setNotification({
          message: 'Erro ao atualizar cliente: ' + (response.error || 'Erro desconhecido'),
          type: 'error',
          isVisible: true
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      setNotification({
        message: 'Erro ao atualizar cliente. Tente novamente.',
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
    // Verificar se o usuário vem de uma confirmação de email
    const urlParams = new URLSearchParams(window.location.search);
    const isEmailConfirmation = urlParams.get('type') === 'signup' || 
                               urlParams.get('type') === 'recovery' ||
                               window.location.hash.includes('access_token');
    
    // Se vem de confirmação de email, mostrar a página de confirmação
    if (isEmailConfirmation) {
      return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-4">
          {/* Fundo animado com gradientes */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
          
          {/* Elementos decorativos de fundo */}
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Gradiente radial superior esquerdo */}
            <div className="absolute top-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-br from-green-500/25 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
            
            {/* Gradiente radial superior direito */}
            <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-bl from-blue-500/25 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Gradiente radial inferior esquerdo */}
            <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tr from-purple-500/25 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
            
            {/* Gradiente radial inferior direito */}
            <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tl from-cyan-500/25 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-3000"></div>
            
            {/* Partículas flutuantes */}
            <div className="absolute top-20 left-20 hidden lg:block w-3 h-3 bg-green-400/60 rounded-full animate-bounce shadow-lg shadow-green-400/30"></div>
            <div className="absolute top-40 right-32 w-2 h-2 bg-blue-400/70 rounded-full animate-bounce delay-1000 shadow-lg shadow-blue-400/40"></div>
            <div className="absolute bottom-32 left-40 w-2.5 h-2.5 bg-purple-400/65 rounded-full animate-bounce delay-2000 shadow-lg shadow-purple-400/35"></div>
            <div className="absolute bottom-20 right-20 w-2 h-2 bg-cyan-400/75 rounded-full animate-bounce delay-3000 shadow-lg shadow-cyan-400/45"></div>
            <div className="absolute top-1/2 left-10 w-2 h-2 bg-green-400/55 rounded-full animate-bounce delay-1500 shadow-lg shadow-green-400/25"></div>
            <div className="absolute top-1/3 right-10 w-2.5 h-2.5 bg-blue-400/60 rounded-full animate-bounce delay-2500 shadow-lg shadow-blue-400/30"></div>
          </div>
          
          {/* Overlay sutil para melhorar legibilidade */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
          
          {/* Conteúdo principal */}
          <div className="relative z-10 w-full max-w-md">
            <ModeIndicator />
            <EmailConfirmationPage />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-4">
        {/* Fundo animado com gradientes */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Gradiente radial superior esquerdo */}
          <div className="absolute top-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-br from-green-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
          
          {/* Gradiente radial superior direito */}
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Gradiente radial inferior esquerdo */}
          <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tr from-purple-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          {/* Gradiente radial inferior direito */}
          <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tl from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-3000"></div>
          
          {/* Partículas flutuantes */}
          <div className="absolute top-20 left-20 hidden lg:block w-2 h-2 bg-green-400/30 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400/40 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-purple-400/35 rounded-full animate-bounce delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-1 h-1 bg-cyan-400/45 rounded-full animate-bounce delay-3000"></div>
          <div className="absolute top-1/2 left-10 w-1 h-1 bg-green-400/25 rounded-full animate-bounce delay-1500"></div>
          <div className="absolute top-1/3 right-10 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-bounce delay-2500"></div>
        </div>
        
        {/* Overlay sutil para melhorar legibilidade */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        
        {/* Conteúdo principal */}
        <div className="relative z-10 w-full max-w-md">
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
            <div className="w-full">
            {modoRegistro ? (
              <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setModoRegistro(false)} />
            ) : (
              <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setModoRegistro(true)} />
            )}
          </div>
        )}
        </div>
      </div>
    );
  }



  // Renderizar página baseada no estado atual
  if (currentPage === 'client' && clienteVisualizando) {
    return (
      <div className="min-h-screen relative overflow-hidden text-white" style={backgroundStyle}>
        {/* Elementos decorativos para páginas logadas - tema crypto */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Gradientes radiais crypto */}
          <div className="absolute top-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-bl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tr from-blue-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tl from-purple-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-3000"></div>
          
          {/* Linhas decorativas crypto */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"></div>
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"></div>
          
          {/* Partículas crypto - ocultas em mobile */}
          <div className="absolute top-20 left-20 hidden lg:block w-3 h-3 bg-yellow-400/60 rounded-full animate-bounce shadow-lg shadow-yellow-400/30"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-green-400/70 rounded-full animate-bounce delay-1000 shadow-lg shadow-green-400/40"></div>
          <div className="absolute bottom-32 left-40 w-2.5 h-2.5 bg-blue-400/65 rounded-full animate-bounce delay-2000 shadow-lg shadow-blue-400/35"></div>
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-400/75 rounded-full animate-bounce delay-3000 shadow-lg shadow-purple-400/45"></div>
          <div className="absolute top-1/2 left-10 w-2 h-2 bg-yellow-400/55 rounded-full animate-bounce delay-1500 shadow-lg shadow-yellow-400/25"></div>
          <div className="absolute top-1/3 right-10 w-2.5 h-2.5 bg-green-400/60 rounded-full animate-bounce delay-2500 shadow-lg shadow-green-400/30"></div>
        </div>
        
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Conteúdo principal */}
        <div className="relative z-10">
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
      </div>
    );
  }

  // Renderizar página baseada no tipo de usuário
  if (usuario?.tipo === 'admin') {
    // Página de detalhes do usuário para admins
    if (currentPage === 'user-detail' && usuarioVisualizando) {
      return (
        <div className="min-h-screen relative overflow-hidden text-white" style={backgroundStyle}>
          {/* Elementos decorativos para páginas logadas - tema crypto */}
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Gradientes radiais crypto */}
            <div className="absolute top-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-bl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tr from-blue-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tl from-purple-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-3000"></div>
            
            {/* Linhas decorativas crypto */}
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
            <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"></div>
            <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"></div>
            
            {/* Partículas crypto - ocultas em mobile */}
            <div className="absolute top-20 left-20 hidden lg:block w-3 h-3 bg-yellow-400/60 rounded-full animate-bounce shadow-lg shadow-yellow-400/30"></div>
            <div className="absolute top-40 right-32 w-2 h-2 bg-green-400/70 rounded-full animate-bounce delay-1000 shadow-lg shadow-green-400/40"></div>
            <div className="absolute bottom-32 left-40 w-2.5 h-2.5 bg-blue-400/65 rounded-full animate-bounce delay-2000 shadow-lg shadow-blue-400/35"></div>
            <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-400/75 rounded-full animate-bounce delay-3000 shadow-lg shadow-purple-400/45"></div>
            <div className="absolute top-1/2 left-10 w-2 h-2 bg-yellow-400/55 rounded-full animate-bounce delay-1500 shadow-lg shadow-yellow-400/25"></div>
            <div className="absolute top-1/3 right-10 w-2.5 h-2.5 bg-green-400/60 rounded-full animate-bounce delay-2500 shadow-lg shadow-green-400/30"></div>
          </div>
          
          {/* Overlay sutil */}
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Conteúdo principal */}
          <div className="relative z-10">
            <ModeIndicator />
            <Notification
              message={notification.message}
              type={notification.type}
              isVisible={notification.isVisible}
              onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
            />
            {(() => {
              const selectedClient = clientes[usuarioVisualizando.id] ||
                Object.values(clientes).find((c: any) => c.nome === usuarioVisualizando.nome);
              return (
                <>
                  <UserDetailPage
                    usuario={usuarioVisualizando}
                    cliente={selectedClient}
                    onBack={handleBackFromUserDetail}
                    onEditClient={selectedClient ? () => setShowEditModal(true) : undefined}
                    onCreateClient={selectedClient ? undefined : async () => {
                      // cria perfil financeiro básico para este usuário
                      const novo: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'> = {
                        nome: usuarioVisualizando.nome,
                        tipo: 'bitcoin',
                        dataInicio: new Date().toISOString(),
                        investimentoInicial: 0,
                        btcTotal: 0,
                        precoMedio: 0,
                        valorAtualBTC: 0,
                        valorCarteiraDeFi: 0,
                        totalDepositado: 0,
                        valorAtualUSD: 0,
                        rendimentoTotal: 0,
                        apyMedio: 0,
                        tempoMercado: 'N/A',
                        scoreRisco: 'N/A'
                      } as any;
                      const criado = await clienteService.createCliente(novo);
                      if (criado) {
                        setClientes(prev => ({ ...prev, [criado.id]: criado }));
                        setShowEditModal(true);
                      } else {
                        setNotification({ message: 'Erro ao criar perfil financeiro', type: 'error', isVisible: true });
                      }
                    }}
                  />
                  {selectedClient && (
                    <EditClientModal
                      client={selectedClient}
                      isOpen={showEditModal}
                      onClose={() => setShowEditModal(false)}
                      onSave={handleSaveClient}
                      onDelete={handleDeleteClient}
                      isAdmin={usuario?.tipo === 'admin'}
                    />
                  )}
                </>
              );
            })()}
          </div>
        </div>
      );
    }

    // Página de solicitações para admins
    if (currentPage === 'solicitacoes') {
      return (
        <div className="min-h-screen relative overflow-hidden text-white" style={backgroundStyle}>
          {/* Elementos decorativos para páginas logadas - tema crypto */}
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Gradientes radiais crypto */}
            <div className="absolute top-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-bl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tr from-blue-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tl from-purple-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-3000"></div>
            
            {/* Linhas decorativas crypto */}
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
            <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"></div>
            <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"></div>
            
            {/* Partículas crypto - ocultas em mobile - ocultas em mobile */}
            <div className="hidden lg:block absolute top-20 left-20 hidden lg:block w-3 h-3 bg-yellow-400/60 rounded-full animate-bounce shadow-lg shadow-yellow-400/30"></div>
            <div className="hidden lg:block absolute top-40 right-32 w-2 h-2 bg-green-400/70 rounded-full animate-bounce delay-1000 shadow-lg shadow-green-400/40"></div>
            <div className="hidden lg:block absolute bottom-32 left-40 w-2.5 h-2.5 bg-blue-400/65 rounded-full animate-bounce delay-2000 shadow-lg shadow-blue-400/35"></div>
            <div className="hidden lg:block absolute bottom-20 right-20 w-2 h-2 bg-purple-400/75 rounded-full animate-bounce delay-3000 shadow-lg shadow-purple-400/45"></div>
            <div className="hidden lg:block absolute top-1/2 left-10 w-2 h-2 bg-yellow-400/55 rounded-full animate-bounce delay-1500 shadow-lg shadow-yellow-400/25"></div>
            <div className="hidden lg:block absolute top-1/3 right-10 w-2.5 h-2.5 bg-green-400/60 rounded-full animate-bounce delay-2500 shadow-lg shadow-green-400/30"></div>
          </div>
          
          {/* Overlay sutil */}
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Conteúdo principal */}
          <div className="relative z-10">
            <ModeIndicator />
            <Notification
              message={notification.message}
              type={notification.type}
              isVisible={notification.isVisible}
              onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
            />
            <SolicitacoesPage
              currentUser={usuario!}
              onLogout={handleLogout}
              onBackToAdmin={handleBackToAdmin}
            />
          </div>
        </div>
      );
    }

    // Dashboard principal (AdminPage) - Apenas para admins
  return (
      <div className="min-h-screen relative overflow-hidden text-white" style={backgroundStyle}>
        {/* Elementos decorativos para páginas logadas - tema crypto */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Gradientes radiais crypto */}
          <div className="absolute top-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-bl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tr from-blue-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tl from-purple-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-3000"></div>
          
          {/* Linhas decorativas crypto */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"></div>
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"></div>
          
          {/* Partículas crypto - ocultas em mobile */}
          <div className="absolute top-20 left-20 hidden lg:block w-3 h-3 bg-yellow-400/60 rounded-full animate-bounce shadow-lg shadow-yellow-400/30"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-green-400/70 rounded-full animate-bounce delay-1000 shadow-lg shadow-green-400/40"></div>
          <div className="absolute bottom-32 left-40 w-2.5 h-2.5 bg-blue-400/65 rounded-full animate-bounce delay-2000 shadow-lg shadow-blue-400/35"></div>
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-400/75 rounded-full animate-bounce delay-3000 shadow-lg shadow-purple-400/45"></div>
          <div className="absolute top-1/2 left-10 w-2 h-2 bg-yellow-400/55 rounded-full animate-bounce delay-1500 shadow-lg shadow-yellow-400/25"></div>
          <div className="absolute top-1/3 right-10 w-2.5 h-2.5 bg-green-400/60 rounded-full animate-bounce delay-2500 shadow-lg shadow-green-400/30"></div>
        </div>
        
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Conteúdo principal */}
        <div className="relative z-10">
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
        usuariosAprovados={usuariosAprovados}
        loadingUsuarios={loadingUsuarios}
        onLogout={handleLogout}
        onViewClient={handleViewClient}
        onViewUser={handleViewUser}
        onAddWallet={handleAddWallet}
        onCreateSnapshot={() => {}} // Implementar quando necessário
        onCreateClient={handleCreateClient}
        onUpdateCliente={handleUpdateCliente}
        activeTab={activeAdminTab}
        onTabChange={setActiveAdminTab}
        onGoToSolicitacoes={handleGoToSolicitacoes}
        onRefreshUsuarios={carregarUsuariosAprovados}
      />
        </div>
      </div>
    );
  } else {
    // Dashboard do usuário comum (UserPage) - Para usuários tipo 'cliente'
    return (
      <div className="min-h-screen relative overflow-hidden text-white" style={backgroundStyle}>
        {/* Elementos decorativos para páginas logadas - tema crypto */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Gradientes radiais crypto */}
          <div className="absolute top-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-bl from-green-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tr from-blue-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-to-tl from-purple-400/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-3000"></div>
          
          {/* Linhas decorativas crypto */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"></div>
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"></div>
          
          {/* Partículas crypto - ocultas em mobile */}
          <div className="absolute top-20 left-20 hidden lg:block w-3 h-3 bg-yellow-400/60 rounded-full animate-bounce shadow-lg shadow-yellow-400/30"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-green-400/70 rounded-full animate-bounce delay-1000 shadow-lg shadow-green-400/40"></div>
          <div className="absolute bottom-32 left-40 w-2.5 h-2.5 bg-blue-400/65 rounded-full animate-bounce delay-2000 shadow-lg shadow-blue-400/35"></div>
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-400/75 rounded-full animate-bounce delay-3000 shadow-lg shadow-purple-400/45"></div>
          <div className="absolute top-1/2 left-10 w-2 h-2 bg-yellow-400/55 rounded-full animate-bounce delay-1500 shadow-lg shadow-yellow-400/25"></div>
          <div className="absolute top-1/3 right-10 w-2.5 h-2.5 bg-green-400/60 rounded-full animate-bounce delay-2500 shadow-lg shadow-green-400/30"></div>
        </div>
        
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Conteúdo principal */}
        <div className="relative z-10">
          <ModeIndicator />
          <Notification
            message={notification.message}
            type={notification.type}
            isVisible={notification.isVisible}
            onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
          />
          <UserPage
            currentUser={usuario!}
            clients={clientes}
            onLogout={handleLogout}
            onViewClient={handleViewClient}
          />
        </div>
    </div>
  );
  }
}

export default App; 