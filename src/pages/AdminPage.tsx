import React, { useState } from 'react';
import { Users, User, LogOut, Plus, Eye, Edit, Wallet, Bitcoin, Shield, TrendingUp, UserPlus } from 'lucide-react';
import type { Cliente, ClientesData, Usuario, UsuarioAprovado, Carteira } from '../types';
import { formatarMoeda, formatarPercentual, getCorRetorno } from '../utils';
import { NovoClienteForm } from '../components/auth/NovoClienteForm';

interface AdminPageProps {
  currentUser: Usuario;
  clients: ClientesData;
  usuariosAprovados: UsuarioAprovado[];
  loadingUsuarios: boolean;
  onLogout: () => void;
  onViewClient: (client: Cliente) => void;
  onViewUser: (usuario: UsuarioAprovado) => void;
  onAddWallet: (clientId: string, walletData: Omit<Carteira, 'id'>) => void;
  onCreateSnapshot: (clientId: string) => void;
  onCreateClient: (clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'>) => void;
  activeTab?: 'clientes' | 'carteiras' | 'snapshots';
  onTabChange?: (tab: 'clientes' | 'carteiras' | 'snapshots') => void;
  onGoToSolicitacoes?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  clients,
  usuariosAprovados,
  loadingUsuarios,
  onLogout,
  onViewClient,
  onViewUser,
  onAddWallet,
  onCreateSnapshot,
  onCreateClient,
  activeTab: externalActiveTab,
  onTabChange,
  onGoToSolicitacoes
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'clientes' | 'carteiras' | 'snapshots'>(externalActiveTab || 'clientes');
  
  // Usar o tab externo se fornecido, senão usar o interno
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [selectedClientForWallet, setSelectedClientForWallet] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletType, setNewWalletType] = useState<'solana' | 'ethereum'>('solana');
  const [loading, setLoading] = useState(false);
  const [showNovoCliente, setShowNovoCliente] = useState(false);

