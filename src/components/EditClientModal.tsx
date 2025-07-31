import React, { useState, useEffect } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import type { Cliente } from '../types';

interface EditClientModalProps {
  client: Cliente;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClient: Cliente) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  client,
  isOpen,
  onClose,
  onSave
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

  // Calcular valores automaticamente quando os campos principais mudam
  useEffect(() => {
    if (client.tipo === 'bitcoin') {
      // Para clientes Bitcoin
      const valorAtualBTC = formData.btcTotal * (client.valorAtualBTC || 0);
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
  }, [formData, client.tipo, client.valorAtualBTC]);

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
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-800">
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
        </form>
      </div>
    </div>
  );
}; 