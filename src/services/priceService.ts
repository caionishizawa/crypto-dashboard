interface PriceData {
  symbol: string;
  price: number;
  lastUpdated: string;
}

interface PriceProvider {
  name: string;
  url: string;
  getPrice: (symbol: string) => Promise<PriceData | null>;
}

class CoinGeckoProvider implements PriceProvider {
  name = 'CoinGecko';
  url = 'https://api.coingecko.com/api/v3';

  async getPrice(symbol: string): Promise<PriceData | null> {
    try {
      const response = await fetch(`${this.url}/simple/price?ids=${symbol}&vs_currencies=usd&include_last_updated_at=true`);
      const data = await response.json();
      
      if (data[symbol] && data[symbol].usd) {
        return {
          symbol,
          price: data[symbol].usd,
          lastUpdated: new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar preço no CoinGecko:', error);
      return null;
    }
  }
}

class BinanceProvider implements PriceProvider {
  name = 'Binance';
  url = 'https://api.binance.com/api/v3';

  async getPrice(symbol: string): Promise<PriceData | null> {
    try {
      const binanceSymbol = symbol.toUpperCase() + 'USDT';
      const response = await fetch(`${this.url}/ticker/price?symbol=${binanceSymbol}`);
      const data = await response.json();
      
      if (data.price) {
        return {
          symbol,
          price: parseFloat(data.price),
          lastUpdated: new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar preço no Binance:', error);
      return null;
    }
  }
}

class PriceService {
  private providers: PriceProvider[] = [
    new CoinGeckoProvider(),
    new BinanceProvider()
  ];

  private cache: Map<string, { data: PriceData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private getCachedPrice(symbol: string): PriceData | null {
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedPrice(symbol: string, data: PriceData): void {
    this.cache.set(symbol, { data, timestamp: Date.now() });
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    // Verificar cache primeiro
    const cached = this.getCachedPrice(symbol);
    if (cached) {
      return cached;
    }

    // Tentar cada provider em ordem
    for (const provider of this.providers) {
      try {
        const priceData = await provider.getPrice(symbol);
        if (priceData) {
          this.setCachedPrice(symbol, priceData);
          console.log(`✅ Preço obtido via ${provider.name}: ${symbol} = $${priceData.price}`);
          return priceData;
        }
      } catch (error) {
        console.error(`❌ Erro no provider ${provider.name}:`, error);
        continue;
      }
    }

    console.error(`❌ Não foi possível obter preço para ${symbol} em nenhum provider`);
    return null;
  }

  async getMultiplePrices(symbols: string[]): Promise<Map<string, PriceData>> {
    const results = new Map<string, PriceData>();
    
    // Buscar preços em paralelo
    const promises = symbols.map(async (symbol) => {
      const price = await this.getPrice(symbol);
      if (price) {
        results.set(symbol, price);
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Mapeamento de símbolos para IDs do CoinGecko
  private symbolToCoinGeckoId: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'USDT': 'tether',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'BCH': 'bitcoin-cash',
    'LTC': 'litecoin'
  };

  getCoinGeckoId(symbol: string): string {
    return this.symbolToCoinGeckoId[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const priceService = new PriceService();
