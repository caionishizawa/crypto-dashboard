import { useState, useEffect } from 'react';
import type { Cliente } from '../types/cliente';
import { formatarMoeda, formatarPercentual } from '../utils/formatters';

interface DashboardStats {
  totalClientes: number;
  totalInvestido: number;
  totalAtual: number;
  lucroTotal: number;
  retornoMedio: number;
  clientesBitcoin: number;
  clientesConservador: number;
  melhorCliente: Cliente | null;
  piorCliente: Cliente | null;
}

interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  lastUpdate: string;
}

export const useDashboard = (clientes: { [key: string]: Cliente }) => {
  const [state, setState] = useState<DashboardState>({
    stats: {
      totalClientes: 0,
      totalInvestido: 0,
      totalAtual: 0,
      lucroTotal: 0,
      retornoMedio: 0,
      clientesBitcoin: 0,
      clientesConservador: 0,
      melhorCliente: null,
      piorCliente: null
    },
    loading: false,
    error: null,
    lastUpdate: new Date().toISOString()
  });

  // Calcular estatísticas do dashboard
  const calculateStats = () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const clientesList = Object.values(clientes);
      
      if (clientesList.length === 0) {
        setState(prev => ({
          ...prev,
          stats: {
            totalClientes: 0,
            totalInvestido: 0,
            totalAtual: 0,
            lucroTotal: 0,
            retornoMedio: 0,
            clientesBitcoin: 0,
            clientesConservador: 0,
            melhorCliente: null,
            piorCliente: null
          },
          loading: false,
          lastUpdate: new Date().toISOString()
        }));
        return;
      }

      // Calcular totais
      let totalInvestido = 0;
      let totalAtual = 0;
      let clientesBitcoin = 0;
      let clientesConservador = 0;
      let melhorRetorno = -Infinity;
      let piorRetorno = Infinity;
      let melhorCliente: Cliente | null = null;
      let piorCliente: Cliente | null = null;

      clientesList.forEach(cliente => {
        const isTypeBitcoin = cliente.tipo === 'bitcoin';
        
        // Calcular valores
        const valorAtual = isTypeBitcoin 
          ? cliente.valorCarteiraDeFi || 0
          : cliente.valorAtualUSD || 0;
        
        const valorInicial = isTypeBitcoin 
          ? cliente.investimentoInicial * cliente.transacoes.length
          : cliente.totalDepositado || cliente.investimentoInicial;

        totalInvestido += valorInicial;
        totalAtual += valorAtual;

        // Contar por tipo
        if (isTypeBitcoin) {
          clientesBitcoin++;
        } else {
          clientesConservador++;
        }

        // Calcular retorno individual
        const retorno = valorInicial > 0 ? ((valorAtual - valorInicial) / valorInicial) * 100 : 0;

        // Encontrar melhor e pior performance
        if (retorno > melhorRetorno) {
          melhorRetorno = retorno;
          melhorCliente = cliente;
        }
        if (retorno < piorRetorno) {
          piorRetorno = retorno;
          piorCliente = cliente;
        }
      });

      const lucroTotal = totalAtual - totalInvestido;
      const retornoMedio = totalInvestido > 0 ? ((totalAtual - totalInvestido) / totalInvestido) * 100 : 0;

      const newStats: DashboardStats = {
        totalClientes: clientesList.length,
        totalInvestido,
        totalAtual,
        lucroTotal,
        retornoMedio,
        clientesBitcoin,
        clientesConservador,
        melhorCliente,
        piorCliente
      };

      setState(prev => ({
        ...prev,
        stats: newStats,
        loading: false,
        lastUpdate: new Date().toISOString()
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao calcular estatísticas'
      }));
    }
  };

  // Recalcular quando os clientes mudarem
  useEffect(() => {
    calculateStats();
  }, [clientes]);

  // Função para forçar atualização
  const refreshStats = () => {
    calculateStats();
  };

  // Função para obter dados formatados
  const getFormattedStats = () => {
    const { stats } = state;
    return {
      totalClientes: stats.totalClientes,
      totalInvestido: formatarMoeda(stats.totalInvestido),
      totalAtual: formatarMoeda(stats.totalAtual),
      lucroTotal: formatarMoeda(Math.abs(stats.lucroTotal)),
      lucroTotalPositivo: stats.lucroTotal >= 0,
      retornoMedio: formatarPercentual(stats.retornoMedio),
      retornoMedioPositivo: stats.retornoMedio >= 0,
      clientesBitcoin: stats.clientesBitcoin,
      clientesConservador: stats.clientesConservador,
      melhorCliente: stats.melhorCliente,
      piorCliente: stats.piorCliente,
      percentualBitcoin: stats.totalClientes > 0 ? (stats.clientesBitcoin / stats.totalClientes) * 100 : 0,
      percentualConservador: stats.totalClientes > 0 ? (stats.clientesConservador / stats.totalClientes) * 100 : 0
    };
  };

  // Função para obter dados de performance por período
  const getPerformanceData = () => {
    // Simular dados de performance histórica
    const hoje = new Date();
    const diasAnteriores = Array.from({ length: 30 }, (_, i) => {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      return data;
    }).reverse();

    return diasAnteriores.map(data => {
      // Simular variação de valor ao longo do tempo
      const variacao = Math.random() * 0.02 - 0.01; // ±1% de variação
      const valorBase = state.stats.totalAtual;
      const valorDia = valorBase * (1 + variacao);

      return {
        data: data.toISOString().split('T')[0],
        valor: valorDia,
        lucro: valorDia - state.stats.totalInvestido,
        retorno: state.stats.totalInvestido > 0 ? ((valorDia - state.stats.totalInvestido) / state.stats.totalInvestido) * 100 : 0
      };
    });
  };

  // Função para obter distribuição de investimentos
  const getDistribuicaoInvestimentos = () => {
    const clientesList = Object.values(clientes);
    
    const distribuicao = {
      bitcoin: 0,
      conservador: 0,
      carteiras: {
        solana: 0,
        ethereum: 0
      }
    };

    clientesList.forEach(cliente => {
      const isTypeBitcoin = cliente.tipo === 'bitcoin';
      const valorAtual = isTypeBitcoin 
        ? cliente.valorCarteiraDeFi || 0
        : cliente.valorAtualUSD || 0;

      if (isTypeBitcoin) {
        distribuicao.bitcoin += valorAtual;
      } else {
        distribuicao.conservador += valorAtual;
      }

      // Contar carteiras
      cliente.carteiras?.forEach(carteira => {
        if (carteira.tipo === 'solana') {
          distribuicao.carteiras.solana += carteira.valorAtual || 0;
        } else if (carteira.tipo === 'ethereum') {
          distribuicao.carteiras.ethereum += carteira.valorAtual || 0;
        }
      });
    });

    return distribuicao;
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    lastUpdate: state.lastUpdate,
    refreshStats,
    getFormattedStats,
    getPerformanceData,
    getDistribuicaoInvestimentos,
    clearError
  };
}; 