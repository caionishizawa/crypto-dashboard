import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface SnapshotData {
  id: string;
  data: string;
  valorTotal: number;
  variacaoPercentual: number;
}

interface CarteiraHistoricoProps {
  clienteId: string;
}

export const CarteiraHistorico: React.FC<CarteiraHistoricoProps> = ({ clienteId }) => {
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30');
  const [error, setError] = useState('');

  useEffect(() => {
    carregarHistorico();
  }, [clienteId, periodo]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/snapshots/cliente/${clienteId}/evolucao?periodo=${periodo}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar histórico');
      }
      
      const data = await response.json();
      setSnapshots(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setError('Erro ao carregar histórico de carteiras');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  const formatarVariacao = (variacao: number) => {
    const isPositive = variacao >= 0;
    const icon = isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    
    return (
      <div className={`flex items-center ${color}`}>
        {icon}
        <span className="ml-1">{variacao.toFixed(2)}%</span>
      </div>
    );
  };

  const calcularEvolucao = () => {
    if (snapshots.length < 2) return { inicio: 0, atual: 0, variacao: 0 };
    
    const primeiro = snapshots[0];
    const ultimo = snapshots[snapshots.length - 1];
    const variacao = ((ultimo.valorTotal - primeiro.valorTotal) / primeiro.valorTotal) * 100;
    
    return {
      inicio: primeiro.valorTotal,
      atual: ultimo.valorTotal,
      variacao
    };
  };

  const evolucao = calcularEvolucao();

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-800 rounded mb-4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="text-red-400 text-center">
          <p>{error}</p>
          <button 
            onClick={carregarHistorico}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="text-center text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum histórico disponível</p>
          <p className="text-sm">Os snapshots diários ainda não foram capturados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Evolução Patrimonial</h3>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-400 text-sm">Valor Inicial</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {formatarValor(evolucao.inicio)}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-gray-400 text-sm">Valor Atual</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {formatarValor(evolucao.atual)}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-gray-400 text-sm">Variação Total</span>
          </div>
          <div className="mt-1">
            {formatarVariacao(evolucao.variacao)}
          </div>
        </div>
      </div>

      {/* Gráfico Simples */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Evolução no Tempo</h4>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="space-y-3">
            {snapshots.map((snapshot, index) => (
              <div key={snapshot.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-400">
                    {formatarData(snapshot.data)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, (snapshot.valorTotal / Math.max(...snapshots.map(s => s.valorTotal))) * 100))}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {formatarValor(snapshot.valorTotal)}
                  </div>
                  {index > 0 && (
                    <div className="text-xs">
                      {formatarVariacao(snapshot.variacaoPercentual)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Histórico Detalhado</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">Data</th>
                <th className="text-right py-2 text-gray-400">Valor Total</th>
                <th className="text-right py-2 text-gray-400">Variação</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snapshot, index) => (
                <tr key={snapshot.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-2 text-gray-300">
                    {formatarData(snapshot.data)}
                  </td>
                  <td className="py-2 text-right text-white font-semibold">
                    {formatarValor(snapshot.valorTotal)}
                  </td>
                  <td className="py-2 text-right">
                    {index > 0 ? formatarVariacao(snapshot.variacaoPercentual) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
