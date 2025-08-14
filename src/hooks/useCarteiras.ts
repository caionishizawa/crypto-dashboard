import { useState, useEffect } from 'react';
import type { Carteira } from '../types/carteira';

interface CarteirasState {
  carteiras: Carteira[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export const useCarteiras = (clienteId?: string) => {
  const [state, setState] = useState<CarteirasState>({
    carteiras: [],
    loading: false,
    error: null,
    refreshing: false
  });

  // Carregar carteiras do cliente
  const loadCarteiras = async (clientId?: string) => {
    if (!clientId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simular busca das carteiras
      // Na implementação real, você usaria:
      // const carteiras = await walletService.getCarteirasCliente(clientId);
      
      const mockCarteiras: Carteira[] = [
        // Exemplo de carteira
        {
          id: `carteira-${Date.now()}`,
          endereco: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          tipo: 'solana',
          valorAtual: 15000,
          tokens: [
            { symbol: 'SOL', balance: 50, valueUSD: 8000 },
            { symbol: 'USDC', balance: 7000, valueUSD: 7000 }
          ],
          ultimaAtualizacao: new Date().toISOString()
        }
      ];
      
      setState(prev => ({ 
        ...prev, 
        carteiras: mockCarteiras, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Erro ao carregar carteiras' 
      }));
    }
  };

  // Carregar carteiras quando o clienteId mudar
  useEffect(() => {
    if (clienteId) {
      loadCarteiras(clienteId);
    }
  }, [clienteId]);

  // Adicionar nova carteira
  const addCarteira = async (carteiraData: Omit<Carteira, 'id'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const novaCarteira: Carteira = {
        id: `carteira-${Date.now()}`,
        ...carteiraData
      };

      // Tentar adicionar no backend
      try {
        // await walletService.createCarteira({ ...novaCarteira, clienteId });
        console.log('Carteira criada (mock):', novaCarteira);
      } catch (backendError) {
        console.warn('Erro ao salvar carteira no backend:', backendError);
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        carteiras: [...prev.carteiras, novaCarteira],
        loading: false
      }));

      return { success: true, carteira: novaCarteira };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Erro ao adicionar carteira' 
      }));
      return { success: false, error: 'Erro ao adicionar carteira' };
    }
  };

  // Atualizar carteira
  const updateCarteira = async (carteiraId: string, carteiraData: Partial<Carteira>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Encontrar carteira existente
      const carteiraIndex = state.carteiras.findIndex(c => c.id === carteiraId);
      if (carteiraIndex === -1) {
        throw new Error('Carteira não encontrada');
      }

      const carteiraAtualizada = {
        ...state.carteiras[carteiraIndex],
        ...carteiraData,
        id: carteiraId
      };

      // Tentar atualizar no backend
      try {
        // await walletService.updateCarteira(carteiraId, carteiraData);
        console.log('Carteira atualizada (mock):', carteiraAtualizada);
      } catch (backendError) {
        console.warn('Erro ao atualizar carteira no backend:', backendError);
      }

      // Atualizar estado local
      const novasCarteiras = [...state.carteiras];
      novasCarteiras[carteiraIndex] = carteiraAtualizada;

      setState(prev => ({
        ...prev,
        carteiras: novasCarteiras,
        loading: false
      }));

      return { success: true, carteira: carteiraAtualizada };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Erro ao atualizar carteira' 
      }));
      return { success: false, error: 'Erro ao atualizar carteira' };
    }
  };

  // Remover carteira
  const removeCarteira = async (carteiraId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Verificar se carteira existe
      const carteiraExists = state.carteiras.some(c => c.id === carteiraId);
      if (!carteiraExists) {
        throw new Error('Carteira não encontrada');
      }

      // Tentar remover no backend
      try {
        // await walletService.deleteCarteira(carteiraId);
        console.log('Carteira removida (mock):', carteiraId);
      } catch (backendError) {
        console.warn('Erro ao remover carteira no backend:', backendError);
      }

      // Remover do estado local
      const novasCarteiras = state.carteiras.filter(c => c.id !== carteiraId);
      setState(prev => ({
        ...prev,
        carteiras: novasCarteiras,
        loading: false
      }));

      return { success: true };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Erro ao remover carteira' 
      }));
      return { success: false, error: 'Erro ao remover carteira' };
    }
  };

  // Atualizar dados da carteira (refresh)
  const refreshCarteira = async (carteiraId: string) => {
    try {
      setState(prev => ({ ...prev, refreshing: true, error: null }));

      // Simular atualização dos dados da carteira
      const carteiraIndex = state.carteiras.findIndex(c => c.id === carteiraId);
      if (carteiraIndex === -1) {
        throw new Error('Carteira não encontrada');
      }

      // Tentar atualizar no backend
      try {
        // await walletService.refreshCarteira(carteiraId);
        console.log('Carteira atualizada (mock):', carteiraId);
      } catch (backendError) {
        console.warn('Erro ao atualizar carteira no backend:', backendError);
      }

      // Simular novos dados
      const carteiraAtual = state.carteiras[carteiraIndex];
      if (!carteiraAtual) return;
      
      const carteiraAtualizada = {
        ...carteiraAtual,
        valorAtual: (carteiraAtual.valorAtual || 0) * (0.95 + Math.random() * 0.1), // Variação de ±5%
        tokens: (carteiraAtual.tokens || []).map(token => ({
          ...token,
          valueUSD: token.valueUSD * (0.95 + Math.random() * 0.1)
        })),
        ultimaAtualizacao: new Date().toISOString()
      };

      const novasCarteiras = [...state.carteiras];
      novasCarteiras[carteiraIndex] = carteiraAtualizada;

      setState(prev => ({
        ...prev,
        carteiras: novasCarteiras,
        refreshing: false
      }));

      return { success: true, carteira: carteiraAtualizada };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        refreshing: false, 
        error: 'Erro ao atualizar carteira' 
      }));
      return { success: false, error: 'Erro ao atualizar carteira' };
    }
  };

  // Atualizar todas as carteiras
  const refreshAllCarteiras = async () => {
    try {
      setState(prev => ({ ...prev, refreshing: true, error: null }));

      // Atualizar todas as carteiras
      const promises = state.carteiras.map(carteira => refreshCarteira(carteira.id));
      await Promise.all(promises);

      setState(prev => ({ ...prev, refreshing: false }));
      return { success: true };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        refreshing: false, 
        error: 'Erro ao atualizar carteiras' 
      }));
      return { success: false, error: 'Erro ao atualizar carteiras' };
    }
  };

  // Utilitários
  const getCarteiraById = (carteiraId: string): Carteira | null => {
    return state.carteiras.find(c => c.id === carteiraId) || null;
  };

  const getCarteirasByTipo = (tipo: 'solana' | 'ethereum'): Carteira[] => {
    return state.carteiras.filter(c => c.tipo === tipo);
  };

  const getTotalValue = (): number => {
    return state.carteiras.reduce((total, carteira) => total + (carteira.valorAtual || 0), 0);
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    carteiras: state.carteiras,
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,
    addCarteira,
    updateCarteira,
    removeCarteira,
    refreshCarteira,
    refreshAllCarteiras,
    getCarteiraById,
    getCarteirasByTipo,
    getTotalValue,
    clearError,
    totalCarteiras: state.carteiras.length,
    carteirasSolana: getCarteirasByTipo('solana').length,
    carteirasEthereum: getCarteirasByTipo('ethereum').length,
    valorTotal: getTotalValue(),
    reloadCarteiras: () => loadCarteiras(clienteId)
  };
}; 