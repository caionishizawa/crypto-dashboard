import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Buscar histórico de snapshots de um cliente
router.get('/cliente/:clienteId', authenticateToken, async (req, res) => {
  try {
    const { clienteId } = req.params
    const { periodo = '30' } = req.query // dias, padrão 30

    const dias = parseInt(periodo as string)
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - dias)

    const snapshots = await prisma.dailySnapshot.findMany({
      where: {
        clienteId,
        data: {
          gte: dataInicio
        }
      },
      include: {
        carteiraSnapshots: {
          include: {
            tokens: true
          }
        }
      },
      orderBy: {
        data: 'asc'
      }
    })

    res.json({
      success: true,
      data: snapshots,
      periodo: `${dias} dias`
    })
  } catch (error) {
    console.error('Erro ao buscar snapshots:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// Buscar breakdown por projeto/investimento
router.get('/cliente/:clienteId/breakdown', authenticateToken, async (req, res) => {
  try {
    const { clienteId } = req.params
    const { data } = req.query

    let whereClause: any = { clienteId }
    
    if (data) {
      const dataFiltro = new Date(data as string)
      dataFiltro.setHours(0, 0, 0, 0)
      whereClause.data = dataFiltro
    } else {
      // Buscar snapshot mais recente
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      whereClause.data = {
        gte: hoje
      }
    }

    const snapshot = await prisma.dailySnapshot.findFirst({
      where: whereClause,
      include: {
        carteiraSnapshots: {
          include: {
            tokens: true
          }
        }
      },
      orderBy: {
        data: 'desc'
      }
    })

    if (!snapshot) {
      return res.status(404).json({
        success: false,
        error: 'Snapshot não encontrado'
      })
    }

    // Calcular breakdown por projeto
    const breakdown = snapshot.carteiraSnapshots.map(carteira => {
      const tokensBreakdown = carteira.tokens.map(token => ({
        symbol: token.symbol,
        balance: token.balance,
        valueUSD: token.valueUSD,
        percentage: (token.valueUSD / carteira.valor) * 100
      }))

      return {
        carteiraId: carteira.carteiraId,
        valor: carteira.valor,
        percentage: (carteira.valor / snapshot.valorTotal) * 100,
        tokens: tokensBreakdown
      }
    })

    res.json({
      success: true,
      data: {
        snapshotId: snapshot.id,
        data: snapshot.data,
        valorTotal: snapshot.valorTotal,
        breakdown
      }
    })
  } catch (error) {
    console.error('Erro ao buscar breakdown:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// Buscar evolução patrimonial (dados para gráfico)
router.get('/cliente/:clienteId/evolucao', authenticateToken, async (req, res) => {
  try {
    const { clienteId } = req.params
    const { periodo = '30' } = req.query

    const dias = parseInt(periodo as string)
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - dias)

    const snapshots = await prisma.dailySnapshot.findMany({
      where: {
        clienteId,
        data: {
          gte: dataInicio
        }
      },
      select: {
        id: true,
        data: true,
        valorTotal: true
      },
      orderBy: {
        data: 'asc'
      }
    })

    // Calcular variação percentual
    const evolucao = snapshots.map((snapshot, index) => {
      const variacao = index > 0 
        ? ((snapshot.valorTotal - snapshots[index - 1].valorTotal) / snapshots[index - 1].valorTotal) * 100
        : 0

      return {
        data: snapshot.data,
        valorTotal: snapshot.valorTotal,
        variacaoPercentual: variacao
      }
    })

    res.json({
      success: true,
      data: evolucao,
      periodo: `${dias} dias`
    })
  } catch (error) {
    console.error('Erro ao buscar evolução:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// Executar snapshot manual (apenas admin)
router.post('/executar', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id }
    })

    if (!user || user.tipo !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado - apenas administradores'
      })
    }

    // Importar e executar snapshot
    const { captureDailySnapshots } = require('../utils/snapshotService')
    await captureDailySnapshots()

    res.json({
      success: true,
      message: 'Snapshot executado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao executar snapshot:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

export default router
