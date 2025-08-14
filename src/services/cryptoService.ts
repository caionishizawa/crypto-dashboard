interface CryptoPrice {
  bitcoin: {
    usd: number;
  };
}

class CryptoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async getBitcoinPrice(): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=bitcoin&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar preço do Bitcoin');
      }

      const data: CryptoPrice = await response.json();
      return data.bitcoin.usd;
    } catch (error) {
      console.error('Erro ao buscar preço do Bitcoin:', error);
      // Retorna um preço padrão em caso de erro
      return 45000; // Preço aproximado do Bitcoin
    }
  }

  async getBitcoinPriceWithCache(): Promise<number> {
    // Verificar se já temos um preço em cache (últimos 5 minutos)
    const cached = sessionStorage.getItem('btc_price_cache');
    if (cached) {
      const { price, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (now - timestamp < fiveMinutes) {
        return price;
      }
    }

    // Buscar novo preço
    const price = await this.getBitcoinPrice();
    
    // Salvar no cache
    sessionStorage.setItem('btc_price_cache', JSON.stringify({
      price,
      timestamp: Date.now()
    }));

    return price;
  }
}

export const cryptoService = new CryptoService(); 