import type { Transacao } from './transacao';
import type { Carteira, DailySnapshot } from './carteira';

export interface Cliente {
  id: string;
  nome: string;
  tipo: 'bitcoin' | 'conservador';
  dataInicio: string;
  investimentoInicial: number;
  transacoes: Transacao[];
  carteiras?: Carteira[];
  snapshots?: DailySnapshot[];
  btcTotal?: number;
  precoMedio?: number;
  valorAtualBTC?: number;
  valorCarteiraDeFi?: number;
  totalDepositado?: number;
  valorAtualUSD?: number;
  rendimentoTotal?: number;
  apyMedio: number;
  tempoMercado: string;
  scoreRisco: string;
}

export interface ClientesData {
  [key: string]: Cliente;
} 