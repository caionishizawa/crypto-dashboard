export interface Token {
  symbol: string;
  balance: number;
  valueUSD: number;
}

export interface Carteira {
  id: string;
  endereco: string;
  tipo: 'solana' | 'ethereum';
  nome?: string;
  valorAtual?: number;
  tokens?: Token[];
  ultimaAtualizacao?: string;
}

export interface DailySnapshot {
  data: string;
  valorTotal: number;
  carteiras: Array<{
    carteiraId: string;
    valor: number;
    tokens: Token[];
  }>;
} 