import type { Transacao, Asset, Portfolio, PortfolioMetrics } from '../types/transacao';
import { priceService } from './priceService';

interface DashboardBox {
  titulo: string;
  descricao: string;
  valor: number;
  percentual?: number;
  tipo: 'base' | 'atual' | 'resultado';
}

interface DashboardBoxes {
  box1: DashboardBox;
  box2: DashboardBox;
  box3: DashboardBox;
}

export class PortfolioService {
  /**
   * Calcula as métricas do portfólio baseado nas transações
   */
  async calculatePortfolio(userId: string, transacoes: Transacao[]): Promise<Portfolio> {
    // Agrupar transações por símbolo
    const assetsMap = new Map<string, Asset>();
    
    for (const transacao of transacoes) {
      const symbol = transacao.symbol;
      
      if (!assetsMap.has(symbol)) {
        assetsMap.set(symbol, {
          symbol,
          name: transacao.name,
          quantidade: 0,
          precoMedio: 0,
          valorAtual: 0,
          transacoes: []
        });
      }
      
      const asset = assetsMap.get(symbol)!;
      asset.transacoes.push(transacao);
      
      // Calcular quantidade e preço médio
      if (transacao.tipo === 'compra') {
        const quantidadeAnterior = asset.quantidade;
        const valorAnterior = quantidadeAnterior * asset.precoMedio;
        const novaQuantidade = quantidadeAnterior + transacao.quantidade;
        const novoValor = valorAnterior + (transacao.quantidade * transacao.preco);
        
        asset.quantidade = novaQuantidade;
        asset.precoMedio = novaQuantidade > 0 ? novoValor / novaQuantidade : 0;
      } else if (transacao.tipo === 'venda') {
        asset.quantidade = Math.max(0, asset.quantidade - transacao.quantidade);
        // O preço médio permanece o mesmo para vendas
      }
    }
    
    // Buscar preços atuais para todos os assets
    const symbols = Array.from(assetsMap.keys());
    const prices = await priceService.getMultiplePrices(symbols);
    
    // Calcular valores atuais
    let valorTotalAtual = 0;
    for (const [symbol, asset] of assetsMap) {
      const priceData = prices.get(symbol);
      if (priceData) {
        asset.valorAtual = asset.quantidade * priceData.price;
        valorTotalAtual += asset.valorAtual;
      }
    }
    
    // Calcular métricas
    const metrics = this.calculateMetrics(transacoes, valorTotalAtual);
    
    return {
      userId,
      assets: Array.from(assetsMap.values()),
      metrics
    };
  }
  
  /**
   * Calcula as métricas do portfólio
   */
  private calculateMetrics(transacoes: Transacao[], valorAtual: number): PortfolioMetrics {
    // Valor inicial: soma de todas as compras
    const valorInicial = transacoes
      .filter(t => t.tipo === 'compra')
      .reduce((acc, t) => acc + t.valorTotal, 0);
    
    const lucroPrejuizo = valorAtual - valorInicial;
    const lucroPrejuizoPercentual = valorInicial > 0 
      ? (lucroPrejuizo / valorInicial) * 100 
      : 0;
    
    return {
      valorInicial,
      valorAtual,
      lucroPrejuizo,
      lucroPrejuizoPercentual,
      ultimaAtualizacao: new Date().toISOString()
    };
  }
  
  /**
   * Calcula os 3 boxes principais do dashboard do cliente
   */
  calculateDashboardBoxes(portfolio: Portfolio): DashboardBoxes {
    const { metrics } = portfolio;
    
    return {
      box1: {
        titulo: "Valor Inicial Investido",
        descricao: "Seu capital se permanecesse parado",
        valor: metrics.valorInicial,
        tipo: "base" as const
      },
      box2: {
        titulo: "Valor Total Atual",
        descricao: "Capital inicial + Rendimentos",
        valor: metrics.valorAtual,
        tipo: "atual" as const
      },
      box3: {
        titulo: "Resultado da Assessoria",
        descricao: "Lucro gerado através de nossa gestão",
        valor: metrics.lucroPrejuizo,
        percentual: metrics.lucroPrejuizoPercentual,
        tipo: "resultado" as const
      }
    };
  }
  
