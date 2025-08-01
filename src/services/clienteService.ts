import type { Cliente } from '../types';
import { apiClient } from '../lib/api';

class ClienteService {
  
  // Buscar todos os clientes
  async getClientes(): Promise<Cliente[]> {
    try {
      const response = await apiClient.getClientes();
      
      if (response.success && response.data) {
        return response.data.map(this.formatClienteFromDB);
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  }

  // Buscar cliente por ID
  async getCliente(id: string): Promise<Cliente | null> {
    try {
      const response = await apiClient.getCliente(id);
      
      if (response.success && response.data) {
        return this.formatClienteFromDB(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  }

  // Criar novo cliente
  async createCliente(clienteData: Omit<Cliente, 'id' | 'transacoes' | 'carteiras' | 'snapshots'>): Promise<Cliente | null> {
    try {
      const dadosParaDB = {
        nome: clienteData.nome,
        tipo: clienteData.tipo,
        dataInicio: clienteData.dataInicio,
        investimentoInicial: clienteData.investimentoInicial,
        btcTotal: clienteData.btcTotal || 0,
        precoMedio: clienteData.precoMedio || 0,
        valorAtualBTC: clienteData.valorAtualBTC || 0,
        valorCarteiraDeFi: clienteData.valorCarteiraDeFi || 0,
        totalDepositado: clienteData.totalDepositado || 0,
        valorAtualUSD: clienteData.valorAtualUSD || 0,
        rendimentoTotal: clienteData.rendimentoTotal || 0,
        apyMedio: clienteData.apyMedio || 0,
        tempoMercado: clienteData.tempoMercado || '',
        scoreRisco: clienteData.scoreRisco || ''
      };

      const response = await apiClient.createCliente(dadosParaDB);
      
      if (response.success && response.data) {
        return this.formatClienteFromDB(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return null;
    }
  }

  // Atualizar cliente
  async updateCliente(id: string, clienteData: Partial<Cliente>): Promise<Cliente | null> {
    try {
      console.log('Dados recebidos para atualização:', clienteData);
      
      const dadosParaDB = {
        ...(clienteData.nome && { nome: clienteData.nome }),
        ...(clienteData.tipo && { tipo: clienteData.tipo }),
        ...(clienteData.dataInicio && { dataInicio: clienteData.dataInicio }),
        ...(clienteData.investimentoInicial !== undefined && { investimentoInicial: clienteData.investimentoInicial }),
        ...(clienteData.btcTotal !== undefined && { btcTotal: clienteData.btcTotal }),
        ...(clienteData.precoMedio !== undefined && { precoMedio: clienteData.precoMedio }),
        ...(clienteData.valorAtualBTC !== undefined && { valorAtualBTC: clienteData.valorAtualBTC }),
        ...(clienteData.valorCarteiraDeFi !== undefined && { valorCarteiraDeFi: clienteData.valorCarteiraDeFi }),
        ...(clienteData.totalDepositado !== undefined && { totalDepositado: clienteData.totalDepositado }),
        ...(clienteData.valorAtualUSD !== undefined && { valorAtualUSD: clienteData.valorAtualUSD }),
        ...(clienteData.rendimentoTotal !== undefined && { rendimentoTotal: clienteData.rendimentoTotal }),
        ...(clienteData.apyMedio !== undefined && { apyMedio: clienteData.apyMedio }),
        ...(clienteData.tempoMercado && { tempoMercado: clienteData.tempoMercado }),
        ...(clienteData.scoreRisco && { scoreRisco: clienteData.scoreRisco })
      };

      console.log('Dados convertidos para DB:', dadosParaDB);

      const response = await apiClient.updateCliente(id, dadosParaDB);
      
      console.log('Resposta da API:', response);
      
      if (response.success && response.data) {
        const clienteFormatado = this.formatClienteFromDB(response.data);
        console.log('Cliente formatado:', clienteFormatado);
        return clienteFormatado;
      }
      
      console.error('Falha na atualização:', response.error);
      return null;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return null;
    }
  }

  // Deletar cliente
  async deleteCliente(id: string): Promise<boolean> {
    try {
      const response = await apiClient.deleteCliente(id);
      return response.success;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      return false;
    }
  }

  // Adicionar transação para cliente
  async addTransacao(clienteId: string, transacaoData: any): Promise<boolean> {
    try {
      const dadosTransacao = {
        data: transacaoData.data,
        tipo: transacaoData.tipo,
        btc_amount: transacaoData.btcAmount,
        usd_value: transacaoData.usdValue,
        btc_price: transacaoData.btcPrice
      };

      const response = await apiClient.addTransacao(clienteId, dadosTransacao);
      return response.success;
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      return false;
    }
  }

  // Calcular estatísticas do cliente
  async calculateClientStats(clienteId: string): Promise<{
    valorTotal: number;
    rendimento: number;
    apy: number;
    tempoMercado: string;
  }> {
    try {
      const cliente = await this.getCliente(clienteId);
      
      if (!cliente) {
        return {
          valorTotal: 0,
          rendimento: 0,
          apy: 0,
          tempoMercado: '0 meses'
        };
      }

      const valorTotal = (cliente.valorAtualBTC || 0) + (cliente.valorCarteiraDeFi || 0) + (cliente.valorAtualUSD || 0);
      const rendimento = (cliente.rendimentoTotal || 0);
      const apy = cliente.apyMedio || 0;
      const tempoMercado = cliente.tempoMercado || '0 meses';

      return {
        valorTotal,
        rendimento,
        apy,
        tempoMercado
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas do cliente:', error);
      return {
        valorTotal: 0,
        rendimento: 0,
        apy: 0,
        tempoMercado: '0 meses'
      };
    }
  }

  // Obter clientes por tipo
  async getClientesPorTipo(tipo: 'bitcoin' | 'conservador'): Promise<Cliente[]> {
    try {
      const clientes = await this.getClientes();
      return clientes.filter(cliente => cliente.tipo === tipo);
    } catch (error) {
      console.error('Erro ao buscar clientes por tipo:', error);
      return [];
    }
  }

  // Obter estatísticas gerais
  async getEstatisticasGerais(): Promise<{
    totalClientes: number;
    clientesBitcoin: number;
    clientesConservador: number;
    valorTotalGerenciado: number;
    rendimentoMedio: number;
  }> {
    try {
      const clientes = await this.getClientes();
      
      const totalClientes = clientes.length;
      const clientesBitcoin = clientes.filter(c => c.tipo === 'bitcoin').length;
      const clientesConservador = clientes.filter(c => c.tipo === 'conservador').length;
      
      const valorTotalGerenciado = clientes.reduce((total, cliente) => {
        return total + (cliente.valorAtualBTC || 0) + (cliente.valorCarteiraDeFi || 0) + (cliente.valorAtualUSD || 0);
      }, 0);
      
      const rendimentoMedio = clientes.reduce((total, cliente) => total + (cliente.apyMedio || 0), 0) / totalClientes;

      return {
        totalClientes,
        clientesBitcoin,
        clientesConservador,
        valorTotalGerenciado,
        rendimentoMedio
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas gerais:', error);
      return {
        totalClientes: 0,
        clientesBitcoin: 0,
        clientesConservador: 0,
        valorTotalGerenciado: 0,
        rendimentoMedio: 0
      };
    }
  }

  // Formatar dados do cliente do banco para o formato da aplicação
  private formatClienteFromDB(dbCliente: any): Cliente {
    return {
      id: dbCliente.id,
      nome: dbCliente.nome,
      tipo: dbCliente.tipo,
      dataInicio: dbCliente.dataInicio,
      investimentoInicial: dbCliente.investimentoInicial,
      transacoes: dbCliente.transacoes || [],
      carteiras: dbCliente.carteiras || [],
      snapshots: dbCliente.snapshots || [],
      btcTotal: dbCliente.btcTotal,
      precoMedio: dbCliente.precoMedio,
      valorAtualBTC: dbCliente.valorAtualBTC,
      valorCarteiraDeFi: dbCliente.valorCarteiraDeFi,
      totalDepositado: dbCliente.totalDepositado,
      valorAtualUSD: dbCliente.valorAtualUSD,
      rendimentoTotal: dbCliente.rendimentoTotal,
      apyMedio: dbCliente.apyMedio || 0,
      tempoMercado: dbCliente.tempoMercado || '',
      scoreRisco: dbCliente.scoreRisco || ''
    };
  }

  // Validar dados do cliente
  private validateClienteData(clienteData: any): boolean {
    return !!(
      clienteData.nome &&
      clienteData.tipo &&
      clienteData.dataInicio &&
      clienteData.investimentoInicial >= 0
    );
  }

  // Buscar clientes com filtros
  async getClientesComFiltros(filtros: {
    tipo?: 'bitcoin' | 'conservador';
    valorMinimo?: number;
    valorMaximo?: number;
    apyMinimo?: number;
  }): Promise<Cliente[]> {
    try {
      let clientes = await this.getClientes();

      if (filtros.tipo) {
        clientes = clientes.filter(cliente => cliente.tipo === filtros.tipo);
      }

      if (filtros.valorMinimo !== undefined) {
        clientes = clientes.filter(cliente => {
          const valorTotal = (cliente.valorAtualBTC || 0) + (cliente.valorCarteiraDeFi || 0) + (cliente.valorAtualUSD || 0);
          return valorTotal >= filtros.valorMinimo!;
        });
      }

      if (filtros.valorMaximo !== undefined) {
        clientes = clientes.filter(cliente => {
          const valorTotal = (cliente.valorAtualBTC || 0) + (cliente.valorCarteiraDeFi || 0) + (cliente.valorAtualUSD || 0);
          return valorTotal <= filtros.valorMaximo!;
        });
      }

      if (filtros.apyMinimo !== undefined) {
        clientes = clientes.filter(cliente => (cliente.apyMedio || 0) >= filtros.apyMinimo!);
      }

      return clientes;
    } catch (error) {
      console.error('Erro ao buscar clientes com filtros:', error);
      return [];
    }
  }
}

export const clienteService = new ClienteService(); 