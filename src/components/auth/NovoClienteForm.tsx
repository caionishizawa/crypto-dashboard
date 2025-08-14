import React, { useState, useEffect } from 'react';
import { X, User, DollarSign, Calendar, TrendingUp, Coins } from 'lucide-react';
import type { Cliente } from '../../types';

interface NovoClienteFormProps {
  onClose: () => void;
  onSubmit: (clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'>) => void;
}

export const NovoClienteForm: React.FC<NovoClienteFormProps> = ({ onClose, onSubmit }) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'bitcoin' | 'conservador'>('bitcoin');
  const [investimentoInicial, setInvestimentoInicial] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [criptoPrincipal, setCriptoPrincipal] = useState('bitcoin');
  const [quantidadeTokens, setQuantidadeTokens] = useState('');
  const [precoAtual, setPrecoAtual] = useState(0);
  const [valorCalculado, setValorCalculado] = useState(0);
  const [scoreRisco, setScoreRisco] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPreco, setLoadingPreco] = useState(false);

  // Função para buscar preço da criptomoeda
  const buscarPrecoCripto = async (criptoId: string) => {
    setLoadingPreco(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${criptoId}&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar preço');
      }
      
      const data = await response.json();
      const preco = data[criptoId]?.usd || 0;
      setPrecoAtual(preco);
      
      // Calcular valor total
      const quantidade = parseFloat(quantidadeTokens) || 0;
      const valorTotal = quantidade * preco;
      setValorCalculado(valorTotal);
      
    } catch (error) {
      console.error('Erro ao buscar preço:', error);
      setPrecoAtual(0);
      setValorCalculado(0);
    } finally {
      setLoadingPreco(false);
    }
  };

  // Buscar preço quando cripto ou quantidade mudar
  useEffect(() => {
    if (criptoPrincipal && quantidadeTokens) {
      buscarPrecoCripto(criptoPrincipal);
    }
  }, [criptoPrincipal, quantidadeTokens]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !investimentoInicial || !dataInicio || !criptoPrincipal || !quantidadeTokens || !scoreRisco) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    
    const clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'> = {
      nome,
      tipo,
      dataInicio,
      investimentoInicial: parseFloat(investimentoInicial),
      apyMedio: 0, // Removido - usuário iniciante não possui histórico
      tempoMercado: '', // Removido - usuário iniciante não possui histórico
      scoreRisco,
      btcTotal: tipo === 'bitcoin' ? parseFloat(quantidadeTokens) : undefined,
      precoMedio: tipo === 'bitcoin' ? precoAtual : undefined,
      valorAtualBTC: tipo === 'bitcoin' ? valorCalculado : undefined,
      valorCarteiraDeFi: tipo === 'bitcoin' ? valorCalculado : undefined,
      totalDepositado: tipo === 'conservador' ? parseFloat(investimentoInicial) : undefined,
      valorAtualUSD: tipo === 'conservador' ? parseFloat(investimentoInicial) : undefined,
      rendimentoTotal: tipo === 'conservador' ? 0 : undefined,
    };

    try {
      await onSubmit(clienteData);
      onClose();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      alert('Erro ao criar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl border border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Novo Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nome do Cliente *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              placeholder="Digite o nome do cliente"
              required
            />
          </div>

          {/* Tipo de Perfil */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Perfil de Investimento *
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setTipo('bitcoin')}
                className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                  tipo === 'bitcoin' 
                    ? 'bg-orange-500 border-orange-500 text-white' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">Bitcoin + DeFi</div>
                  <div className="text-sm opacity-75">Perfil agressivo</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTipo('conservador')}
                className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                  tipo === 'conservador' 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">Conservador USD</div>
                  <div className="text-sm opacity-75">Perfil conservador</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Investimento Inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Investimento Inicial (USD) *
              </label>
              <input
                type="number"
                value={investimentoInicial}
                onChange={(e) => setInvestimentoInicial(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                placeholder="10000"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Data de Início */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data de Início *
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
          </div>

          {/* Seletor de Criptomoeda Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Coins className="w-4 h-4 inline mr-2" />
              Criptomoeda Principal *
            </label>
            <select
              value={criptoPrincipal}
              onChange={(e) => setCriptoPrincipal(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="solana">Solana (SOL)</option>
              <option value="tether">USDT</option>
            </select>
          </div>

          {/* Quantidade de Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantidade de Tokens *
            </label>
            <input
              type="number"
              value={quantidadeTokens}
              onChange={(e) => setQuantidadeTokens(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              placeholder="0.5"
              min="0"
              step="0.000001"
              required
            />
          </div>

          {/* Display do Valor Calculado */}
          {valorCalculado > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Valor Atual:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    ${valorCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-400">
                    Preço: ${precoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                  {loadingPreco && (
                    <div className="text-xs text-yellow-400 mt-1">
                      Atualizando preço...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Score de Risco */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Score de Risco *
            </label>
            <select
              value={scoreRisco}
              onChange={(e) => setScoreRisco(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="">Selecione o score</option>
              <option value="Baixo">Baixo</option>
              <option value="Médio">Médio</option>
              <option value="Alto">Alto</option>
              <option value="Muito Alto">Muito Alto</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 