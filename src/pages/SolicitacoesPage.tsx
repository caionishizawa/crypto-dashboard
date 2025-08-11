import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Clock, Eye, MessageSquare } from 'lucide-react';
import type { SolicitacaoUsuario, Usuario } from '../types';
import { apiClient } from '../lib/api';

interface SolicitacoesPageProps {
  currentUser: Usuario;
  onLogout: () => void;
  onBackToAdmin: () => void;
}

export const SolicitacoesPage: React.FC<SolicitacoesPageProps> = ({
  currentUser,
  onLogout,
  onBackToAdmin
}) => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoUsuario | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [modalAction, setModalAction] = useState<'aprovar' | 'rejeitar' | null>(null);

  // Carregar solicitações
  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  const carregarSolicitacoes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getSolicitacoes();
      if (response.success && response.data) {
        setSolicitacoes(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (solicitacao: SolicitacaoUsuario) => {
    setSelectedSolicitacao(solicitacao);
    setModalAction('aprovar');
    setObservacoes('');
    setShowModal(true);
  };

  const handleRejeitar = async (solicitacao: SolicitacaoUsuario) => {
    setSelectedSolicitacao(solicitacao);
    setModalAction('rejeitar');
    setMotivoRejeicao('');
    setObservacoes('');
    setShowModal(true);
  };

  const confirmarAcao = async (aprovado: boolean) => {
    if (!selectedSolicitacao) return;

    setProcessing(true);
    try {
      const response = await apiClient.aprovarSolicitacao(
        selectedSolicitacao.id,
        aprovado,
        aprovado ? undefined : motivoRejeicao,
        observacoes
      );

      if (response.success) {
        // Recarregar solicitações
        await carregarSolicitacoes();
        setShowModal(false);
        setSelectedSolicitacao(null);
        setModalAction(null);
        setMotivoRejeicao('');
        setObservacoes('');
      } else {
        alert('Erro ao processar solicitação: ' + response.error);
      }
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      alert('Erro ao processar solicitação');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'aprovado':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'rejeitado':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      case 'aprovado':
        return <Check className="w-4 h-4" />;
      case 'rejeitado':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'pendente');
  const solicitacoesProcessadas = solicitacoes.filter(s => s.status !== 'pendente');

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBackToAdmin}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Voltar ao Admin
              </button>
              <div className="flex items-center space-x-3">
                <UserPlus className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold">Solicitações de Usuários</h1>
                  <p className="text-gray-400">Gerencie as solicitações de cadastro</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                <span className="text-sm text-gray-300">{currentUser.nome}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Total de Solicitações</h3>
                  <UserPlus className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold">{solicitacoes.length}</div>
                <p className="text-gray-400 text-sm mt-2">Solicitações recebidas</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Pendentes</h3>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-yellow-400">{solicitacoesPendentes.length}</div>
                <p className="text-gray-400 text-sm mt-2">Aguardando aprovação</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Processadas</h3>
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400">{solicitacoesProcessadas.length}</div>
                <p className="text-gray-400 text-sm mt-2">Aprovadas/Rejeitadas</p>
              </div>
            </div>

            {/* Solicitações Pendentes */}
            {solicitacoesPendentes.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span>Solicitações Pendentes</span>
                </h2>
                <div className="space-y-4">
                  {solicitacoesPendentes.map((solicitacao) => (
                    <div key={solicitacao.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{solicitacao.nome}</h3>
                              <p className="text-gray-400 text-sm">{solicitacao.email}</p>
                            </div>
                          </div>
                          {solicitacao.observacoes && (
                            <p className="text-gray-300 text-sm mt-2">{solicitacao.observacoes}</p>
                          )}
                          <p className="text-gray-400 text-xs mt-2">
                            Solicitado em: {new Date(solicitacao.data_solicitacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAprovar(solicitacao)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>Aprovar</span>
                          </button>
                          <button
                            onClick={() => handleRejeitar(solicitacao)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <X className="w-4 h-4" />
                            <span>Rejeitar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solicitações Processadas */}
            {solicitacoesProcessadas.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <span>Histórico de Solicitações</span>
                </h2>
                <div className="space-y-4">
                  {solicitacoesProcessadas.map((solicitacao) => (
                    <div key={solicitacao.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                              <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{solicitacao.nome}</h3>
                              <p className="text-gray-400 text-sm">{solicitacao.email}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center space-x-1 ${getStatusColor(solicitacao.status)}`}>
                              {getStatusIcon(solicitacao.status)}
                              <span className="capitalize">{solicitacao.status}</span>
                            </div>
                          </div>
                          {solicitacao.observacoes && (
                            <p className="text-gray-300 text-sm mt-2">{solicitacao.observacoes}</p>
                          )}
                          {solicitacao.motivo_rejeicao && (
                            <p className="text-red-300 text-sm mt-2">
                              <strong>Motivo da rejeição:</strong> {solicitacao.motivo_rejeicao}
                            </p>
                          )}
                          <div className="flex space-x-4 text-gray-400 text-xs mt-2">
                            <span>
                              Solicitado: {new Date(solicitacao.data_solicitacao).toLocaleDateString('pt-BR')}
                            </span>
                            {solicitacao.data_aprovacao && (
                              <span>
                                Processado: {new Date(solicitacao.data_aprovacao).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem quando não há solicitações */}
            {solicitacoes.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Nenhuma solicitação</h3>
                <p className="text-gray-400">Não há solicitações de cadastro pendentes ou processadas.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      {showModal && selectedSolicitacao && modalAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {modalAction === 'aprovar' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                <strong>Nome:</strong> {selectedSolicitacao.nome}
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Email:</strong> {selectedSolicitacao.email}
              </p>
              {selectedSolicitacao.observacoes && (
                <p className="text-gray-300 mb-2">
                  <strong>Observações:</strong> {selectedSolicitacao.observacoes}
                </p>
              )}
            </div>

            {modalAction === 'aprovar' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Adicione observações sobre a aprovação..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => confirmarAcao(true)}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Aprovar</span>
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={processing}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {modalAction === 'rejeitar' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Motivo da Rejeição *
                  </label>
                  <textarea
                    value={motivoRejeicao}
                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Explique o motivo da rejeição..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Adicione observações adicionais..."
                    rows={2}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => confirmarAcao(false)}
                    disabled={processing || !motivoRejeicao.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span>Rejeitar</span>
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={processing}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
