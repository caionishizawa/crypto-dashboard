import { useState, useEffect } from 'react';
import type { Cliente, ClientesData } from '../types/cliente';
import { clientesData as initialClientesData } from '../data/clientes';

interface ClientesState {
  clientes: ClientesData;
  loading: boolean;
  error: string | null;
}

export const useClientes = () => {
  const [state, setState] = useState<ClientesState>({
    clientes: initialClientesData,
    loading: false,
    error: null
  });

  // Carregar clientes do backend (se necessário)
  useEffect(() => {
    // Por enquanto, usar dados iniciais (sem necessidade de carregar do backend)
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  const createCliente = async (clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Gerar ID único
      const newClientId = `cliente-${Date.now()}`;
      
      // Criar cliente completo
      const newClient: Cliente = {
        id: newClientId,
        ...clienteData,
        transacoes: [],
        carteiras: [],
        snapshots: []
      };

      // Tentar criar no backend primeiro
      try {
        // await clienteService.createCliente(clienteData);
        console.log('Cliente criado (mock):', newClient);
      } catch (backendError) {
        console.warn('Erro ao salvar no backend, salvando localmente:', backendError);
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        clientes: {
          ...prev.clientes,
          [newClientId]: newClient
        },
        loading: false
      }));

      return { success: true, cliente: newClient };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Erro ao criar cliente' 
      }));
      return { success: false, error: 'Erro ao criar cliente' };
    }
  };

  const updateCliente = async (clienteId: string, clienteData: Partial<Cliente>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Verificar se cliente existe
      const clienteExistente = state.clientes[clienteId];
      if (!clienteExistente) {
        throw new Error('Cliente não encontrado');
      }

      // Atualizar cliente
      const clienteAtualizado = {
        ...clienteExistente,
        ...clienteData,
        id: clienteId // Garantir que o ID não mude
      };

      // Tentar atualizar no backend
      try {
        // await clienteService.updateCliente(clienteId, clienteData);
        console.log('Cliente atualizado (mock):', clienteAtualizado);
      } catch (backendError) {
        console.warn('Erro ao atualizar no backend:', backendError);
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        clientes: {
          ...prev.clientes,
          [clienteId]: clienteAtualizado
        },
        loading: false
      }));

      return { success: true, cliente: clienteAtualizado };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Erro ao atualizar cliente' 
      }));
      return { success: false, error: 'Erro ao atualizar cliente' };
    }
  };

  const deleteCliente = async (clienteId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Verificar se cliente existe
      if (!state.clientes[clienteId]) {
        throw new Error('Cliente não encontrado');
      }

      // Tentar deletar no backend
      try {
        // await clienteService.removeCliente(clienteId);
        console.log('Cliente removido (mock):', clienteId);
      } catch (backendError) {
        console.warn('Erro ao remover no backend:', backendError);
      }

      // Remover do estado local
      const novosClientes = { ...state.clientes };
      delete novosClientes[clienteId];

      setState(prev => ({
        ...prev,
        clientes: novosClientes,
        loading: false
      }));

      return { success: true };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Erro ao remover cliente' 
      }));
      return { success: false, error: 'Erro ao remover cliente' };
    }
  };

  const getClienteById = (clienteId: string): Cliente | null => {
    return state.clientes[clienteId] || null;
  };

  const getClientesList = (): Cliente[] => {
    return Object.values(state.clientes);
  };

  const searchClientes = (query: string): Cliente[] => {
    if (!query.trim()) return getClientesList();
    
    const lowerQuery = query.toLowerCase();
    return getClientesList().filter(cliente => 
      cliente.nome.toLowerCase().includes(lowerQuery) ||
      cliente.tipo.toLowerCase().includes(lowerQuery) ||
      cliente.scoreRisco.toLowerCase().includes(lowerQuery)
    );
  };

  const getClientesByTipo = (tipo: 'bitcoin' | 'conservador'): Cliente[] => {
    return getClientesList().filter(cliente => cliente.tipo === tipo);
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    clientes: state.clientes,
    clientesList: getClientesList(),
    loading: state.loading,
    error: state.error,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    getClientesList,
    searchClientes,
    getClientesByTipo,
    clearError,
    totalClientes: getClientesList().length,
    clientesBitcoin: getClientesByTipo('bitcoin').length,
    clientesConservador: getClientesByTipo('conservador').length
  };
}; 