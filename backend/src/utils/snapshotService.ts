import { PrismaClient } from '@prisma/client'
import { getSupabaseClient } from '../../lib/supabaseClient'

const prisma = new PrismaClient()

interface TokenData {
  symbol: string
  balance: number
  valueUSD: number
}

interface CarteiraData {
  id: string
  endereco: string
  tipo: string
  nome?: string
  valorAtual: number
  tokens: TokenData[]
}

interface ClienteData {
  id: string
  nome: string
  usuarioId: string
  carteiras: CarteiraData[]
  valorTotalCarteira: number
}

// Função para buscar preços das criptomoedas via API
async function getCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
  try {
    const uniqueSymbols = [...new Set(symbols)]
    const symbolsParam = uniqueSymbols.join(',')
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsParam}&vs_currencies=usd`
    )
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }
    
    const data = await response.json()
    const prices: Record<string, number> = {}
    
    uniqueSymbols.forEach(symbol => {
      if (data[symbol] && data[symbol].usd) {
        prices[symbol] = data[symbol].usd
      } else {
        console.warn(`Preço não encontrado para ${symbol}`)
        prices[symbol] = 0
      }
    })
    
    return prices
  } catch (error) {
    console.error('Erro ao buscar preços das criptomoedas:', error)
    return {}
  }
}

// Função para calcular valor total de uma carteira
function calculateCarteiraValue(tokens: TokenData[]): number {
  return tokens.reduce((total, token) => total + token.valueUSD, 0)
}

// Função para capturar snapshot de uma carteira específica
async function captureCarteiraSnapshot(carteiraId: string): Promise<CarteiraData | null> {
  try {
    const carteira = await prisma.carteira.findUnique({
      where: { id: carteiraId },
      include: {
        tokens: true
      }
    })

    if (!carteira) {
      console.warn(`Carteira ${carteiraId} não encontrada`)
      return null
    }

    // Buscar preços atualizados para os tokens
    const symbols = carteira.tokens.map(token => token.symbol)
    const prices = await getCryptoPrices(symbols)

    // Atualizar valores dos tokens
    const updatedTokens: TokenData[] = carteira.tokens.map(token => {
      const currentPrice = prices[token.symbol] || 0
      const valueUSD = token.balance * currentPrice
      
      return {
        symbol: token.symbol,
        balance: token.balance,
        valueUSD
      }
    })

    const valorAtual = calculateCarteiraValue(updatedTokens)

    return {
      id: carteira.id,
      endereco: carteira.endereco,
      tipo: carteira.tipo,
      nome: carteira.nome || undefined,
      valorAtual,
      tokens: updatedTokens
    }
  } catch (error) {
    console.error(`Erro ao capturar snapshot da carteira ${carteiraId}:`, error)
    return null
  }
}

// Função para capturar snapshot de um cliente
async function captureClienteSnapshot(clienteId: string): Promise<ClienteData | null> {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        carteiras: {
          include: {
            tokens: true
          }
        }
      }
    })

    if (!cliente) {
      console.warn(`Cliente ${clienteId} não encontrado`)
      return null
    }

    const carteirasData: CarteiraData[] = []
    let valorTotalCarteira = 0

    // Capturar snapshot de cada carteira
    for (const carteira of cliente.carteiras) {
      const carteiraSnapshot = await captureCarteiraSnapshot(carteira.id)
      if (carteiraSnapshot) {
        carteirasData.push(carteiraSnapshot)
        valorTotalCarteira += carteiraSnapshot.valorAtual
      }
    }

    return {
      id: cliente.id,
      nome: cliente.nome,
      usuarioId: cliente.usuarioId,
      carteiras: carteirasData,
      valorTotalCarteira
    }
  } catch (error) {
    console.error(`Erro ao capturar snapshot do cliente ${clienteId}:`, error)
    return null
  }
}

// Função principal para capturar snapshots de todos os clientes
export async function captureDailySnapshots(): Promise<void> {
  console.log('🚀 Iniciando captura de snapshots diários...')
  
  try {
    // Buscar todos os clientes ativos
    const clientes = await prisma.cliente.findMany({
      select: { id: true }
    })

    console.log(`📊 Encontrados ${clientes.length} clientes para snapshot`)

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0) // Zerar horário para comparação

    for (const cliente of clientes) {
      try {
        console.log(`📸 Capturando snapshot do cliente ${cliente.id}...`)
        
        const clienteData = await captureClienteSnapshot(cliente.id)
        
        if (!clienteData) {
          console.warn(`❌ Falha ao capturar snapshot do cliente ${cliente.id}`)
          continue
        }

        // Verificar se já existe snapshot para hoje
        const existingSnapshot = await prisma.dailySnapshot.findFirst({
          where: {
            clienteId: cliente.id,
            data: {
              gte: hoje,
              lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        })

        if (existingSnapshot) {
          console.log(`⏭️ Snapshot já existe para hoje - cliente ${cliente.id}`)
          continue
        }

        // Criar novo snapshot
        const dailySnapshot = await prisma.dailySnapshot.create({
          data: {
            data: hoje,
            valorTotal: clienteData.valorTotalCarteira,
            clienteId: cliente.id
          }
        })

        // Criar snapshots das carteiras
        for (const carteira of clienteData.carteiras) {
          const carteiraSnapshot = await prisma.carteiraSnapshot.create({
            data: {
              carteiraId: carteira.id,
              valor: carteira.valorAtual,
              dailySnapshotId: dailySnapshot.id
            }
          })

          // Criar snapshots dos tokens
          for (const token of carteira.tokens) {
            await prisma.tokenSnapshot.create({
              data: {
                symbol: token.symbol,
                balance: token.balance,
                valueUSD: token.valueUSD,
                carteiraSnapshotId: carteiraSnapshot.id
              }
            })
          }
        }

        console.log(`✅ Snapshot criado com sucesso para cliente ${cliente.id} - Valor total: $${clienteData.valorTotalCarteira.toFixed(2)}`)

      } catch (error) {
        console.error(`❌ Erro ao processar cliente ${cliente.id}:`, error)
      }
    }

    console.log('🎉 Captura de snapshots diários concluída!')

  } catch (error) {
    console.error('💥 Erro geral na captura de snapshots:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Função para limpar snapshots antigos (manter apenas últimos 90 dias)
export async function cleanupOldSnapshots(): Promise<void> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)

    const deletedCount = await prisma.dailySnapshot.deleteMany({
      where: {
        data: {
          lt: cutoffDate
        }
      }
    })

    console.log(`🧹 Limpeza concluída: ${deletedCount.count} snapshots antigos removidos`)
  } catch (error) {
    console.error('❌ Erro na limpeza de snapshots:', error)
  }
}

// Função para executar via linha de comando
if (require.main === module) {
  captureDailySnapshots()
    .then(() => {
      console.log('✅ Script executado com sucesso')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro na execução:', error)
      process.exit(1)
    })
}
