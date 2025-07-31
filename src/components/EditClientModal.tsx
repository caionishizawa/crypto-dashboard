import React, { useState, useEffect } from 'react';
import { X, Save, Calculator, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import type { Cliente } from '../types';
import { cryptoService } from '../services/cryptoService';

interface EditClientModalProps {
  client: Cliente;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClient: Cliente) => void;
  onDelete?: (clientId: string) => void;
  isAdmin?: boolean;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  client,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isAdmin = false
}) => {
  const [formData, setFormData] = useState({
    btcTotal: client.btcTotal || 0,
    valorCarteiraDeFi: client.valorCarteiraDeFi || 0,
    rendimentoTotal: client.rendimentoTotal || 0
  });
  const [calculatedValues, setCalculatedValues] = useState({
    valorAtualBTC: 0,
    valorAtualUSD: 0,
    totalDepositado: 0,
    apyMedio: 0
  });
  const [currentBtcPrice, setCurrentBtcPrice] = useState(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Buscar preço atual do Bitcoin quando o modal abrir
  useEffect(() => {
    const fetchBtcPrice = async () => {
      if (client.tipo === 'bitcoin') {
        setIsLoadingPrice(true);
        try {
          const price = await cryptoService.getBitcoinPriceWithCache();
          setCurrentBtcPrice(price);
        } catch (error) {
          console.error('Erro ao buscar preço do Bitcoin:', error);
          setCurrentBtcPrice(45000); // Preço padrão
        } finally {
          setIsLoadingPrice(false);
        }
      }
    };

    fetchBtcPrice();
  }, [client.tipo]);

  // Calcular valores automaticamente quando os campos principais mudam
  useEffect(() => {
    if (client.tipo === 'bitcoin') {
      // Para clientes Bitcoin
      const valorAtualBTC = formData.btcTotal * currentBtcPrice;
      const valorAtualUSD = formData.valorCarteiraDeFi;
      const totalDepositado = valorAtualUSD - formData.rendimentoTotal;
      const apyMedio = totalDepositado > 0 ? (formData.rendimentoTotal / totalDepositado) * 100 : 0;

      setCalculatedValues({
        valorAtualBTC,
        valorAtualUSD,
        totalDepositado,
        apyMedio
      });
    } else {
      // Para clientes Conservadores
      const valorAtualUSD = formData.valorCarteiraDeFi;
      const totalDepositado = valorAtualUSD - formData.rendimentoTotal;
      const apyMedio = totalDepositado > 0 ? (formData.rendimentoTotal / totalDepositado) * 100 : 0;

      setCalculatedValues({
        valorAtualBTC: 0,
        valorAtualUSD,
        totalDepositado,
        apyMedio
      });
    }
  }, [formData, client.tipo, currentBtcPrice]);

  const handleRefreshBtcPrice = async () => {
    setIsLoadingPrice(true);
    try {
      const price = await cryptoService.getBitcoinPrice();
      setCurrentBtcPrice(price);
    } catch (error) {
      console.error('Erro ao atualizar preço do Bitcoin:', error);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedClient: Cliente = {
      ...client,
      btcTotal: formData.btcTotal,
      valorCarteiraDeFi: formData.valorCarteiraDeFi,
      rendimentoTotal: formData.rendimentoTotal,
      valorAtualBTC: calculatedValues.valorAtualBTC,
      valorAtualUSD: calculatedValues.valorAtualUSD,
      totalDepositado: calculatedValues.totalDepositado,
      apyMedio: calculatedValues.apyMedio
    };

    onSave(updatedClient);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(client.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatBTC = (value: number) => {
    return `${value.toFixed(8)} BTC`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Editar Cliente: {client.nome}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preço atual do Bitcoin */}
          {client.tipo === 'bitcoin' && (
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Preço Atual do Bitcoin</h4>
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(currentBtcPrice)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshBtcPrice}
                  disabled={isLoadingPrice}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingPrice ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* Campos Editáveis */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Campos Editáveis</h3>
            
            {client.tipo === 'bitcoin' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  BTC Total
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.btcTotal}
                  onChange={(e) => setFormData(prev => ({ ...prev, btcTotal: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="0.00000000"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor Carteira DeFi (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valorCarteiraDeFi}
                onChange={(e) => setFormData(prev => ({ ...prev, valorCarteiraDeFi: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rendimento Total (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.rendimentoTotal}
                onChange={(e) => setFormData(prev => ({ ...prev, rendimentoTotal: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Valores Calculados Automaticamente */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-medium text-white">Valores Calculados Automaticamente</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.tipo === 'bitcoin' && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Valor Atual BTC
                  </label>
                  <p className="text-lg font-semibold text-white">
                    {formatBTC(calculatedValues.valorAtualBTC)}
                  </p>
                </div>
              )}

              <div className="bg-gray-800 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Valor Atual USD
                </label>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(calculatedValues.valorAtualUSD)}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Total Depositado
                </label>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(calculatedValues.totalDepositado)}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  APY Médio
                </label>
                <p className="text-lg font-semibold text-green-400">
                  {formatPercentage(calculatedValues.apyMedio)}
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-800">
            {/* Botão de excluir (apenas para admins) */}
            {isAdmin && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Cliente</span>
              </button>
            )}
            
            {/* Botões de ação */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    {/* Modal de confirmação de exclusão */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Confirmar Exclusão</h3>
          </div>
          
          <p className="text-gray-300 mb-6">
            Tem certeza que deseja excluir o cliente <strong className="text-white">{client.nome}</strong>?
            <br />
            <span className="text-red-400 text-sm">Esta ação não pode ser desfeita.</span>
          </p>
          
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              Excluir Definitivamente
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}; 