import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign, TrendingUp, Coins } from 'lucide-react';

interface TokenData {
  symbol: string;
  balance: number;
  valueUSD: number;
  percentage: number;
}

interface CarteiraBreakdown {
  carteiraId: string;
  valor: number;
  percentage: number;
  tokens: TokenData[];
}

interface BreakdownData {
  snapshotId: string;
  data: string;
  valorTotal: number;
  breakdown: CarteiraBreakdown[];
}

interface CarteiraBreakdownProps {
  clienteId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const CarteiraBreakdown: React.FC<CarteiraBreakdownProps> = ({ clienteId }) => {
  const [breakdownData, setBreakdownData] = useState<BreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarBreakdown();
  }, [clienteId]);

  const carregarBreakdown = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/snapshots/cliente/${clienteId}/breakdown`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar breakdown');
      }
      
      const data = await response.json();
      setBreakdownData(data.data);
    } catch (error) {
      console.error('Erro ao carregar breakdown:', error);
      setError('Erro ao carregar breakdown da carteira');
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarPorcentagem = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  // Preparar dados para o gráfico de pizza
  const chartData = breakdownData?.breakdown.map((carteira, index) => ({
    name: `Carteira ${index + 1}`,
    value: carteira.valor,
    percentage: carteira.percentage,
    color: COLORS[index % COLORS.length]
  })) || [];

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-800 rounded mb-4"></div>
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
            onClick={carregarBreakdown}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!breakdownData || breakdownData.breakdown.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="text-center text-gray-400">
          <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum breakdown disponível</p>
          <p className="text-sm">Nenhum snapshot encontrado para este cliente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Breakdown por Projeto</h3>
        <div className="text-sm text-gray-400">
          {breakdownData && `Atualizado em ${formatarData(breakdownData.data)}`}
        </div>
      </div>

      {/* Resumo Total */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-green-400 mr-2" />
            <span className="text-gray-400">Valor Total da Carteira</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatarValor(breakdownData.valorTotal)}
          </div>
        </div>
      </div>

      {/* Gráfico de Pizza */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Distribuição por Carteira</h4>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatarValor(value), 'Valor']}
                    labelStyle={{ color: '#fff' }}
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Nenhum dado disponível para o gráfico
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detalhamento por Carteira */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Detalhamento por Carteira</h4>
        <div className="space-y-4">
          {breakdownData.breakdown.map((carteira, index) => (
            <div key={carteira.carteiraId} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-lg font-semibold text-white">
                  Carteira {index + 1}
                </h5>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    {formatarValor(carteira.valor)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatarPorcentagem(carteira.percentage)} do total
                  </div>
                </div>
              </div>

              {/* Tokens da carteira */}
              {carteira.tokens.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-sm font-medium text-gray-400 mb-2">Tokens:</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {carteira.tokens.map((token, tokenIndex) => (
                      <div key={tokenIndex} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[tokenIndex % COLORS.length] }}
                          ></div>
                          <span className="text-white font-medium">{token.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm">
                            {formatarValor(token.valueUSD)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatarPorcentagem(token.percentage)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-white mb-4">Estatísticas</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {breakdownData.breakdown.length}
            </div>
            <div className="text-sm text-gray-400">Carteiras Ativas</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {breakdownData.breakdown.reduce((total, carteira) => total + carteira.tokens.length, 0)}
            </div>
            <div className="text-sm text-gray-400">Tokens Diferentes</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {formatarPorcentagem(
                breakdownData.breakdown.reduce((max, carteira) => 
                  carteira.percentage > max ? carteira.percentage : max, 0
                )
              )}
            </div>
            <div className="text-sm text-gray-400">Maior Participação</div>
          </div>
        </div>
      </div>
    </div>
  );
};
