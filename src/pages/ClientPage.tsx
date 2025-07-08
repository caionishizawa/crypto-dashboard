import React from 'react';
import { Bitcoin, Shield, DollarSign, TrendingUp, Settings, Plus } from 'lucide-react';
import type { Cliente, PerformanceData } from '../types';
import { formatarMoeda, formatarPercentual, getCorRetorno } from '../utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClientPageProps {
  client: Cliente;
  onGoBack: () => void;
  onAddTransaction?: () => void;
}

export const ClientPage: React.FC<ClientPageProps> = ({ 
  client, 
  onGoBack, 
  onAddTransaction 
}) => {
  if (!client) return null;

  const isTypeBitcoin = client.tipo === 'bitcoin';

  // Cálculos para Cliente Bitcoin
  const valorTotalInvestidoBTC = client.transacoes?.reduce((acc, t) => acc + t.usdValue, 0) || 0;
  const valorAtualBTCPuro = (client.btcTotal || 0) * (client.valorAtualBTC || 0);
  const valorDiferencaDeFi = (client.valorCarteiraDeFi || 0) - valorAtualBTCPuro;
  const retornoDeFi = (((client.valorCarteiraDeFi || 0) - valorTotalInvestidoBTC) / valorTotalInvestidoBTC) * 100;

  // Cálculos para Cliente Conservador
  const retornoUSDDeFi = (((client.valorAtualUSD || 0) - (client.totalDepositado || 0)) / (client.totalDepositado || 1)) * 100;

  // Dados do gráfico
  const performanceData: PerformanceData[] = isTypeBitcoin ? [
    { month: 'Jan', btcPuro: 50000, btcDeFi: 50000 },
    { month: 'Fev', btcPuro: 48000, btcDeFi: 52000 },
    { month: 'Mar', btcPuro: 55000, btcDeFi: 60000 },
    { month: 'Abr', btcPuro: 58000, btcDeFi: 68000 },
    { month: 'Mai', btcPuro: 54000, btcDeFi: 75000 },
    { month: 'Jun', btcPuro: 60000, btcDeFi: 85000 },
    { month: 'Jul', btcPuro: 65000, btcDeFi: 98000 },
    { month: 'Ago', btcPuro: 70000, btcDeFi: 112000 },
    { month: 'Set', btcPuro: 68000, btcDeFi: 125000 },
    { month: 'Out', btcPuro: 75000, btcDeFi: 145000 },
    { month: 'Nov', btcPuro: 80000, btcDeFi: 160000 },
    { month: 'Dez', btcPuro: 85000, btcDeFi: 180000 }
  ] : [
    { month: 'Jan', usdParado: 100000, usdDeFi: 100000 },
    { month: 'Fev', usdParado: 100000, usdDeFi: 101250 },
    { month: 'Mar', usdParado: 100000, usdDeFi: 102500 },
    { month: 'Abr', usdParado: 150000, usdDeFi: 153750 },
    { month: 'Mai', usdParado: 150000, usdDeFi: 155625 },
    { month: 'Jun', usdParado: 150000, usdDeFi: 157500 },
    { month: 'Jul', usdParado: 200000, usdDeFi: 211250 },
    { month: 'Ago', usdParado: 200000, usdDeFi: 213750 },
    { month: 'Set', usdParado: 200000, usdDeFi: 216250 },
    { month: 'Out', usdParado: 250000, usdDeFi: 271875 },
    { month: 'Nov', usdParado: 250000, usdDeFi: 275000 },
    { month: 'Dez', usdParado: 250000, usdDeFi: 287500 }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onGoBack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Voltar
              </button>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isTypeBitcoin ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {isTypeBitcoin ? <Bitcoin className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{client.nome}</h1>
                  <p className="text-sm text-gray-400">
                    {isTypeBitcoin ? 'Estratégia Bitcoin + DeFi' : 'Estratégia Conservadora USD'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Editar</span>
              </button>
              {onAddTransaction && (
                <button 
                  onClick={onAddTransaction}
                  className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Transação</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Cards de Comparação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isTypeBitcoin ? (
            <>
              {/* BTC Parado */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">BTC Parado</h3>
                  <Bitcoin className="w-5 h-5 text-orange-400" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Valor se deixasse parado</div>
                    <div className="text-3xl font-bold">{formatarMoeda(valorAtualBTCPuro)}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">BTC Acumulado</span>
                      <span className="font-semibold">{(client.btcTotal || 0).toFixed(4)} BTC</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Preço Médio</span>
                      <span className="font-semibold">{formatarMoeda(client.precoMedio || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BTC + DeFi */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">BTC + DeFi</h3>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Valor Atual</div>
                      <div className="text-3xl font-bold">{formatarMoeda(client.valorCarteiraDeFi || 0)}</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Retorno Total</span>
                        <span className={`font-semibold ${getCorRetorno(retornoDeFi)}`}>
                          {formatarPercentual(retornoDeFi)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Lucro Extra DeFi</span>
                        <span className="font-semibold text-green-400">
                          +{formatarMoeda(valorDiferencaDeFi)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vantagem DeFi */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Vantagem DeFi</h3>
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Lucro Extra por usar DeFi</div>
                      <div className="text-3xl font-bold text-green-400">
                        {formatarMoeda(valorDiferencaDeFi)}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Diferença Percentual</span>
                        <span className="font-semibold text-purple-400">
                          +{formatarPercentual((valorDiferencaDeFi / valorAtualBTCPuro) * 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* USD Parado */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">USD Parado</h3>
                  <DollarSign className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Valor sem rendimento</div>
                    <div className="text-3xl font-bold">{formatarMoeda(client.totalDepositado || 0)}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Retorno</span>
                      <span className="font-semibold text-gray-400">0.00%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* USD + DeFi */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">USD + DeFi</h3>
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Valor Atual</div>
                      <div className="text-3xl font-bold">{formatarMoeda(client.valorAtualUSD || 0)}</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Rendimento Total</span>
                        <span className="font-semibold text-green-400">
                          +{formatarMoeda(client.rendimentoTotal || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Retorno</span>
                        <span className={`font-semibold ${getCorRetorno(retornoUSDDeFi)}`}>
                          {formatarPercentual(retornoUSDDeFi)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rendimento DeFi */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Rendimento DeFi</h3>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-gray-400 text-xs mb-1">Lucro gerado pelo DeFi</div>
                      <div className="text-3xl font-bold text-green-400">
                        {formatarMoeda(client.rendimentoTotal || 0)}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">APY Médio</span>
                        <span className="font-semibold text-blue-400">{client.apyMedio}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Gráfico de Performance */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
          <h3 className="text-xl font-semibold mb-6">Performance ao Longo do Tempo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px' 
                  }} 
                />
                {isTypeBitcoin ? (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="btcPuro" 
                      stroke="#F59E0B" 
                      strokeWidth={3}
                      name="BTC Parado"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="btcDeFi" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="BTC + DeFi"
                    />
                  </>
                ) : (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="usdParado" 
                      stroke="#6B7280" 
                      strokeWidth={3}
                      name="USD Parado"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="usdDeFi" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="USD + DeFi"
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="text-sm text-gray-400 mb-2">Tempo no Mercado</h4>
            <p className="text-xl font-semibold">{client.tempoMercado}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="text-sm text-gray-400 mb-2">APY Médio</h4>
            <p className="text-xl font-semibold text-green-400">{client.apyMedio}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="text-sm text-gray-400 mb-2">Score de Risco</h4>
            <p className="text-xl font-semibold text-yellow-400">{client.scoreRisco}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="text-sm text-gray-400 mb-2">Carteiras Vinculadas</h4>
            <p className="text-xl font-semibold text-purple-400">{client.carteiras?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 