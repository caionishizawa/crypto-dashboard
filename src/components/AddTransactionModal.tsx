import React, { useState, useEffect } from 'react';
import { X, Search, Coins, Calendar, DollarSign, Percent } from 'lucide-react';
import type { Transacao } from '../types/transacao';
import { priceService } from '../services/priceService';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transacao: Transacao) => void;
  userId: string;
}

interface CryptoOption {
  symbol: string;
  name: string;
  price?: number;
}

const CRYPTO_OPTIONS: CryptoOption[] = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'UNI', name: 'Uniswap' },
  { symbol: 'BCH', name: 'Bitcoin Cash' },
  { symbol: 'LTC', name: 'Litecoin' }
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userId
}) => {
  const [tipo, setTipo] = useState<'compra' | 'venda'>('compra');
  const [cryptoSearch, setCryptoSearch] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [taxa, setTaxa] = useState('');
  const [loading, setLoading] = useState(false);
  const [precoAtual, setPrecoAtual] = useState<number | null>(null);
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);

  // Filtrar criptomoedas baseado na busca
  const filteredCryptos = CRYPTO_OPTIONS.filter(crypto =>
    crypto.symbol.toLowerCase().includes(cryptoSearch.toLowerCase()) ||
    crypto.name.toLowerCase().includes(cryptoSearch.toLowerCase())
  );

  // Buscar preço atual quando uma criptomoeda é selecionada
  useEffect(() => {
    if (selectedCrypto) {
      loadCurrentPrice();
    }
  }, [selectedCrypto]);

  const loadCurrentPrice = async () => {
    if (!selectedCrypto) return;
    
    try {
      setLoading(true);
      const priceData = await priceService.getPrice(selectedCrypto.symbol);
      if (priceData) {
        setPrecoAtual(priceData.price);
        setPreco(priceData.price.toString());
      }
    } catch (error) {
      console.error('Erro ao buscar preço:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoSelect = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto);
    setCryptoSearch(crypto.symbol);
    setShowCryptoDropdown(false);
  };

  const handleSave = () => {
    if (!selectedCrypto || !quantidade || !preco || !data || !hora) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const quantidadeNum = parseFloat(quantidade);
    const precoNum = parseFloat(preco);
    const taxaNum = parseFloat(taxa) || 0;
    const valorTotal = (quantidadeNum * precoNum) + taxaNum;

    const transacao: Transacao = {
      userId,
      tipo,
      symbol: selectedCrypto.symbol,
      name: selectedCrypto.name,
      quantidade: quantidadeNum,
      preco: precoNum,
      data: `${data}T${hora}:00`,
      taxa: taxaNum,
      valorTotal
    };

    onSave(transacao);
    handleClose();
  };

  const handleClose = () => {
    setTipo('compra');
    setCryptoSearch('');
    setSelectedCrypto(null);
    setQuantidade('');
    setPreco('');
    setData(new Date().toISOString().split('T')[0]);
    setHora(new Date().toTimeString().split(' ')[0].slice(0, 5));
    setTaxa('');
    setPrecoAtual(null);
    setShowCryptoDropdown(false);
    onClose();
  };

  const calcularValorTotal = () => {
    const quantidadeNum = parseFloat(quantidade) || 0;
    const precoNum = parseFloat(preco) || 0;
    const taxaNum = parseFloat(taxa) || 0;
    return (quantidadeNum * precoNum) + taxaNum;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Adicionar Transação</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Tipo de Transação */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Transação *
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setTipo('compra')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  tipo === 'compra'
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Compra
              </button>
              <button
                type="button"
                onClick={() => setTipo('venda')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  tipo === 'venda'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Venda
              </button>
            </div>
          </div>

          {/* Criptomoeda */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Coins className="w-4 h-4 inline mr-2" />
              Criptomoeda *
            </label>
            <div className="relative">
              <input
                type="text"
                value={cryptoSearch}
                onChange={(e) => {
                  setCryptoSearch(e.target.value);
                  setShowCryptoDropdown(true);
                  setSelectedCrypto(null);
                }}
                onFocus={() => setShowCryptoDropdown(true)}
                placeholder="Buscar criptomoeda..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>

            {/* Dropdown de criptomoedas */}
            {showCryptoDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg max-h-48 overflow-y-auto">
                {filteredCryptos.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => handleCryptoSelect(crypto)}
                    className="w-full px-3 py-2 text-left text-white hover:bg-gray-600 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{crypto.symbol}</div>
                      <div className="text-sm text-gray-400">{crypto.name}</div>
                    </div>
                    {crypto.price && (
                      <div className="text-sm text-green-400">
                        ${crypto.price.toFixed(2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantidade *
            </label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="0.000000"
              min="0"
              step="0.000001"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Preço */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Preço por Unidade (USD) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              {loading && (
                <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            {precoAtual && (
              <p className="text-xs text-gray-400 mt-1">
                Preço atual: ${precoAtual.toFixed(2)}
              </p>
            )}
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data *
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hora *
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Taxa */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Percent className="w-4 h-4 inline mr-2" />
              Taxa (USD)
            </label>
            <input
              type="number"
              value={taxa}
              onChange={(e) => setTaxa(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Valor Total Calculado */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Valor Total:</span>
              <span className="text-xl font-bold text-white">
                ${calcularValorTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Salvar Transação
          </button>
        </div>
      </div>
    </div>
  );
};
