export interface Transacao {
  id?: string;
  userId: string;
  tipo: 'compra' | 'venda' | 'deposito';
  symbol: string; // Símbolo da criptomoeda (BTC, ETH, etc.)
  name: string; // Nome da criptomoeda
  quantidade: number;
  preco: number;
  data: string;
  taxa: number;
  valorTotal: number; // quantidade * preco + taxa
  fee?: number; // Taxa em moeda base
  btcAmount?: number; // Para compatibilidade com código existente
  usdValue?: number; // Para compatibilidade com código existente
  btcPrice?: number; // Para compatibilidade com código existente
}

export interface Asset {
  symbol: string;
  name: string;
  quantidade: number;
  precoMedio: number;
  valorAtual: number;
  transacoes: Transacao[];
}

export interface PortfolioMetrics {
  valorInicial: number;
  valorAtual: number;
  lucroPrejuizo: number;
  lucroPrejuizoPercentual: number;
  ultimaAtualizacao: string;
}

export interface Portfolio {
  userId: string;
  assets: Asset[];
  metrics: PortfolioMetrics;
} 