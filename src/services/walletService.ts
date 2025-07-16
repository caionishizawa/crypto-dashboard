import type { Carteira } from '../types';
import { apiClient } from '../lib/api';

class WalletService {
  
  // Simulação de API Helius (Solana)
  async fetchSolanaWallet(endereco: string): Promise<Carteira | null> {
    try {
      // Simulação - em produção, usar API real do Helius
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: `solana-${Date.now()}`,
        endereco,
        tipo: 'solana',
        valorAtual: Math.random() * 10000 + 1000,
        tokens: [
          { symbol: 'SOL', balance: Math.random() * 10, valueUSD: Math.random() * 2000 },
          { symbol: 'USDC', balance: Math.random() * 5000, valueUSD: Math.random() * 5000 }
        ],
        ultimaAtualizacao: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar dados Solana:', error);
      return null;
    }
  }

  // Simulação de API Debank (Ethereum)
  async fetchEthereumWallet(endereco: string): Promise<Carteira | null> {
    try {
      // Simulação - em produção, usar API real do Debank
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: `eth-${Date.now()}`,
        endereco,
        tipo: 'ethereum',
        valorAtual: Math.random() * 50000 + 5000,
        tokens: [
          { symbol: 'ETH', balance: Math.random() * 5, valueUSD: Math.random() * 15000 },
          { symbol: 'USDT', balance: Math.random() * 10000, valueUSD: Math.random() * 10000 },
          { symbol: 'USDC', balance: Math.random() * 8000, valueUSD: Math.random() * 8000 }
        ],
        ultimaAtualizacao: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar dados Ethereum:', error);
      return null;
    }
  }

  // Buscar dados da carteira baseado no tipo
  async fetchWalletData(endereco: string, tipo: 'solana' | 'ethereum'): Promise<Carteira | null> {
    if (tipo === 'solana') {
      return this.fetchSolanaWallet(endereco);
    } else if (tipo === 'ethereum') {
      return this.fetchEthereumWallet(endereco);
    }
    return null;
  }

  // Validar endereço da carteira
  validateWalletAddress(endereco: string, tipo: 'solana' | 'ethereum'): boolean {
    if (!endereco || endereco.trim().length === 0) {
      return false;
    }

    if (tipo === 'solana') {
      // Endereços Solana têm entre 32-44 caracteres
      return endereco.length >= 32 && endereco.length <= 44;
    } else if (tipo === 'ethereum') {
      // Endereços Ethereum começam com 0x e têm 42 caracteres
      return endereco.startsWith('0x') && endereco.length === 42;
    }

    return false;
  }

  // === FUNCIONALIDADES COM API ===

  // Salvar carteira no banco de dados
  async saveWallet(carteiraData: Omit<Carteira, 'id'>, clienteId: string): Promise<Carteira | null> {
    try {
      const response = await apiClient.createCarteira({
        ...carteiraData,
        clienteId
      }) as { success: boolean; carteira?: Carteira };

      return response.success ? response.carteira || null : null;
    } catch (error) {
      console.error('Erro ao salvar carteira:', error);
      return null;
    }
  }

  // Buscar carteiras de um cliente
  async getClientWallets(clienteId: string): Promise<Carteira[]> {
    try {
      const carteiras = await apiClient.getCarteirasCliente(clienteId) as Carteira[];
      return carteiras || [];
    } catch (error) {
      console.error('Erro ao buscar carteiras do cliente:', error);
      return [];
    }
  }

  // Buscar carteira por ID
  async getWalletById(carteiraId: string): Promise<Carteira | null> {
    try {
      const carteira = await apiClient.getCarteira(carteiraId) as Carteira;
      return carteira || null;
    } catch (error) {
      console.error('Erro ao buscar carteira:', error);
      return null;
    }
  }

  // Atualizar dados da carteira
  async updateWallet(carteiraId: string, carteiraData: Partial<Carteira>): Promise<Carteira | null> {
    try {
      const response = await apiClient.updateCarteira(carteiraId, carteiraData) as { success: boolean; carteira?: Carteira };
      return response.success ? response.carteira || null : null;
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error);
      return null;
    }
  }

  // Remover carteira
  async removeWallet(carteiraId: string): Promise<boolean> {
    try {
      const response = await apiClient.deleteCarteira(carteiraId) as { success: boolean };
      return response.success || false;
    } catch (error) {
      console.error('Erro ao remover carteira:', error);
      return false;
    }
  }

  // Atualizar carteira com dados das APIs
  async refreshWallet(carteiraId: string): Promise<Carteira | null> {
    try {
      const response = await apiClient.refreshCarteira(carteiraId) as { success: boolean; carteira?: Carteira };
      return response.success ? response.carteira || null : null;
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error);
      return null;
    }
  }

  // Buscar e salvar carteira automaticamente
  async fetchAndSaveWallet(endereco: string, tipo: 'solana' | 'ethereum', clienteId: string): Promise<Carteira | null> {
    try {
      // Buscar dados atualizados da API externa
      const dadosAtualizados = await this.fetchWalletData(endereco, tipo);
      if (!dadosAtualizados) return null;

      // Salvar nova carteira
      return await this.saveWallet(dadosAtualizados, clienteId);
    } catch (error) {
      console.error('Erro ao buscar e salvar carteira:', error);
      return null;
    }
  }
}

// Exportar instância única
export const walletService = new WalletService(); 