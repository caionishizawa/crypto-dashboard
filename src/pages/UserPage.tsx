import React, { useState, useEffect } from 'react';
import { Bitcoin, Shield, DollarSign, TrendingUp, LogOut, User, BarChart3 } from 'lucide-react';
import type { Cliente, ClientesData } from '../types/cliente';
import type { Usuario } from '../types/usuario';
import { formatarMoeda, formatarPercentual, getCorRetorno } from '../utils';

interface UserPageProps {
  currentUser: Usuario;
  clients: ClientesData;
  onLogout: () => void;
  onViewClient: (client: Cliente) => void;
}

export const UserPage: React.FC<UserPageProps> = ({
  currentUser,
  clients,
  onLogout,
  onViewClient
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'analytics'>('overview');
  const [loading, setLoading] = useState(false);

  // Converter para array e calcular estatísticas gerais
  const clientsArray: Cliente[] = Object.values(clients);
  const totalClients = clientsArray.length;
  
  const totalValue = clientsArray.reduce((acc: number, client: Cliente) => {
    return acc + (client.valorCarteiraDeFi || 0);
  }, 0);
  
  const totalInvestment = clientsArray.reduce((acc: number, client: Cliente) => {
    return acc + (client.investimentoInicial || 0);
  }, 0);

  const totalReturn = totalInvestment > 0 ? ((totalValue - totalInvestment) / totalInvestment) * 100 : 0;

  // Separar clientes por tipo
  const bitcoinClients = clientsArray.filter((client: Cliente) => client.tipo === 'bitcoin');
  const conservativeClients = clientsArray.filter((client: Cliente) => client.tipo === 'conservador');

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard do Usuário</h1>
                <p className="text-gray-400">Bem-vindo, {currentUser.nome}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900/30 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Visão Geral</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'clients'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Clientes ({totalClients})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Análises</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Total de Clientes</h3>
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold">{totalClients}</div>
                <p className="text-gray-400 text-sm mt-2">Clientes ativos</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Valor Total</h3>
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold">{formatarMoeda(totalValue)}</div>
                <p className="text-gray-400 text-sm mt-2">Valor atual da carteira</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Investimento Total</h3>
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold">{formatarMoeda(totalInvestment)}</div>
                <p className="text-gray-400 text-sm mt-2">Capital investido</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Retorno Total</h3>
                  <Bitcoin className="w-5 h-5 text-orange-400" />
                </div>
                <div className={`text-3xl font-bold ${getCorRetorno(totalReturn)}`}>
                  {formatarPercentual(totalReturn)}
                </div>
                <p className="text-gray-400 text-sm mt-2">Performance geral</p>
              </div>
            </div>

            {/* Distribuição por Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Distribuição por Estratégia</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span>Bitcoin + DeFi</span>
                    </div>
                    <span className="font-semibold">{bitcoinClients.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Conservador USD</span>
                    </div>
                    <span className="font-semibold">{conservativeClients.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Performance por Estratégia</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Bitcoin + DeFi</span>
                      <span className="text-green-400">+{bitcoinClients.length > 0 ? '85.2%' : '0%'}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Conservador USD</span>
                      <span className="text-blue-400">+{conservativeClients.length > 0 ? '12.8%' : '0%'}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '13%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Lista de Clientes</h2>
              <div className="text-gray-400">
                {totalClients} cliente{totalClients !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientsArray.map((client: Cliente) => {
                const isTypeBitcoin = client.tipo === 'bitcoin';
                const returnValue = (client.investimentoInicial || 0) > 0 
                  ? (((client.valorCarteiraDeFi || 0) - (client.investimentoInicial || 0)) / (client.investimentoInicial || 0)) * 100
                  : 0;

                return (
                  <div 
                    key={client.id}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={() => onViewClient(client)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isTypeBitcoin ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {isTypeBitcoin ? <Bitcoin className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{client.nome}</h3>
                          <p className="text-sm text-gray-400">
                            {isTypeBitcoin ? 'Bitcoin + DeFi' : 'Conservador USD'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valor Atual</span>
                        <span className="font-semibold">{formatarMoeda(client.valorCarteiraDeFi || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Investimento</span>
                        <span className="font-semibold">{formatarMoeda(client.investimentoInicial || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Retorno</span>
                        <span className={`font-semibold ${getCorRetorno(returnValue)}`}>
                          {formatarPercentual(returnValue)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">APY Médio</span>
                        <span className="text-green-400">{client.apyMedio}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Análises e Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Melhores Performances</h3>
                <div className="space-y-3">
                  {clientsArray
                    .sort((a: Cliente, b: Cliente) => {
                      const returnA = (a.investimentoInicial || 0) > 0 
                        ? (((a.valorCarteiraDeFi || 0) - (a.investimentoInicial || 0)) / (a.investimentoInicial || 0)) * 100
                        : 0;
                      const returnB = (b.investimentoInicial || 0) > 0 
                        ? (((b.valorCarteiraDeFi || 0) - (b.investimentoInicial || 0)) / (b.investimentoInicial || 0)) * 100
                        : 0;
                      return returnB - returnA;
                    })
                    .slice(0, 3)
                    .map((client: Cliente, index: number) => {
                      const returnValue = (client.investimentoInicial || 0) > 0 
                        ? (((client.valorCarteiraDeFi || 0) - (client.investimentoInicial || 0)) / (client.investimentoInicial || 0)) * 100
                        : 0;
                      
                      return (
                        <div key={client.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold">{client.nome}</div>
                              <div className="text-sm text-gray-400">{client.tipo}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-400">{formatarPercentual(returnValue)}</div>
                            <div className="text-sm text-gray-400">{formatarMoeda(client.valorCarteiraDeFi || 0)}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Resumo de Estratégias</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Bitcoin + DeFi</span>
                      <span className="text-orange-400">{bitcoinClients.length} clientes</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${totalClients > 0 ? (bitcoinClients.length / totalClients) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Conservador USD</span>
                      <span className="text-blue-400">{conservativeClients.length} clientes</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${totalClients > 0 ? (conservativeClients.length / totalClients) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Insights Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {totalClients > 0 ? Math.round(totalReturn) : 0}%
                  </div>
                  <div className="text-gray-400">Retorno Médio</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {totalClients > 0 ? Math.round(clientsArray.reduce((acc: number, c: Cliente) => acc + (c.apyMedio || 0), 0) / totalClients) : 0}%
                  </div>
                  <div className="text-gray-400">APY Médio</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {formatarMoeda(totalValue - totalInvestment)}
                  </div>
                  <div className="text-gray-400">Lucro Total</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
