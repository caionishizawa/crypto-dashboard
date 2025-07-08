import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import type { Cliente, ClientesData } from './types/cliente';
import type { Usuario, LoginData, RegisterData } from './types/usuario';
import type { Carteira } from './types/carteira';
import { clientesData } from './data/clientes';
import { usuariosIniciais } from './data/usuarios';
import { authService } from './services/authService';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { AdminPage } from './pages/AdminPage';
import { ClientPage } from './pages/ClientPage';

function App() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [clienteVisualizando, setClienteVisualizando] = useState<Cliente | null>(null);

  // Verificar se há sessão salva
  useEffect(() => {
    const sessaoSalva = localStorage.getItem('sessaoUsuario');
    if (sessaoSalva) {
      try {
        const dadosSessao = JSON.parse(sessaoSalva);
        const usuario = usuarios.find(u => u.id === dadosSessao.usuarioId);
        if (usuario) {
          setUsuarioLogado(usuario);
        } else {
          localStorage.removeItem('sessaoUsuario');
        }
      } catch {
        localStorage.removeItem('sessaoUsuario');
      }
    }
  }, [usuarios]);

  const handleLogin = async (dados: LoginData) => {
    const resultado = authService.login(dados);
    if (resultado.success && resultado.usuario) {
      setUsuarioLogado(resultado.usuario);
      // Salvar sessão
      localStorage.setItem('sessaoUsuario', JSON.stringify({
        usuarioId: resultado.usuario.id,
        timestamp: Date.now()
      }));
      return { success: true };
    }
    return { success: false, error: resultado.error || 'Erro ao fazer login' };
  };

  const handleRegister = async (dados: RegisterData) => {
    const resultado = authService.register(dados);
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
    localStorage.removeItem('sessaoUsuario');
  };

  const handleViewClient = (client: Cliente) => {
    setClienteVisualizando(client);
  };

  const handleBackToAdmin = () => {
    setClienteVisualizando(null);
  };

  // Se não estiver logado, mostrar tela de autenticação
  if (!usuarioLogado) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Crypto</h1>
            <p className="text-gray-400">Sistema de gestão de investimentos</p>
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
        <ClientPage 
          client={clienteVisualizando}
          onGoBack={handleBackToAdmin}
        />
      );
    }

    // Painel administrativo principal
    return (
      <AdminPage 
        currentUser={usuarioLogado}
        clients={clientesData as ClientesData}
        onLogout={handleLogout}
        onViewClient={handleViewClient}
        onAddWallet={(clientId: string, walletData: any) => console.log('Adicionar carteira:', clientId, walletData)}
        onCreateSnapshot={(clientId: string) => console.log('Criar snapshot:', clientId)}
      />
    );
  } else {
    // Cliente logado
    const clienteData = Object.values(clientesData as ClientesData).find((client: Cliente) => 
      client.nome.toLowerCase().includes(usuarioLogado.nome.toLowerCase()) ||
      usuarioLogado.nome.toLowerCase().includes(client.nome.toLowerCase())
    );

    if (!clienteData) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
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
      <ClientPage 
        client={clienteData}
        onGoBack={handleLogout}
      />
    );
  }
}

export default App; 