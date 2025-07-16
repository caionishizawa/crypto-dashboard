import type { Cliente, Transacao } from '../types';
import { apiClient } from '../lib/api';

class ClienteService {
  
  // Criar novo cliente
  async createCliente(clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'>): Promise<Cliente | null> {
    try {
      const response = await apiClient.createCliente(clienteData) as { success: boolean; cliente?: Cliente };
      return response.success ? response.cliente || null : null;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return null;
    }
  }

  // Buscar cliente por ID
  async getClienteById(clienteId: string): Promise<Cliente | null> {
    try {
      const cliente = await apiClient.getCliente(clienteId) as Cliente;
      return cliente || null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  }

  // Buscar todos os clientes do usuário atual
  async getClientes(): Promise<Cliente[]> {
    try {
      const clientes = await apiClient.getClientes() as Cliente[];
      return clientes || [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  }

  // Atualizar cliente
  async updateCliente(clienteId: string, clienteData: Partial<Cliente>): Promise<Cliente | null> {
    try {
      const response = await apiClient.updateCliente(clienteId, clienteData) as { success: boolean; cliente?: Cliente };
      return response.success ? response.cliente || null : null;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return null;
    }
  }

  // Remover cliente
  async removeCliente(clienteId: string): Promise<boolean> {
    try {
      const response = await apiClient.deleteCliente(clienteId) as { success: boolean };
      return response.success || false;
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      return false;
    }
  }

  // Adicionar transação ao cliente
  async addTransacao(clienteId: string, transacaoData: Transacao): Promise<Transacao | null> {
    try {
      const response = await apiClient.addTransacao(clienteId, transacaoData) as { success: boolean; transacao?: Transacao };
      return response.success ? response.transacao || null : null;
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      return null;
    }
  }


}

export const clienteService = new ClienteService(); 