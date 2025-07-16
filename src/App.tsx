import { useState, useEffect } from 'react';
import { Shield, Wifi, WifiOff } from 'lucide-react';
import type { Cliente, ClientesData } from './types/cliente';
import type { Usuario, LoginData, RegisterData } from './types/usuario';
import { clientesData } from './data/clientes';
import { usuariosIniciais } from './data/usuarios';
import { authService } from './services/authService';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { AdminPage } from './pages/AdminPage';
import { ClientPage } from './pages/ClientPage';
import { isSupabaseConfigured } from './lib/api';

function App() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [clienteVisualizando, setClienteVisualizando] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<ClientesData>(clientesData);
  const [loading, setLoading] = useState(true);

  // Verificar se há sessão salva ao carregar o app
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        // Primeiro, verificar se há sessão no localStorage
        const sessaoSalva = localStorage.getItem('dashboardUser');
        if (sessaoSalva) {
          const dadosSessao = JSON.parse(sessaoSalva);
          
          // Verificar se a sessão expirou (apenas se não foi marcado "manter conectado")
          if (!dadosSessao.manterConectado && dadosSessao.timestamp) {
            const agora = Date.now();
            const tempoExpiracao = 24 * 60 * 60 * 1000; // 24 horas
            
            if (agora - dadosSessao.timestamp > tempoExpiracao) {
              // Sessão expirou
              localStorage.removeItem('dashboardUser');
              setLoading(false);
              return;
            }
          }
          
          // Buscar usuário na lista atual de usuários
          const usuario = usuarios.find(u => u.id === dadosSessao.id || u.email === dadosSessao.email);
          if (usuario) {
            setUsuarioLogado(usuario);
          } else {
            // Se não encontrar o usuário, limpar a sessão
            localStorage.removeItem('dashboardUser');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        localStorage.removeItem('dashboardUser');
      } finally {
        setLoading(false);
      }
    };

    verificarSessao();
  }, [usuarios]);

  const handleLogin = async (dados: LoginData & { manterConectado?: boolean }) => {
    const resultado = await authService.login(dados);
    if (resultado.success && resultado.usuario) {
      setUsuarioLogado(resultado.usuario);
      
      // Salvar sessão no localStorage
      localStorage.setItem('dashboardUser', JSON.stringify({
        id: resultado.usuario.id,
        email: resultado.usuario.email,
        nome: resultado.usuario.nome,
        tipo: resultado.usuario.tipo,
        manterConectado: dados.manterConectado || false,
        timestamp: Date.now()
      }));
      
      return { success: true };
    }
    return { success: false, error: resultado.error || 'Erro ao fazer login' };
  };

  const handleRegister = async (dados: RegisterData) => {
    const resultado = await authService.register(dados);
    if (resultado.success && resultado.usuario) {
      const novosUsuarios = [...usuarios, resultado.usuario];
      setUsuarios(novosUsuarios);
      setModoRegistro(false);
      return { success: true };
    }
    return { success: false, error: resultado.error || 'Erro ao fazer cadastro' };
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setClienteVisualizando(null);
    localStorage.removeItem('dashboardUser');
  };

  const handleViewClient = (client: Cliente) => {
    setClienteVisualizando(client);
  };

  const handleBackToAdmin = () => {
    setClienteVisualizando(null);
  };

  const handleCreateClient = async (clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'>) => {
    try {
      // Gerar ID único para o cliente
      const newClientId = `cliente-${Date.now()}`;
      
      // Criar cliente completo
      const newClient: Cliente = {
        id: newClientId,
        ...clienteData,
        transacoes: [],
        carteiras: [],
        snapshots: []
      };

      // Atualizar estado local
      setClientes(prev => ({
        ...prev,
        [newClientId]: newClient
      }));

      // Aqui você pode adicionar a lógica para salvar no backend
      // await clienteService.createCliente(clienteData);

      alert('Cliente criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      alert('Erro ao criar cliente. Tente novamente.');
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, mostrar tela de autenticação
  if (!usuarioLogado) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <ModeIndicator />
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Crypto</h1>
            <p className="text-gray-400">Sistema de gestão de investimentos</p>
            
            {/* Aviso sobre o modo offline */}
            {!isSupabaseConfigured && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Funcionando em modo offline. Para usar o banco de dados, configure o Supabase.
                </p>
              </div>
            )}
          </div>

          {modoRegistro ? (
            <div>
              <RegisterForm 
                onRegister={handleRegister}
                onSwitchToLogin={() => setModoRegistro(false)}
              />
            </div>
          ) : (
            <div>
              <LoginForm 
                onLogin={handleLogin}
                onSwitchToRegister={() => setModoRegistro(true)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Se estiver logado, mostrar dashboard apropriado
  if (usuarioLogado.tipo === 'admin') {
    // Se estiver visualizando um cliente específico
    if (clienteVisualizando) {
      return (
        <div>
          <ModeIndicator />
          <ClientPage 
            client={clienteVisualizando}
            onGoBack={handleBackToAdmin}
          />
        </div>
      );
    }

    // Painel administrativo principal
    return (
      <div>
        <ModeIndicator />
        <AdminPage 
          currentUser={usuarioLogado}
          clients={clientes}
          onLogout={handleLogout}
          onViewClient={handleViewClient}
          onAddWallet={(clientId: string, walletData: any) => console.log('Adicionar carteira:', clientId, walletData)}
          onCreateSnapshot={(clientId: string) => console.log('Criar snapshot:', clientId)}
          onCreateClient={handleCreateClient}
        />
      </div>
    );
  } else {
    // Cliente logado
    const clienteData = Object.values(clientes).find((client: Cliente) => 
      client.nome.toLowerCase().includes(usuarioLogado.nome.toLowerCase()) ||
      usuarioLogado.nome.toLowerCase().includes(client.nome.toLowerCase())
    );

    if (!clienteData) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <ModeIndicator />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Dados não encontrados</h2>
            <p className="text-gray-400 mb-6">Não foi possível localizar seus dados de investimento.</p>
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Fazer novo login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <ModeIndicator />
        <ClientPage 
          client={clienteData}
          onGoBack={handleLogout}
        />
      </div>
    );
  }
}

export default App; 