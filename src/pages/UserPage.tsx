import React, { useState, useEffect } from 'react';
import { Bitcoin, Shield, DollarSign, TrendingUp, LogOut, User, BarChart3, Wallet, Settings } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);

  // Buscar o cliente correspondente ao usuário logado
  const clientsArray: Cliente[] = Object.values(clients);
  const userClient = clientsArray.find((client: Cliente) => 
    client.nome === currentUser.nome
  );

  // Se não encontrar cliente específico, usar dados simulados do usuário
  const userPortfolio = userClient || {
    id: currentUser.id,
    nome: currentUser.nome,
    tipo: 'bitcoin' as const,
    dataInicio: currentUser.dataRegistro,
    valorCarteiraDeFi: 25000,
    investimentoInicial: 20000,
    apyMedio: 15.5,
    transacoes: [],
    tempoMercado: '1 ano',
    scoreRisco: 'Baixo'
  };

  const portfolioValue = userPortfolio.valorCarteiraDeFi || 0;
  const initialInvestment = userPortfolio.investimentoInicial || 0;
  const totalReturn = initialInvestment > 0 ? ((portfolioValue - initialInvestment) / initialInvestment) * 100 : 0;
  const isTypeBitcoin = userPortfolio.tipo === 'bitcoin';

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
                <h1 className="text-2xl font-bold">Meu Dashboard</h1>
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
              onClick={() => setActiveTab('portfolio')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'portfolio'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Meu Portfólio</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
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
                  <h3 className="text-lg font-semibold">Valor do Portfólio</h3>
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold">{formatarMoeda(portfolioValue)}</div>
                <p className="text-gray-400 text-sm mt-2">Valor atual da carteira</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Investimento Inicial</h3>
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold">{formatarMoeda(initialInvestment)}</div>
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

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">APY Médio</h3>
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-green-400">{userPortfolio.apyMedio}%</div>
                <p className="text-gray-400 text-sm mt-2">Rendimento anual</p>
              </div>
            </div>

            {/* Estratégia de Investimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Minha Estratégia</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isTypeBitcoin ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {isTypeBitcoin ? <Bitcoin className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {isTypeBitcoin ? 'Bitcoin + DeFi' : 'Conservador USD'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Estratégia de investimento
                    </div>
                  </div>
                </div>
                <p className="text-gray-300">
                  {isTypeBitcoin 
                    ? 'Sua carteira está focada em Bitcoin e protocolos DeFi, buscando altos retornos através de yield farming e staking.'
                    : 'Sua carteira está focada em stablecoins e estratégias conservadoras, priorizando segurança e rendimentos estáveis.'
                  }
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Performance Recente</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Últimos 30 dias</span>
                      <span className="text-green-400">+{Math.round(totalReturn * 0.3)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(totalReturn * 0.3, 100)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Últimos 7 dias</span>
                      <span className="text-blue-400">+{Math.round(totalReturn * 0.1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(totalReturn * 0.1, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Meu Portfólio</h2>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isTypeBitcoin ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {isTypeBitcoin ? <Bitcoin className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{currentUser.nome}</h3>
                    <p className="text-gray-400">
                      {isTypeBitcoin ? 'Bitcoin + DeFi' : 'Conservador USD'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor Atual</span>
                    <span className="font-semibold">{formatarMoeda(portfolioValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Investimento</span>
                    <span className="font-semibold">{formatarMoeda(initialInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Retorno</span>
                    <span className={`font-semibold ${getCorRetorno(totalReturn)}`}>
                      {formatarPercentual(totalReturn)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">APY Médio</span>
                    <span className="text-green-400">{userPortfolio.apyMedio}%</span>
                  </div>
                                     <div className="flex justify-between">
                     <span className="text-gray-400">Data de Registro</span>
                     <span className="font-semibold">{new Date(userPortfolio.dataInicio).toLocaleDateString('pt-BR')}</span>
                   </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estratégia</span>
                    <span className="font-semibold">{isTypeBitcoin ? 'Bitcoin + DeFi' : 'Conservador USD'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lucro/Prejuízo</span>
                    <span className={`font-semibold ${getCorRetorno(totalReturn)}`}>
                      {formatarMoeda(portfolioValue - initialInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email</span>
                    <span className="font-semibold">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-green-400 font-semibold">Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Configurações</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nome</label>
                    <div className="bg-gray-800 px-3 py-2 rounded-lg text-white">
                      {currentUser.nome}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <div className="bg-gray-800 px-3 py-2 rounded-lg text-white">
                      {currentUser.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Data de Registro</label>
                    <div className="bg-gray-800 px-3 py-2 rounded-lg text-white">
                      {new Date(currentUser.dataRegistro).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Configurações da Conta</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Notificações por Email</span>
                    <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                      <div className="w-6 h-6 bg-green-500 rounded-full absolute left-0 top-0 transition-transform"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Relatórios Semanais</span>
                    <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                      <div className="w-6 h-6 bg-green-500 rounded-full absolute left-0 top-0 transition-transform"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Modo Escuro</span>
                    <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                      <div className="w-6 h-6 bg-green-500 rounded-full absolute left-0 top-0 transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Segurança</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-semibold">Alterar Senha</div>
                    <div className="text-sm text-gray-400">Atualize sua senha regularmente</div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                    Alterar
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-semibold">Autenticação de Dois Fatores</div>
                    <div className="text-sm text-gray-400">Adicione uma camada extra de segurança</div>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
                    Ativar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
