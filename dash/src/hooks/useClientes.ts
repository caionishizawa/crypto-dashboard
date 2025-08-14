import { useState, useEffect } from 'react';
import type { Cliente, ClientesData } from '../types/cliente';
import { apiClient } from '../lib/api';

interface ClientesState {
  clientes: ClientesData;
  loading: boolean;
  error: string | null;
}

export const useClientes = () => {
  const [state, setState] = useState<ClientesState>({
    clientes: {},
    loading: true,
    error: null
  });

  // Carregar clientes do Supabase
  const loadClientes = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiClient.getClientes();
      
      if (response.success && response.data) {
        // Converter array para objeto com IDs como chaves
        const clientesObj: ClientesData = {};
        response.data.forEach((cliente: any) => {
          clientesObj[cliente.id] = cliente;
        });
        
        setState({
          clientes: clientesObj,
          loading: false,
          error: null
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Erro ao carregar clientes'
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao carregar clientes'
      }));
    }
  };

  // Carregar clientes ao inicializar
  useEffect(() => {
    loadClientes();
  }, []);

  const createCliente = async (clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiClient.createCliente(clienteData);
      
      if (response.success && response.data) {
      // Atualizar estado local
      setState(prev => ({
        ...prev,
        clientes: {
          ...prev.clientes,
            [response.data.id]: response.data
        },
        loading: false
      }));

        return { success: true, cliente: response.data };
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Erro ao criar cliente'
        }));
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Erro ao criar cliente' 
      }));
      return { success: false, error: error.message };
    }
  };

  const updateCliente = async (clienteId: string, clienteData: Partial<Cliente>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiClient.updateCliente(clienteId, clienteData);
      
      if (response.success && response.data) {
      // Atualizar estado local
      setState(prev => ({
        ...prev,
        clientes: {
          ...prev.clientes,
            [clienteId]: response.data
        },
        loading: false
      }));

        return { success: true, cliente: response.data };
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Erro ao atualizar cliente'
        }));
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Erro ao atualizar cliente' 
      }));
      return { success: false, error: error.message };
    }
  };

  const deleteCliente = async (clienteId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiClient.deleteCliente(clienteId);
      
      if (response.success) {
      // Remover do estado local
      const novosClientes = { ...state.clientes };
      delete novosClientes[clienteId];

      setState(prev => ({
        ...prev,
        clientes: novosClientes,
        loading: false
      }));

      return { success: true };
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Erro ao remover cliente'
        }));
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Erro ao remover cliente' 
      }));
      return { success: false, error: error.message };
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

  const refreshClientes = () => {
    loadClientes();
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
    refreshClientes,
    totalClientes: getClientesList().length,
    clientesBitcoin: getClientesByTipo('bitcoin').length,
    clientesConservador: getClientesByTipo('conservador').length
  };
}; 