  const handleAddWallet = async () => {
    if (!newWalletAddress || !selectedClientForWallet) return;
    
    setLoading(true);
    try {
      // Encontrar o usuário selecionado para mostrar na mensagem
      const usuarioSelecionado = usuariosAprovados.find(u => u.id === selectedClientForWallet);
      
      // Simular busca de dados da carteira
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const walletData: Omit<Carteira, 'id'> = {
        endereco: newWalletAddress,
        tipo: newWalletType,
        valorAtual: Math.random() * 10000 + 1000,
        tokens: [
          { symbol: newWalletType === 'solana' ? 'SOL' : 'ETH', balance: Math.random() * 10, valueUSD: Math.random() * 5000 }
        ],
        ultimaAtualizacao: new Date().toISOString()
      };

      onAddWallet(selectedClientForWallet, walletData);
      
      setNewWalletAddress('');
      setShowAddWallet(false);
      setSelectedClientForWallet('');
    } catch (error) {
      console.error('Erro ao adicionar carteira:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'>) => {
    await onCreateClient(clienteData);
    setShowNovoCliente(false);
  };

  return (
    <div className="min-h-screen text-white relative">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 sidebar-glass z-20">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Modo Online</span>
          </div>
          
          {/* Ícones decorativos */}
          <div className="flex space-x-3 mb-8">
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-xs">🎮</span>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-xs">📱</span>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-xs">💻</span>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-xs">🎯</span>
            </div>
          </div>
          
          <h1 className="text-xl font-bold mb-6">Painel Administrativo</h1>
          
          {/* Navegação */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('clientes')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                activeTab === 'clientes' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-black shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Clientes</span>
            </button>
            <button 
              onClick={() => setActiveTab('carteiras')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                activeTab === 'carteiras' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-black shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span>Carteiras</span>
            </button>
            <button 
              onClick={() => setActiveTab('snapshots')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                activeTab === 'snapshots' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-black shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Snapshots</span>
            </button>
          </nav>
          
          {/* Usuário logado */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-300" />
              </div>
              <span className="text-sm text-gray-300">{currentUser.nome}</span>
            </div>
            <button
              onClick={onLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="ml-64 p-8">
        {/* Header com botão de solicitações */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          </div>
          <button
            onClick={onGoToSolicitacoes}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Solicitações</span>
          </button>
        </div>

        {/* Aba Clientes */}
        {activeTab === 'clientes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Usuários Aprovados</h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  Total: {usuariosAprovados.length} usuários
                </div>
                <button 
                  onClick={() => setShowNovoCliente(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Novo Cliente</span>
                </button>
              </div>
            </div>

            {loadingUsuarios ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-400">Carregando usuários...</span>
              </div>
            ) : usuariosAprovados.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum usuário aprovado</h3>
                <p className="text-gray-500">Aprove solicitações na aba "Solicitações" para ver usuários aqui.</p>
              </div>
            ) : (
              <div className="table-styled">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Email</th>
                      <th>Tipo Usuário</th>
                      <th>Data de Registro</th>
                      <th>StatusAprovado</th>
                      <th>ID</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosAprovados.map((usuario) => {
                      const dataRegistro = new Date(usuario.dataRegistro).toLocaleDateString('pt-BR');
                      
                      return (
                        <tr key={usuario.id} className="hover:bg-gray-800/30 transition-colors">
                          <td>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-semibold">{usuario.nome}</span>
                            </div>
                          </td>
                          <td>{usuario.email}</td>
                          <td>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                              Usuário
                            </span>
                          </td>
                          <td>{dataRegistro}</td>
                          <td>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                              Aprovado
                            </span>
                          </td>
                          <td className="font-mono text-xs text-gray-400">
                            ID{usuario.id.substring(0, 8)}...
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => onViewUser(usuario)}
                                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4 text-white" />
                              </button>
                              <button
                                className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Status</span>
                          <span className="font-semibold text-green-400">Aprovado</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">ID</span>
                          <span className="font-semibold text-purple-400 text-xs">{usuario.id.substring(0, 8)}...</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onViewUser(usuario)}
                          className="flex-1 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Visualizar</span>
                        </button>
                        <button className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Aba Carteiras */}
        {activeTab === 'carteiras' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Gestão de Carteiras</h2>
              <button 
                onClick={() => setShowAddWallet(true)}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Wallet className="w-5 h-5" />
                <span>Vincular Carteira</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(clients).map((client: any) => 
                client.carteiras?.map((carteira: any) => (
                  <div key={carteira.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          carteira.tipo === 'solana' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}>
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{carteira.tipo.toUpperCase()}</h3>
                          <p className="text-sm text-gray-400">{client.nome}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onCreateSnapshot(client.id)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                      >
                        Snapshot
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Endereço:</div>
                      <div className="text-xs font-mono bg-gray-800 p-2 rounded break-all">
                        {carteira.endereco}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Valor</span>
                        <span className="font-semibold">{formatarMoeda(carteira.valorAtual || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Aba Snapshots */}
        {activeTab === 'snapshots' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Snapshots Diários</h2>
              <button 
                onClick={() => {
                  const today = new Date().toLocaleDateString('pt-BR');
                  alert(`Snapshot criado para ${today} - Dados atualizados para todos os clientes`);
                }}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Criar Snapshot Hoje</span>
              </button>
            </div>

            {/* Snapshots Recentes */}
            <div className="space-y-4">
              {/* Snapshot Hoje */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold">Snapshot - {new Date().toLocaleDateString('pt-BR')}</h3>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Hoje</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.values(clients).map((client: any) => {
                    const isTypeBitcoin = client.tipo === 'bitcoin';
                    const valorAtual = isTypeBitcoin 
                      ? client.valorCarteiraDeFi || 0
                      : client.valorAtualUSD || 0;
                    const valorInicial = isTypeBitcoin 
                      ? client.investimentoInicial * (client.transacoes?.length || 0)
                      : client.totalDepositado || 0;
                    const retorno = valorInicial > 0 ? ((valorAtual - valorInicial) / valorInicial) * 100 : 0;

                    return (
                      <div key={client.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isTypeBitcoin ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {isTypeBitcoin ? <Bitcoin className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          </div>
                          <span className="font-medium text-sm">{client.nome}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Valor</span>
                            <span className="font-semibold">{formatarMoeda(valorAtual)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Retorno</span>
                            <span className={`font-semibold ${getCorRetorno(retorno)}`}>
                              {formatarPercentual(retorno)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Carteiras</span>
                            <span className="font-semibold text-purple-400">
                              {client.carteiras?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Snapshot Ontem */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold">Snapshot - {new Date(Date.now() - 86400000).toLocaleDateString('pt-BR')}</h3>
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">Ontem</span>
                  </div>
                  <div className="text-sm text-gray-400">23:59</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.values(clients).map((client: any) => {
                    const isTypeBitcoin = client.tipo === 'bitcoin';
                    const valorOntem = isTypeBitcoin 
                      ? (client.valorCarteiraDeFi || 0) * 0.98 // Simula valor de ontem
                      : (client.valorAtualUSD || 0) * 0.995;
                    const valorInicial = isTypeBitcoin 
                      ? client.investimentoInicial * (client.transacoes?.length || 0)
                      : client.totalDepositado || 0;
                    const retornoOntem = valorInicial > 0 ? ((valorOntem - valorInicial) / valorInicial) * 100 : 0;

                    return (
                      <div key={client.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isTypeBitcoin ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {isTypeBitcoin ? <Bitcoin className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          </div>
                          <span className="font-medium text-sm">{client.nome}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Valor</span>
                            <span className="font-semibold">{formatarMoeda(valorOntem)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Retorno</span>
                            <span className={`font-semibold ${getCorRetorno(retornoOntem)}`}>
                              {formatarPercentual(retornoOntem)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Carteiras</span>
                            <span className="font-semibold text-purple-400">
                              {client.carteiras?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Snapshot Anteontem */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold">Snapshot - {new Date(Date.now() - 172800000).toLocaleDateString('pt-BR')}</h3>
                    <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">2 dias atrás</span>
                  </div>
                  <div className="text-sm text-gray-400">23:59</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.values(clients).map((client: any) => {
                    const isTypeBitcoin = client.tipo === 'bitcoin';
                    const valorAnteontem = isTypeBitcoin 
                      ? (client.valorCarteiraDeFi || 0) * 0.96 // Simula valor de anteontem
                      : (client.valorAtualUSD || 0) * 0.99;
                    const valorInicial = isTypeBitcoin 
                      ? client.investimentoInicial * (client.transacoes?.length || 0)
                      : client.totalDepositado || 0;
                    const retornoAnteontem = valorInicial > 0 ? ((valorAnteontem - valorInicial) / valorInicial) * 100 : 0;

                    return (
                      <div key={client.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isTypeBitcoin ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {isTypeBitcoin ? <Bitcoin className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          </div>
                          <span className="font-medium text-sm">{client.nome}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Valor</span>
                            <span className="font-semibold">{formatarMoeda(valorAnteontem)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Retorno</span>
                            <span className={`font-semibold ${getCorRetorno(retornoAnteontem)}`}>
                              {formatarPercentual(retornoAnteontem)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Carteiras</span>
                            <span className="font-semibold text-purple-400">
                              {client.carteiras?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumo Semanal */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span>Resumo dos Últimos 7 Dias</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.values(clients).map((client: any) => {
                    const isTypeBitcoin = client.tipo === 'bitcoin';
                    const valorAtual = isTypeBitcoin 
                      ? client.valorCarteiraDeFi || 0
                      : client.valorAtualUSD || 0;
                    const valorSemanaPassada = valorAtual * (isTypeBitcoin ? 0.92 : 0.985);
                    const variacao = ((valorAtual - valorSemanaPassada) / valorSemanaPassada) * 100;

                    return (
                      <div key={client.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isTypeBitcoin ? 'bg-orange-500' : 'bg-blue-500'
                            }`}>
                              {isTypeBitcoin ? <Bitcoin className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            </div>
                            <span className="font-semibold">{client.nome}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Valor Atual</span>
                            <span className="font-semibold">{formatarMoeda(valorAtual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Há 7 dias</span>
                            <span className="font-semibold">{formatarMoeda(valorSemanaPassada)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Variação 7d</span>
                            <span className={`font-semibold ${variacao >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {variacao >= 0 ? '+' : ''}{formatarPercentual(variacao)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Adicionar Carteira */}
        {showAddWallet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
              <h3 className="text-xl font-semibold mb-4">Vincular Carteira a Usuário</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Usuário</label>
                  <select 
                    value={selectedClientForWallet}
                    onChange={(e) => setSelectedClientForWallet(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                  >
                    <option value="">Selecione um usuário</option>
                    {usuariosAprovados.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nome} ({usuario.email})
                      </option>
                    ))}
                  </select>
                  {usuariosAprovados.length === 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      Nenhum usuário aprovado encontrado. Aprove solicitações na aba "Solicitações".
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Blockchain</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setNewWalletType('solana')}
                      className={`flex-1 py-2 px-4 rounded-lg border ${newWalletType === 'solana' ? 'bg-purple-600 border-purple-600' : 'bg-gray-800 border-gray-700'}`}
                    >
                      Solana
                    </button>
                    <button
                      onClick={() => setNewWalletType('ethereum')}
                      className={`flex-1 py-2 px-4 rounded-lg border ${newWalletType === 'ethereum' ? 'bg-blue-600 border-blue-600' : 'bg-gray-800 border-gray-700'}`}
                    >
                      Ethereum
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Endereço da Carteira</label>
                  <input
                    type="text"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                    placeholder={newWalletType === 'solana' ? 'Ex: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' : 'Ex: 0x742d35Cc6634C0532925a3b8D93B7c6dA3Bb02'}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowAddWallet(false);
                    setNewWalletAddress('');
                    setSelectedClientForWallet('');
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddWallet}
                  disabled={loading || !newWalletAddress || !selectedClientForWallet}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Vinculando...' : 'Vincular Carteira'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Novo Cliente */}
        {showNovoCliente && (
          <NovoClienteForm 
            onClose={() => setShowNovoCliente(false)}
            onSubmit={handleCreateClient}
          />
        )}
      </div>
    </div>
  );
}; 