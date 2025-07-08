export interface Transacao {
  data: string;
  tipo: 'compra' | 'deposito';
  btcAmount?: number;
  usdValue: number;
  btcPrice?: number;
} 