  /**
   * Detecta variações significativas no portfólio
   */
  detectSignificantChanges(
    portfolioAnterior: Portfolio, 
    portfolioAtual: Portfolio,
    threshold: number = 5 // 5% de variação
  ) {
    const changes = [];
    
    const variacaoPercentual = Math.abs(
      ((portfolioAtual.metrics.valorAtual - portfolioAnterior.metrics.valorAtual) / 
       portfolioAnterior.metrics.valorAtual) * 100
    );
    
    if (variacaoPercentual >= threshold) {
      changes.push({
        tipo: 'portfolio',
        mensagem: `Variação significativa no portfólio: ${variacaoPercentual.toFixed(2)}%`,
        valor: variacaoPercentual,
        timestamp: new Date().toISOString()
      });
    }
    
    // Verificar variações por asset
    for (const assetAtual of portfolioAtual.assets) {
      const assetAnterior = portfolioAnterior.assets.find(a => a.symbol === assetAtual.symbol);
      
      if (assetAnterior) {
        const variacaoAsset = Math.abs(
          ((assetAtual.valorAtual - assetAnterior.valorAtual) / 
           assetAnterior.valorAtual) * 100
        );
        
        if (variacaoAsset >= threshold) {
          changes.push({
            tipo: 'asset',
            symbol: assetAtual.symbol,
            mensagem: `Variação significativa em ${assetAtual.symbol}: ${variacaoAsset.toFixed(2)}%`,
            valor: variacaoAsset,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    return changes;
  }
  
  /**
   * Gera relatório de performance
   */
  generatePerformanceReport(portfolio: Portfolio, periodo: 'diario' | 'semanal' | 'mensal' = 'mensal') {
    const { metrics, assets } = portfolio;
    
    return {
      periodo,
      dataGeracao: new Date().toISOString(),
      resumo: {
        valorInicial: metrics.valorInicial,
        valorAtual: metrics.valorAtual,
        lucroPrejuizo: metrics.lucroPrejuizo,
        lucroPrejuizoPercentual: metrics.lucroPrejuizoPercentual
      },
      assets: assets.map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        quantidade: asset.quantidade,
        precoMedio: asset.precoMedio,
        valorAtual: asset.valorAtual,
        percentualPortfolio: metrics.valorAtual > 0 
          ? (asset.valorAtual / metrics.valorAtual) * 100 
          : 0
      })),
      recomendacoes: this.generateRecommendations(portfolio)
    };
  }
  
  /**
   * Gera recomendações baseadas no portfólio
   */
  private generateRecommendations(portfolio: Portfolio): string[] {
    const recommendations = [];
    const { metrics, assets } = portfolio;
    
    // Verificar diversificação
    if (assets.length < 3) {
      recommendations.push("Considere diversificar seu portfólio com mais ativos");
    }
    
    // Verificar concentração
    const maiorAsset = assets.reduce((max, asset) => 
      asset.valorAtual > max.valorAtual ? asset : max
    );
    
    const percentualMaiorAsset = metrics.valorAtual > 0 
      ? (maiorAsset.valorAtual / metrics.valorAtual) * 100 
      : 0;
    
    if (percentualMaiorAsset > 50) {
      recommendations.push(`Considere reduzir a concentração em ${maiorAsset.symbol} (${percentualMaiorAsset.toFixed(1)}%)`);
    }
    
    // Verificar performance
    if (metrics.lucroPrejuizoPercentual < -10) {
      recommendations.push("Seu portfólio está com perda significativa. Considere revisar a estratégia");
    } else if (metrics.lucroPrejuizoPercentual > 20) {
      recommendations.push("Excelente performance! Considere realizar alguns lucros");
    }
    
    return recommendations;
  }
}

export const portfolioService = new PortfolioService();
