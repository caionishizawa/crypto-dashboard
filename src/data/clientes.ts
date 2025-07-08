import type { ClientesData } from '../types';

export const clientesData: ClientesData = {
  'cliente-a-001': {
    id: 'cliente-a-001',
    nome: 'João Silva',
    tipo: 'bitcoin',
    dataInicio: '2024-01-01',
    investimentoInicial: 50000,
    transacoes: [
      { data: '2024-01-01', tipo: 'compra', btcAmount: 0.0125, usdValue: 50000, btcPrice: 40000 },
      { data: '2024-03-15', tipo: 'compra', btcAmount: 0.0105, usdValue: 52500, btcPrice: 50000 },
      { data: '2024-06-20', tipo: 'compra', btcAmount: 0.0133, usdValue: 47500, btcPrice: 35700 },
      { data: '2024-09-10', tipo: 'compra', btcAmount: 0.0095, usdValue: 50000, btcPrice: 52600 },
      { data: '2024-12-01', tipo: 'compra', btcAmount: 0.0053, usdValue: 50000, btcPrice: 94300 }
    ],
    btcTotal: 0.0511,
    precoMedio: 48920,
    valorAtualBTC: 95000,
    valorCarteiraDeFi: 268000,
    apyMedio: 24.5,
    tempoMercado: '12 meses',
    scoreRisco: 'Médio-Alto'
  },
  'cliente-b-002': {
    id: 'cliente-b-002',
    nome: 'Maria Santos',
    tipo: 'conservador',
    dataInicio: '2024-01-01',
    investimentoInicial: 100000,
    transacoes: [
      { data: '2024-01-01', tipo: 'deposito', usdValue: 100000 },
      { data: '2024-04-01', tipo: 'deposito', usdValue: 50000 },
      { data: '2024-07-01', tipo: 'deposito', usdValue: 50000 },
      { data: '2024-10-01', tipo: 'deposito', usdValue: 50000 }
    ],
    totalDepositado: 250000,
    valorAtualUSD: 287500,
    rendimentoTotal: 37500,
    apyMedio: 15.0,
    tempoMercado: '12 meses',
    scoreRisco: 'Baixo'
  }
}; 