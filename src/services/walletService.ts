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

  // === FUNCIONALIDADES COM SUPABASE ===

  // Buscar carteiras de um cliente
  async getCarteirasCliente(clienteId: string): Promise<Carteira[]> {
    try {
      const response = await apiClient.getCarteirasCliente(clienteId);
      
      if (response.success && response.data) {
        return response.data.map(this.formatCarteiraFromDB);
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao buscar carteiras do cliente:', error);
      return [];
    }
  }

  // Buscar carteira por ID
  async getCarteira(id: string): Promise<Carteira | null> {
    try {
      const response = await apiClient.getCarteira(id);
      
      if (response.success && response.data) {
        return this.formatCarteiraFromDB(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar carteira:', error);
      return null;
    }
  }

  // Adicionar nova carteira
  async addCarteira(clienteId: string, endereco: string, tipo: 'solana' | 'ethereum', nome?: string): Promise<Carteira | null> {
    try {
      // Buscar dados da carteira via API externa
      const dadosCarteira = tipo === 'solana' 
        ? await this.fetchSolanaWallet(endereco)
        : await this.fetchEthereumWallet(endereco);

      if (!dadosCarteira) {
        throw new Error('Não foi possível obter dados da carteira');
      }

      // Salvar no Supabase
      const carteiraData = {
        cliente_id: clienteId,
        endereco,
        tipo,
        nome: nome || `Carteira ${tipo}`,
        valor_atual: dadosCarteira.valorAtual,
        ultima_atualizacao: new Date().toISOString()
      };

      const response = await apiClient.createCarteira(carteiraData);
      
      if (response.success && response.data) {
        const carteira = this.formatCarteiraFromDB(response.data);
        
        // Salvar tokens
        if (dadosCarteira.tokens) {
          await this.saveTokens(carteira.id, dadosCarteira.tokens);
        }
        
        return carteira;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao adicionar carteira:', error);
      return null;
    }
  }

  // Atualizar carteira
  async updateCarteira(id: string, dados: Partial<Carteira>): Promise<Carteira | null> {
    try {
      const response = await apiClient.updateCarteira(id, {
        nome: dados.nome,
        valor_atual: dados.valorAtual,
        ultima_atualizacao: new Date().toISOString()
      });
      
      if (response.success && response.data) {
        return this.formatCarteiraFromDB(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error);
      return null;
    }
  }

  // Deletar carteira
  async deleteCarteira(id: string): Promise<boolean> {
    try {
      const response = await apiClient.deleteCarteira(id);
      return response.success;
    } catch (error) {
      console.error('Erro ao deletar carteira:', error);
      return false;
    }
  }

  // Atualizar dados da carteira (refresh)
  async refreshCarteira(id: string): Promise<Carteira | null> {
    try {
      const carteira = await this.getCarteira(id);
      if (!carteira) return null;

      // Buscar dados atualizados via API externa
      const dadosAtualizados = carteira.tipo === 'solana' 
        ? await this.fetchSolanaWallet(carteira.endereco)
        : await this.fetchEthereumWallet(carteira.endereco);

      if (!dadosAtualizados) return null;

      // Atualizar no Supabase
      const response = await apiClient.refreshCarteira(id);
      
      if (response.success && response.data) {
        // Atualizar tokens
        if (dadosAtualizados.tokens) {
          await this.updateTokens(id, dadosAtualizados.tokens);
        }
        
        return this.formatCarteiraFromDB(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error);
      return null;
    }
  }

  // Salvar tokens no Supabase
  private async saveTokens(carteiraId: string, tokens: any[]): Promise<void> {
    try {
      // Implementar lógica para salvar tokens no Supabase
      // Por enquanto, apenas log
      console.log('Salvando tokens para carteira:', carteiraId, tokens);
    } catch (error) {
      console.error('Erro ao salvar tokens:', error);
    }
  }

  // Atualizar tokens no Supabase
  private async updateTokens(carteiraId: string, tokens: any[]): Promise<void> {
    try {
      // Implementar lógica para atualizar tokens no Supabase
      // Por enquanto, apenas log
      console.log('Atualizando tokens para carteira:', carteiraId, tokens);
    } catch (error) {
      console.error('Erro ao atualizar tokens:', error);
    }
  }

  // Formatar dados da carteira do banco para o formato da aplicação
  private formatCarteiraFromDB(dbCarteira: any): Carteira {
    return {
      id: dbCarteira.id,
      endereco: dbCarteira.endereco,
      tipo: dbCarteira.tipo,
      nome: dbCarteira.nome,
      valorAtual: dbCarteira.valor_atual,
      tokens: dbCarteira.tokens || [],
      ultimaAtualizacao: dbCarteira.ultima_atualizacao
    };
  }

  // Calcular valor total das carteiras de um cliente
  async calculateTotalValue(clienteId: string): Promise<number> {
    try {
      const carteiras = await this.getCarteirasCliente(clienteId);
      return carteiras.reduce((total, carteira) => total + (carteira.valorAtual || 0), 0);
    } catch (error) {
      console.error('Erro ao calcular valor total:', error);
      return 0;
    }
  }

  // Obter distribuição de ativos
  async getAssetsDistribution(clienteId: string): Promise<{ [key: string]: number }> {
    try {
      const carteiras = await this.getCarteirasCliente(clienteId);
      const distribution: { [key: string]: number } = {};
      
      carteiras.forEach(carteira => {
        if (carteira.tokens) {
          carteira.tokens.forEach(token => {
            distribution[token.symbol] = (distribution[token.symbol] || 0) + token.valueUSD;
          });
        }
      });
      
      return distribution;
    } catch (error) {
      console.error('Erro ao obter distribuição de ativos:', error);
      return {};
    }
    }
}

export const walletService = new WalletService(); 