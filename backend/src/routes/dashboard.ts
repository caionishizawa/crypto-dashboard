import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// GET /api/dashboard/stats - Estatísticas gerais do usuário
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Buscar estatísticas básicas
    const [
      totalClientes,
      totalCarteiras,
      totalTransacoes,
      valorTotalInvestido,
      clientesRecentes
    ] = await Promise.all([
      // Total de clientes
      prisma.cliente.count({
        where: { usuarioId: userId }
      }),

      // Total de carteiras
      prisma.carteira.count({
        where: {
          cliente: { usuarioId: userId }
        }
      }),

      // Total de transações
      prisma.transacao.count({
        where: {
          cliente: { usuarioId: userId }
        }
      }),

      // Valor total investido
      prisma.cliente.aggregate({
        where: { usuarioId: userId },
        _sum: {
          investimentoInicial: true,
          valorAtualUSD: true
        }
      }),

      // Clientes recentes (últimos 5)
      prisma.cliente.findMany({
        where: { usuarioId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nome: true,
          tipo: true,
          investimentoInicial: true,
          valorAtualUSD: true,
          createdAt: true
        }
      })
    ]);

    // Calcular rendimento total
    const investimentoTotal = valorTotalInvestido._sum.investimentoInicial || 0;
    const valorAtualTotal = valorTotalInvestido._sum.valorAtualUSD || 0;
    const rendimentoTotal = valorAtualTotal - investimentoTotal;
    const percentualRendimento = investimentoTotal > 0 ? 
      ((rendimentoTotal / investimentoTotal) * 100) : 0;

    res.json({
      totalClientes,
      totalCarteiras,
      totalTransacoes,
      investimentoTotal,
      valorAtualTotal,
      rendimentoTotal,
      percentualRendimento,
      clientesRecentes: clientesRecentes.map(cliente => ({
        id: cliente.id,
        nome: cliente.nome,
        tipo: cliente.tipo,
        investimentoInicial: cliente.investimentoInicial,
        valorAtualUSD: cliente.valorAtualUSD,
        createdAt: cliente.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/performance - Dados de performance para gráficos
router.get('/performance', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Buscar snapshots dos últimos 30 dias
    const snapshots = await prisma.dailySnapshot.findMany({
      where: {
        cliente: { usuarioId: userId },
        data: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
        }
      },
      orderBy: { data: 'asc' },
      include: {
        cliente: {
          select: { nome: true, tipo: true }
        }
      }
    });

    // Agrupar por data
    const performancePorData = snapshots.reduce((acc, snapshot) => {
      const data = snapshot.data.toISOString().split('T')[0];
      
      if (!acc[data]) {
        acc[data] = {
          data,
          valorTotal: 0,
          bitcoin: 0,
          defi: 0
        };
      }

      acc[data].valorTotal += snapshot.valorTotal;
      
      if (snapshot.cliente.tipo === 'bitcoin') {
        acc[data].bitcoin += snapshot.valorTotal;
      } else {
        acc[data].defi += snapshot.valorTotal;
      }

      return acc;
    }, {} as Record<string, any>);

    const performanceArray = Object.values(performancePorData);

    res.json(performanceArray);

  } catch (error) {
    console.error('Get dashboard performance error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/distribution - Distribuição de investimentos
router.get('/distribution', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Distribuição por tipo de cliente
    const distribuicaoTipo = await prisma.cliente.groupBy({
      by: ['tipo'],
      where: { usuarioId: userId },
      _count: { tipo: true },
      _sum: { 
        investimentoInicial: true,
        valorAtualUSD: true 
      }
    });

    // Distribuição por tipo de carteira
    const distribuicaoCarteira = await prisma.carteira.groupBy({
      by: ['tipo'],
      where: {
        cliente: { usuarioId: userId }
      },
      _count: { tipo: true },
      _sum: { valorAtual: true }
    });

    res.json({
      porTipoCliente: distribuicaoTipo.map(item => ({
        tipo: item.tipo,
        quantidade: item._count.tipo,
        investimentoInicial: item._sum.investimentoInicial || 0,
        valorAtual: item._sum.valorAtualUSD || 0
      })),
      porTipoCarteira: distribuicaoCarteira.map(item => ({
        tipo: item.tipo,
        quantidade: item._count.tipo,
        valorTotal: item._sum.valorAtual || 0
      }))
    });

  } catch (error) {
    console.error('Get dashboard distribution error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/recent-activity - Atividades recentes
router.get('/recent-activity', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Transações recentes (últimas 10)
    const transacoesRecentes = await prisma.transacao.findMany({
      where: {
        cliente: { usuarioId: userId }
      },
      take: 10,
      orderBy: { data: 'desc' },
      include: {
        cliente: {
          select: { nome: true }
        }
      }
    });

    // Carteiras adicionadas recentemente (últimas 5)
    const carteirasRecentes = await prisma.carteira.findMany({
      where: {
        cliente: { usuarioId: userId }
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: {
          select: { nome: true }
        }
      }
    });

    res.json({
      transacoes: transacoesRecentes.map(t => ({
        id: t.id,
        data: t.data.toISOString().split('T')[0],
        tipo: t.tipo,
        valor: t.usdValue,
        btcAmount: t.btcAmount,
        cliente: t.cliente.nome,
        createdAt: t.createdAt.toISOString()
      })),
      carteiras: carteirasRecentes.map(c => ({
        id: c.id,
        endereco: c.endereco.substring(0, 8) + '...',
        tipo: c.tipo,
        nome: c.nome,
        cliente: c.cliente.nome,
        createdAt: c.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Get dashboard recent activity error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 