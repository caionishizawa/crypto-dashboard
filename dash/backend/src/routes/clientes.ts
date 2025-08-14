import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// GET /api/clientes - Listar clientes do usuário
router.get('/', async (req: Request, res: Response) => {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { usuarioId: req.user!.id },
      include: {
        transacoes: {
          orderBy: { data: 'desc' },
          take: 10 // Últimas 10 transações
        },
        carteiras: {
          include: {
            tokens: true
          }
        },
        snapshots: {
          orderBy: { data: 'desc' },
          take: 30, // Últimos 30 snapshots
          include: {
            carteiraSnapshots: {
              include: {
                tokens: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formatar dados para o frontend
    const clientesFormatados = clientes.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome,
      tipo: cliente.tipo,
      dataInicio: cliente.dataInicio.toISOString().split('T')[0],
      investimentoInicial: cliente.investimentoInicial,
      btcTotal: cliente.btcTotal,
      precoMedio: cliente.precoMedio,
      valorAtualBTC: cliente.valorAtualBTC,
      valorCarteiraDeFi: cliente.valorCarteiraDeFi,
      totalDepositado: cliente.totalDepositado,
      valorAtualUSD: cliente.valorAtualUSD,
      rendimentoTotal: cliente.rendimentoTotal,
      apyMedio: cliente.apyMedio,
      tempoMercado: cliente.tempoMercado,
      scoreRisco: cliente.scoreRisco,
      transacoes: cliente.transacoes.map(t => ({
        data: t.data.toISOString().split('T')[0],
        tipo: t.tipo,
        btcAmount: t.btcAmount,
        usdValue: t.usdValue,
        btcPrice: t.btcPrice
      })),
      carteiras: cliente.carteiras.map(c => ({
        id: c.id,
        endereco: c.endereco,
        tipo: c.tipo,
        nome: c.nome,
        valorAtual: c.valorAtual,
        ultimaAtualizacao: c.ultimaAtualizacao?.toISOString(),
        tokens: c.tokens.map(token => ({
          symbol: token.symbol,
          balance: token.balance,
          valueUSD: token.valueUSD
        }))
      })),
      snapshots: cliente.snapshots.map(s => ({
        data: s.data.toISOString().split('T')[0],
        valorTotal: s.valorTotal,
        carteiras: s.carteiraSnapshots.map(cs => ({
          carteiraId: cs.carteiraId,
          valor: cs.valor,
          tokens: cs.tokens.map(token => ({
            symbol: token.symbol,
            balance: token.balance,
            valueUSD: token.valueUSD
          }))
        }))
      }))
    }));

    res.json(clientesFormatados);

  } catch (error) {
    console.error('Get clientes error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/clientes/:id - Obter cliente específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findFirst({
      where: { 
        id,
        usuarioId: req.user!.id // Garantir que o cliente pertence ao usuário
      },
      include: {
        transacoes: {
          orderBy: { data: 'desc' }
        },
        carteiras: {
          include: {
            tokens: true
          }
        },
        snapshots: {
          orderBy: { data: 'desc' },
          include: {
            carteiraSnapshots: {
              include: {
                tokens: true
              }
            }
          }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Formatar para o frontend (mesmo formato da listagem)
    const clienteFormatado = {
      id: cliente.id,
      nome: cliente.nome,
      tipo: cliente.tipo,
      dataInicio: cliente.dataInicio.toISOString().split('T')[0],
      investimentoInicial: cliente.investimentoInicial,
      btcTotal: cliente.btcTotal,
      precoMedio: cliente.precoMedio,
      valorAtualBTC: cliente.valorAtualBTC,
      valorCarteiraDeFi: cliente.valorCarteiraDeFi,
      totalDepositado: cliente.totalDepositado,
      valorAtualUSD: cliente.valorAtualUSD,
      rendimentoTotal: cliente.rendimentoTotal,
      apyMedio: cliente.apyMedio,
      tempoMercado: cliente.tempoMercado,
      scoreRisco: cliente.scoreRisco,
      transacoes: cliente.transacoes.map(t => ({
        data: t.data.toISOString().split('T')[0],
        tipo: t.tipo,
        btcAmount: t.btcAmount,
        usdValue: t.usdValue,
        btcPrice: t.btcPrice
      })),
      carteiras: cliente.carteiras.map(c => ({
        id: c.id,
        endereco: c.endereco,
        tipo: c.tipo,
        nome: c.nome,
        valorAtual: c.valorAtual,
        ultimaAtualizacao: c.ultimaAtualizacao?.toISOString(),
        tokens: c.tokens.map(token => ({
          symbol: token.symbol,
          balance: token.balance,
          valueUSD: token.valueUSD
        }))
      })),
      snapshots: cliente.snapshots.map(s => ({
        data: s.data.toISOString().split('T')[0],
        valorTotal: s.valorTotal,
        carteiras: s.carteiraSnapshots.map(cs => ({
          carteiraId: cs.carteiraId,
          valor: cs.valor,
          tokens: cs.tokens.map(token => ({
            symbol: token.symbol,
            balance: token.balance,
            valueUSD: token.valueUSD
          }))
        }))
      }))
    };

    res.json(clienteFormatado);

  } catch (error) {
    console.error('Get cliente error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/clientes - Criar novo cliente
router.post('/', async (req: Request, res: Response) => {
  try {
    const clienteData = req.body;

    // Validações básicas
    if (!clienteData.nome || !clienteData.tipo || !clienteData.dataInicio) {
      return res.status(400).json({ error: 'Nome, tipo e data de início são obrigatórios' });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome: clienteData.nome,
        tipo: clienteData.tipo,
        dataInicio: new Date(clienteData.dataInicio),
        investimentoInicial: clienteData.investimentoInicial || 0,
        btcTotal: clienteData.btcTotal,
        precoMedio: clienteData.precoMedio,
        valorAtualBTC: clienteData.valorAtualBTC,
        valorCarteiraDeFi: clienteData.valorCarteiraDeFi,
        totalDepositado: clienteData.totalDepositado,
        valorAtualUSD: clienteData.valorAtualUSD,
        rendimentoTotal: clienteData.rendimentoTotal,
        apyMedio: clienteData.apyMedio || 0,
        tempoMercado: clienteData.tempoMercado || '',
        scoreRisco: clienteData.scoreRisco || '',
        usuarioId: req.user!.id
      },
      include: {
        transacoes: true,
        carteiras: {
          include: { tokens: true }
        },
        snapshots: {
          include: {
            carteiraSnapshots: {
              include: { tokens: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        tipo: cliente.tipo,
        dataInicio: cliente.dataInicio.toISOString().split('T')[0],
        investimentoInicial: cliente.investimentoInicial,
        btcTotal: cliente.btcTotal,
        precoMedio: cliente.precoMedio,
        valorAtualBTC: cliente.valorAtualBTC,
        valorCarteiraDeFi: cliente.valorCarteiraDeFi,
        totalDepositado: cliente.totalDepositado,
        valorAtualUSD: cliente.valorAtualUSD,
        rendimentoTotal: cliente.rendimentoTotal,
        apyMedio: cliente.apyMedio,
        tempoMercado: cliente.tempoMercado,
        scoreRisco: cliente.scoreRisco,
        transacoes: [],
        carteiras: [],
        snapshots: []
      }
    });

  } catch (error) {
    console.error('Create cliente error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clienteData = req.body;

    // Verificar se cliente existe e pertence ao usuário
    const clienteExistente = await prisma.cliente.findFirst({
      where: { id, usuarioId: req.user!.id }
    });

    if (!clienteExistente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: clienteData.nome,
        tipo: clienteData.tipo,
        dataInicio: clienteData.dataInicio ? new Date(clienteData.dataInicio) : undefined,
        investimentoInicial: clienteData.investimentoInicial,
        btcTotal: clienteData.btcTotal,
        precoMedio: clienteData.precoMedio,
        valorAtualBTC: clienteData.valorAtualBTC,
        valorCarteiraDeFi: clienteData.valorCarteiraDeFi,
        totalDepositado: clienteData.totalDepositado,
        valorAtualUSD: clienteData.valorAtualUSD,
        rendimentoTotal: clienteData.rendimentoTotal,
        apyMedio: clienteData.apyMedio,
        tempoMercado: clienteData.tempoMercado,
        scoreRisco: clienteData.scoreRisco
      }
    });

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      cliente: {
        ...cliente,
        dataInicio: cliente.dataInicio.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Update cliente error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/clientes/:id - Remover cliente
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se cliente existe e pertence ao usuário
    const clienteExistente = await prisma.cliente.findFirst({
      where: { id, usuarioId: req.user!.id }
    });

    if (!clienteExistente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    await prisma.cliente.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Cliente removido com sucesso'
    });

  } catch (error) {
    console.error('Delete cliente error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/clientes/:id/transacoes - Adicionar transação
router.post('/:id/transacoes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transacaoData = req.body;

    // Verificar se cliente existe e pertence ao usuário
    const clienteExistente = await prisma.cliente.findFirst({
      where: { id, usuarioId: req.user!.id }
    });

    if (!clienteExistente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const transacao = await prisma.transacao.create({
      data: {
        data: new Date(transacaoData.data),
        tipo: transacaoData.tipo,
        btcAmount: transacaoData.btcAmount,
        usdValue: transacaoData.usdValue,
        btcPrice: transacaoData.btcPrice,
        clienteId: id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Transação adicionada com sucesso',
      transacao: {
        data: transacao.data.toISOString().split('T')[0],
        tipo: transacao.tipo,
        btcAmount: transacao.btcAmount,
        usdValue: transacao.usdValue,
        btcPrice: transacao.btcPrice
      }
    });

  } catch (error) {
    console.error('Add transacao error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 