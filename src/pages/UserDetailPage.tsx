import React from 'react';
import { ArrowLeft, User, Mail, Calendar, Shield, Edit, Trash2, Bitcoin, TrendingUp, Wallet, DollarSign } from 'lucide-react';
import type { UsuarioAprovado } from '../types/usuario';
import type { Cliente } from '../types/cliente';
import { formatarMoeda, formatarPercentual, getCorRetorno } from '../utils';

interface UserDetailPageProps {
  usuario: UsuarioAprovado;
  cliente?: Cliente;
  onBack: () => void;
  onEdit?: (usuario: UsuarioAprovado) => void;
  onDelete?: (usuarioId: string) => void;
}

export const UserDetailPage: React.FC<UserDetailPageProps> = ({
  usuario,
  cliente,
  onBack,
  onEdit,
  onDelete
}) => {
  const dataRegistro = new Date(usuario.dataRegistro).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const dataCriacao = new Date(usuario.createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Detalhes do Usuário</h1>
              <p className="text-gray-400">Visualizando informações completas</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {onEdit && (
              <button
                onClick={() => onEdit(usuario)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(usuario.id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            )}
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Principal */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{usuario.nome}</h2>
                <p className="text-gray-400">{usuario.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <Shield className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Tipo de Usuário</p>
                  <p className="font-semibold text-green-400">Usuário Aprovado</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-semibold">{usuario.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Data de Registro</p>
                  <p className="font-semibold">{dataRegistro}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Informações Técnicas */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold mb-4">Informações Técnicas</h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400">ID do Usuário</p>
                <p className="font-mono text-sm text-purple-400 break-all">{usuario.id}</p>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400">Data de Criação</p>
                <p className="font-semibold">{dataCriacao}</p>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400">Status</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-semibold text-green-400">Ativo</span>
                </div>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400">Permissões</p>
                <p className="font-semibold text-yellow-400">Acesso ao Dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Estatísticas */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4">Estatísticas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-400">1</p>
              <p className="text-sm text-gray-400">Conta Ativa</p>
            </div>
            
            <div className="p-4 bg-gray-800/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-400">{cliente?.carteiras?.length || 0}</p>
              <p className="text-sm text-gray-400">Carteiras Vinculadas</p>
            </div>
            
            <div className="p-4 bg-gray-800/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-400">{cliente?.transacoes?.length || 0}</p>
              <p className="text-sm text-gray-400">Transações</p>
            </div>
          </div>
        </div>

        {/* Seção de Informações Financeiras - Se tiver dados de cliente */}
        {cliente && (
          <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>Informações Financeiras</span>
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card de Performance */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                  {cliente.tipo === 'bitcoin' ? (
                    <Bitcoin className="w-5 h-5 text-orange-400" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  )}
                  <span>Performance</span>
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Tipo de Perfil</span>
                    <span className="font-semibold">
                      {cliente.tipo === 'bitcoin' ? 'Bitcoin + DeFi' : 'Conservador USD'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Valor Atual</span>
                    <span className="font-semibold">
                      {formatarMoeda(cliente.tipo === 'bitcoin' ? (cliente.valorCarteiraDeFi || cliente.valorAtualUSD || 0) : (cliente.valorAtualUSD || 0))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Investimento Inicial</span>
                    <span className="font-semibold">
                      {formatarMoeda(cliente.investimentoInicial)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Lucro Total</span>
                    <span className={`font-semibold ${cliente.tipo === 'bitcoin' ? 
                      ((cliente.valorCarteiraDeFi || cliente.valorAtualUSD || 0) - cliente.investimentoInicial >= 0 ? 'text-green-400' : 'text-red-400') :
                      ((cliente.valorAtualUSD || 0) - (cliente.totalDepositado || 0) >= 0 ? 'text-green-400' : 'text-red-400')
                    }`}>
                      {formatarMoeda(Math.abs(cliente.tipo === 'bitcoin' ? 
                        (cliente.valorCarteiraDeFi || cliente.valorAtualUSD || 0) - cliente.investimentoInicial :
                        (cliente.valorAtualUSD || 0) - (cliente.totalDepositado || 0)
                      ))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Retorno</span>
                    <span className={`font-semibold ${getCorRetorno(cliente.tipo === 'bitcoin' ? 
                      ((cliente.valorCarteiraDeFi || cliente.valorAtualUSD || 0) - cliente.investimentoInicial) / cliente.investimentoInicial * 100 :
                      ((cliente.valorAtualUSD || 0) - (cliente.totalDepositado || 0)) / (cliente.totalDepositado || 1) * 100
                    )}`}>
                      {formatarPercentual(cliente.tipo === 'bitcoin' ? 
                        ((cliente.valorCarteiraDeFi || cliente.valorAtualUSD || 0) - cliente.investimentoInicial) / cliente.investimentoInicial * 100 :
                        ((cliente.valorAtualUSD || 0) - (cliente.totalDepositado || 0)) / (cliente.totalDepositado || 1) * 100
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card de Detalhes */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-purple-400" />
                  <span>Detalhes</span>
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Data de Início</span>
                    <span className="font-semibold">
                      {new Date(cliente.dataInicio).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {cliente.tipo === 'bitcoin' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">BTC Total</span>
                        <span className="font-semibold text-orange-400">
                          {(cliente.btcTotal || 0).toFixed(8)} BTC
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Preço Médio</span>
                        <span className="font-semibold">
                          {formatarMoeda(cliente.precoMedio || 0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Valor Atual BTC</span>
                        <span className="font-semibold text-orange-400">
                          {formatarMoeda(cliente.valorAtualBTC || 0)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {cliente.tipo === 'conservador' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total Depositado</span>
                        <span className="font-semibold">
                          {formatarMoeda(cliente.totalDepositado || 0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Rendimento Total</span>
                        <span className="font-semibold text-green-400">
                          {formatarMoeda(cliente.rendimentoTotal || 0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">APY Médio</span>
                        <span className="font-semibold text-blue-400">
                          {formatarPercentual(cliente.apyMedio || 0)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Tempo no Mercado</span>
                    <span className="font-semibold">
                      {cliente.tempoMercado || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Score de Risco</span>
                    <span className="font-semibold text-yellow-400">
                      {cliente.scoreRisco || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Ações */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4">Ações Disponíveis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="font-semibold">Gerenciar Permissões</p>
                  <p className="text-sm text-gray-400">Alterar nível de acesso</p>
                </div>
              </div>
            </button>

            <button className="p-4 bg-green-600/20 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <p className="font-semibold">Vincular Carteira</p>
                  <p className="text-sm text-gray-400">Adicionar carteira crypto</p>
                </div>
              </div>
            </button>

            <button className="p-4 bg-purple-600/20 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <p className="font-semibold">Ver Histórico</p>
                  <p className="text-sm text-gray-400">Acessos e atividades</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
