import React, { useState, useEffect } from 'react';
import { X, User, DollarSign, Calendar, TrendingUp, Coins, Wallet, Plus, Edit, Trash2 } from 'lucide-react';
import type { UsuarioAprovado, Cliente, Carteira } from '../types';

interface GerenciarClienteModalProps {
  onClose: () => void;
  usuariosAprovados: UsuarioAprovado[];
  onAddWallet: (clientId: string, walletData: Omit<Carteira, 'id'>) => void;
  onUpdateCliente: (clienteId: string, dados: Partial<Cliente>) => void;
}

export const GerenciarClienteModal: React.FC<GerenciarClienteModalProps> = ({ 
  onClose, 
  usuariosAprovados, 
  onAddWallet,
  onUpdateCliente 
}) => {
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioAprovado | null>(null);
  const [activeTab, setActiveTab] = useState<'perfil' | 'carteiras' | 'investimentos'>('perfil');
  const [loading, setLoading] = useState(false);

  // Estados para edição do perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState<'bitcoin' | 'conservador'>('bitcoin');
  const [investimentoInicial, setInvestimentoInicial] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [criptoPrincipal, setCriptoPrincipal] = useState('bitcoin');
  const [quantidadeTokens, setQuantidadeTokens] = useState('');
  const [scoreRisco, setScoreRisco] = useState('');

  // Estados para adicionar carteira
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletType, setNewWalletType] = useState<'solana' | 'ethereum'>('solana');

  useEffect(() => {
    if (selectedUsuario) {
      setNome(selectedUsuario.nome);
      setEmail(selectedUsuario.email);
      // Carregar outros dados do cliente se disponíveis
    }
  }, [selectedUsuario]);

  const handleSaveProfile = async () => {
    if (!selectedUsuario) return;

    setLoading(true);
    try {
      await onUpdateCliente(selectedUsuario.id, {
        nome,
        tipo,
        investimentoInicial: parseFloat(investimentoInicial),
        dataInicio,
        scoreRisco
      });

      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async () => {
    if (!selectedUsuario || !newWalletAddress) return;

    setLoading(true);
    try {
      const walletData: Omit<Carteira, 'id'> = {
        endereco: newWalletAddress,
        tipo: newWalletType,
        valorAtual: 0, // Será calculado automaticamente
        tokens: [],
        ultimaAtualizacao: new Date().toISOString()
      };

      await onAddWallet(selectedUsuario.id, walletData);
      
      setNewWalletAddress('');
      setShowAddWallet(false);
      alert('Carteira adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar carteira:', error);
      alert('Erro ao adicionar carteira. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl border border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Gerenciar Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Seletor de Usuário */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Selecionar Usuário
          </label>
          <select
            value={selectedUsuario?.id || ''}
            onChange={(e) => {
              const usuario = usuariosAprovados.find(u => u.id === e.target.value);
              setSelectedUsuario(usuario || null);
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="">Selecione um usuário</option>
            {usuariosAprovados.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nome} ({usuario.email})
              </option>
            ))}
          </select>
        </div>

        {selectedUsuario && (
          <>
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('perfil')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  activeTab === 'perfil' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Perfil
              </button>
              <button
                onClick={() => setActiveTab('carteiras')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  activeTab === 'carteiras' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4 inline mr-2" />
                Carteiras
              </button>
              <button
                onClick={() => setActiveTab('investimentos')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  activeTab === 'investimentos' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Investimentos
              </button>
            </div>

            {/* Conteúdo das Tabs */}
            {activeTab === 'perfil' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Editar Perfil</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Investimento Inicial (USD)
                    </label>
                    <input
                      type="number"
                      value={investimentoInicial}
                      onChange={(e) => setInvestimentoInicial(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Score de Risco
                    </label>
                    <select
                      value={scoreRisco}
                      onChange={(e) => setScoreRisco(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Selecione o score</option>
                      <option value="Baixo">Baixo</option>
                      <option value="Médio">Médio</option>
                      <option value="Alto">Alto</option>
                      <option value="Muito Alto">Muito Alto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Perfil de Investimento
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setTipo('bitcoin')}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                          tipo === 'bitcoin' 
                            ? 'bg-orange-500 border-orange-500 text-white' 
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        Bitcoin + DeFi
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipo('conservador')}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                          tipo === 'conservador' 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        Conservador USD
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'carteiras' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Gerenciar Carteiras</h3>
                  <button
                    onClick={() => setShowAddWallet(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Carteira</span>
                  </button>
                </div>

                {/* Lista de carteiras existentes */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-center py-8">
                    Nenhuma carteira vinculada ainda.
                  </p>
                </div>

                {/* Modal para adicionar carteira */}
                {showAddWallet && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-md font-semibold text-white mb-4">Adicionar Nova Carteira</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Tipo de Carteira
                        </label>
                        <select
                          value={newWalletType}
                          onChange={(e) => setNewWalletType(e.target.value as 'solana' | 'ethereum')}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="solana">Solana</option>
                          <option value="ethereum">Ethereum</option>
                        </select>
                      </div>

                                             <div>
                         <label className="block text-sm font-medium text-gray-300 mb-2">
                           Endereço da Carteira *
                         </label>
                         <input
                           type="text"
                           value={newWalletAddress}
                           onChange={(e) => setNewWalletAddress(e.target.value)}
                           placeholder={
                             newWalletType === 'ethereum' 
                               ? "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" 
                               : "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
                           }
                           className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                         />
                         <p className="text-xs text-gray-400 mt-1">
                           {newWalletType === 'ethereum' 
                             ? "Exemplo: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 (42 caracteres)"
                             : "Exemplo: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM (32-44 caracteres)"
                           }
                         </p>
                       </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setShowAddWallet(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleAddWallet}
                        disabled={loading || !newWalletAddress}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Adicionando...' : 'Adicionar Carteira'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'investimentos' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Configurar Investimentos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Coins className="w-4 h-4 inline mr-2" />
                      Criptomoeda Principal
                    </label>
                    <select
                      value={criptoPrincipal}
                      onChange={(e) => setCriptoPrincipal(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="bitcoin">Bitcoin (BTC)</option>
                      <option value="ethereum">Ethereum (ETH)</option>
                      <option value="solana">Solana (SOL)</option>
                      <option value="tether">USDT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantidade de Tokens
                    </label>
                    <input
                      type="number"
                      value={quantidadeTokens}
                      onChange={(e) => setQuantidadeTokens(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                      placeholder="0.5"
                      min="0"
                      step="0.000001"
                    />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-center py-8">
                    Configure os investimentos do cliente aqui.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {!selectedUsuario && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Selecione um Usuário</h3>
            <p className="text-gray-500">Escolha um usuário da lista acima para gerenciar.</p>
          </div>
        )}
      </div>
    </div>
  );
};
