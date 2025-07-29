import React, { useState } from 'react';
import { Users, User, LogOut, Plus, Eye, Edit, Wallet, Bitcoin, Shield, TrendingUp } from 'lucide-react';
import type { Cliente, ClientesData, Usuario, Carteira } from '../types';
import { formatarMoeda, formatarPercentual, getCorRetorno } from '../utils';
import { NovoClienteForm } from '../components/auth/NovoClienteForm';

interface AdminPageProps {
  currentUser: Usuario;
  clients: ClientesData;
  onLogout: () => void;
  onViewClient: (client: Cliente) => void;
  onAddWallet: (clientId: string, walletData: Omit<Carteira, 'id'>) => void;
  onCreateSnapshot: (clientId: string) => void;
  onCreateClient: (clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'>) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  clients,
  onLogout,
  onViewClient,
  onAddWallet,
  onCreateSnapshot,
  onCreateClient
}) => {
  const [activeTab, setActiveTab] = useState<'clientes' | 'carteiras' | 'snapshots'>('clientes');
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
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          </div>
          <div className="flex items-center space-x-6">
            {/* Abas de Navegação */}
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveTab('clientes')}
                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'clientes' ? 'bg-green-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                Clientes
              </button>
              <button 
                onClick={() => setActiveTab('carteiras')}
                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'carteiras' ? 'bg-green-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                Carteiras
              </button>
              <button 
                onClick={() => setActiveTab('snapshots')}
                className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'snapshots' ? 'bg-green-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                Snapshots
              </button>
            </div>

            {/* Informações do Usuário e Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                <User className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">{currentUser.nome}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Aba Clientes */}
        {activeTab === 'clientes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Gestão de Clientes</h2>
              <button 
                onClick={() => setShowNovoCliente(true)}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Cliente</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(clients).map((client: any) => {
                const isTypeBitcoin = client.tipo === 'bitcoin';
                const valorAtual = isTypeBitcoin 
                  ? client.valorCarteiraDeFi || 0
                  : client.valorAtualUSD || 0;
                const valorInicial = isTypeBitcoin 
                  ? client.investimentoInicial * (client.transacoes?.length || 0)
                  : client.totalDepositado || 0;
                const lucro = valorAtual - valorInicial;
                const retorno = valorInicial > 0 ? ((valorAtual - valorInicial) / valorInicial) * 100 : 0;

                return (
                  <div key={client.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-800 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isTypeBitcoin ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {isTypeBitcoin ? <Bitcoin className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{client.nome}</h3>
                          <p className="text-sm text-gray-400">
                            {isTypeBitcoin ? 'Perfil Bitcoin + DeFi' : 'Perfil Conservador USD'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Valor Atual</span>
                        <span className="font-semibold">{formatarMoeda(valorAtual)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Lucro Total</span>
                        <span className={`font-semibold ${lucro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatarMoeda(Math.abs(lucro))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Retorno</span>
                        <span className={`font-semibold ${getCorRetorno(retorno)}`}>
                          {formatarPercentual(retorno)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Carteiras</span>
                        <span className="font-semibold text-purple-400">{client.carteiras?.length || 0}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onViewClient(client)}
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
              {Object.values(clients).map((client) => 
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
                  {Object.values(clients).map((client) => {
                    const isTypeBitcoin = client.tipo === 'bitcoin';
                    const valorAtual = isTypeBitcoin 
                      ? client.valorCarteiraDeFi || 0
                      : client.valorAtualUSD || 0;
                    const valorInicial = isTypeBitcoin 
                      ? client.investimentoInicial * client.transacoes.length
                      : client.totalDepositado || 0;
                    const retorno = ((valorAtual - valorInicial) / valorInicial) * 100;

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
                  {Object.values(clients).map((client) => {
                    const isTypeBitcoin = client.tipo === 'bitcoin';
                    const valorOntem = isTypeBitcoin 
                      ? (client.valorCarteiraDeFi || 0) * 0.98 // Simula valor de ontem
                      : (client.valorAtualUSD || 0) * 0.995;
                    const valorInicial = isTypeBitcoin 
                      ? client.investimentoInicial * client.transacoes.length
                      : client.totalDepositado || 0;
                    const retornoOntem = ((valorOntem - valorInicial) / valorInicial) * 100;

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
                  {Object.values(clients).map((client) => {
                    const isTypeBitcoin = client.tipo === 'bitcoin';
                    const valorAnteontem = isTypeBitcoin 
                      ? (client.valorCarteiraDeFi || 0) * 0.96 // Simula valor de anteontem
                      : (client.valorAtualUSD || 0) * 0.99;
                    const valorInicial = isTypeBitcoin 
                      ? client.investimentoInicial * client.transacoes.length
                      : client.totalDepositado || 0;
                    const retornoAnteontem = ((valorAnteontem - valorInicial) / valorInicial) * 100;

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
                  {Object.values(clients).map((client) => {
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
              <h3 className="text-xl font-semibold mb-4">Vincular Nova Carteira</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cliente</label>
                  <select 
                    value={selectedClientForWallet}
                    onChange={(e) => setSelectedClientForWallet(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                  >
                    <option value="">Selecione um cliente</option>
                    {Object.values(clients).map((client) => (
                      <option key={client.id} value={client.id}>{client.nome}</option>
                    ))}
                  </select>
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
                  {loading ? 'Adicionando...' : 'Adicionar'}
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