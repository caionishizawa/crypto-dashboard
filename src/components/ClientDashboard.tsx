import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import type { Portfolio } from '../types/transacao';
import { portfolioService } from '../services/portfolioService';
import { formatarMoeda, formatarPercentual, getCorRetorno } from '../utils/formatters';

interface ClientDashboardProps {
  userId: string;
  transacoes: any[]; // Transações do cliente
  onRefresh?: () => void;
}

interface DashboardBox {
  titulo: string;
  descricao: string;
  valor: number;
  percentual?: number;
  tipo: 'base' | 'atual' | 'resultado';
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  userId,
  transacoes,
  onRefresh
}) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadPortfolio();
  }, [userId, transacoes]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Converter transações antigas para o novo formato se necessário
      const transacoesFormatadas = transacoes.map(t => ({
        id: t.id,
        userId,
        tipo: t.tipo || 'compra',
        symbol: t.symbol || 'BTC',
        name: t.name || 'Bitcoin',
        quantidade: t.quantidade || t.btcAmount || 0,
        preco: t.preco || t.btcPrice || 0,
        data: t.data,
        taxa: t.taxa || 0,
        valorTotal: t.valorTotal || t.usdValue || 0,
        fee: t.fee,
        btcAmount: t.btcAmount,
        usdValue: t.usdValue,
        btcPrice: t.btcPrice
      }));

      const portfolioData = await portfolioService.calculatePortfolio(userId, transacoesFormatadas);
      setPortfolio(portfolioData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erro ao carregar portfólio:', err);
      setError('Erro ao carregar dados do portfólio');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPortfolio();
    onRefresh?.();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-700 rounded mb-4"></div>
                <div className="h-3 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-800/20 border border-gray-600 rounded-lg p-6 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum dado disponível</h3>
            <p className="text-gray-300">
              Aguarde o administrador cadastrar suas informações de investimento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const dashboardBoxes = portfolioService.calculateDashboardBoxes(portfolio);

  const renderBox = (box: DashboardBox, index: number) => {
    const isPositive = box.tipo === 'resultado' ? box.valor >= 0 : true;
    const isNegative = box.tipo === 'resultado' ? box.valor < 0 : false;

    return (
      <div
        key={index}
        className={`bg-gradient-to-br rounded-lg p-6 border transition-all duration-300 hover:scale-105 ${
          box.tipo === 'base'
            ? 'from-blue-900/20 to-blue-800/20 border-blue-500/30'
            : box.tipo === 'atual'
            ? 'from-green-900/20 to-green-800/20 border-green-500/30'
            : isPositive
            ? 'from-emerald-900/20 to-emerald-800/20 border-emerald-500/30'
            : 'from-red-900/20 to-red-800/20 border-red-500/30'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-200">{box.titulo}</h3>
          {box.tipo === 'resultado' && (
            <div className={`p-2 rounded-full ${
              isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
          )}
        </div>

        <div className="mb-2">
          <div className={`text-3xl font-bold ${
            box.tipo === 'resultado'
              ? isPositive ? 'text-emerald-400' : 'text-red-400'
              : 'text-white'
          }`}>
            {formatarMoeda(box.valor)}
          </div>
          
          {box.percentual !== undefined && (
            <div className={`text-sm font-medium ${
              isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {isPositive ? '+' : ''}{formatarPercentual(box.percentual)}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400">{box.descricao}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard do Cliente</h1>
              <p className="text-gray-400">
                Última atualização: {lastUpdate.toLocaleString('pt-BR')}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Boxes */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.values(dashboardBoxes).map((box, index) => renderBox(box, index))}
        </div>

        {/* Assets List */}
        {portfolio.assets.length > 0 && (
          <div className="bg-gray-800/20 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Seus Ativos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.assets.map((asset) => (
                <div key={asset.symbol} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{asset.symbol}</h4>
                    <span className="text-sm text-gray-400">{asset.name}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantidade:</span>
                      <span>{asset.quantidade.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Preço Médio:</span>
                      <span>{formatarMoeda(asset.precoMedio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valor Atual:</span>
                      <span className="font-semibold">{formatarMoeda(asset.valorAtual)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
