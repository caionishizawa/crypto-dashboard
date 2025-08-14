import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// GET /api/carteiras/cliente/:clienteId - Listar carteiras de um cliente
router.get('/cliente/:clienteId', async (req: Request, res: Response) => {
  try {
    const { clienteId } = req.params;

    // Verificar se o cliente pertence ao usuário
    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, usuarioId: req.user!.id }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const carteiras = await prisma.carteira.findMany({
      where: { clienteId },
      include: {
        tokens: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const carteirasFormatadas = carteiras.map(carteira => ({
      id: carteira.id,
      endereco: carteira.endereco,
      tipo: carteira.tipo,
      nome: carteira.nome,
      valorAtual: carteira.valorAtual,
      ultimaAtualizacao: carteira.ultimaAtualizacao?.toISOString(),
      tokens: carteira.tokens.map(token => ({
        symbol: token.symbol,
        balance: token.balance,
        valueUSD: token.valueUSD
      }))
    }));

    res.json(carteirasFormatadas);

  } catch (error) {
    console.error('Get carteiras error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/carteiras/:id - Obter carteira específica
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const carteira = await prisma.carteira.findUnique({
      where: { id },
      include: {
        tokens: true,
        cliente: {
          select: { id: true, usuarioId: true }
        }
      }
    });

    if (!carteira) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }

    // Verificar se a carteira pertence ao usuário
    if (carteira.cliente.usuarioId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const carteiraFormatada = {
      id: carteira.id,
      endereco: carteira.endereco,
      tipo: carteira.tipo,
      nome: carteira.nome,
      valorAtual: carteira.valorAtual,
      ultimaAtualizacao: carteira.ultimaAtualizacao?.toISOString(),
      tokens: carteira.tokens.map(token => ({
        symbol: token.symbol,
        balance: token.balance,
        valueUSD: token.valueUSD
      }))
    };

    res.json(carteiraFormatada);

  } catch (error) {
    console.error('Get carteira error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/carteiras - Criar nova carteira
router.post('/', async (req: Request, res: Response) => {
  try {
    const { endereco, tipo, nome, valorAtual, clienteId, tokens } = req.body;

    // Validações básicas
    if (!endereco || !tipo || !clienteId) {
      return res.status(400).json({ error: 'Endereço, tipo e cliente são obrigatórios' });
    }

    // Verificar se o cliente pertence ao usuário
    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, usuarioId: req.user!.id }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Verificar se endereço já existe
    const carteiraExistente = await prisma.carteira.findUnique({
      where: { endereco }
    });

    if (carteiraExistente) {
      return res.status(400).json({ error: 'Esta carteira já está cadastrada' });
    }

    // Validar endereço baseado no tipo
    if (tipo === 'ethereum' && (!endereco.startsWith('0x') || endereco.length !== 42)) {
      return res.status(400).json({ error: 'Endereço Ethereum inválido' });
    }

    if (tipo === 'solana' && (endereco.length < 32 || endereco.length > 44)) {
      return res.status(400).json({ error: 'Endereço Solana inválido' });
    }

    const carteira = await prisma.carteira.create({
      data: {
        endereco,
        tipo,
        nome,
        valorAtual,
        ultimaAtualizacao: new Date(),
        clienteId,
        tokens: tokens ? {
          create: tokens.map((token: any) => ({
            symbol: token.symbol,
            balance: token.balance,
            valueUSD: token.valueUSD
          }))
        } : undefined
      },
      include: {
        tokens: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Carteira criada com sucesso',
      carteira: {
        id: carteira.id,
        endereco: carteira.endereco,
        tipo: carteira.tipo,
        nome: carteira.nome,
        valorAtual: carteira.valorAtual,
        ultimaAtualizacao: carteira.ultimaAtualizacao?.toISOString(),
        tokens: carteira.tokens.map(token => ({
          symbol: token.symbol,
          balance: token.balance,
          valueUSD: token.valueUSD
        }))
      }
    });

  } catch (error) {
    console.error('Create carteira error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/carteiras/:id - Atualizar carteira
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, valorAtual, tokens } = req.body;

    // Verificar se carteira existe e pertence ao usuário
    const carteiraExistente = await prisma.carteira.findUnique({
      where: { id },
      include: {
        cliente: {
          select: { usuarioId: true }
        }
      }
    });

    if (!carteiraExistente) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }

    if (carteiraExistente.cliente.usuarioId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Atualizar carteira
    const carteira = await prisma.carteira.update({
      where: { id },
      data: {
        nome,
        valorAtual,
        ultimaAtualizacao: new Date()
      }
    });

    // Se tiver tokens para atualizar
    if (tokens) {
      // Remover tokens antigos
      await prisma.token.deleteMany({
        where: { carteiraId: id }
      });

      // Criar novos tokens
      await prisma.token.createMany({
        data: tokens.map((token: any) => ({
          symbol: token.symbol,
          balance: token.balance,
          valueUSD: token.valueUSD,
          carteiraId: id
        }))
      });
    }

    // Buscar carteira atualizada com tokens
    const carteiraAtualizada = await prisma.carteira.findUnique({
      where: { id },
      include: { tokens: true }
    });

    res.json({
      success: true,
      message: 'Carteira atualizada com sucesso',
      carteira: {
        id: carteiraAtualizada!.id,
        endereco: carteiraAtualizada!.endereco,
        tipo: carteiraAtualizada!.tipo,
        nome: carteiraAtualizada!.nome,
        valorAtual: carteiraAtualizada!.valorAtual,
        ultimaAtualizacao: carteiraAtualizada!.ultimaAtualizacao?.toISOString(),
        tokens: carteiraAtualizada!.tokens.map(token => ({
          symbol: token.symbol,
          balance: token.balance,
          valueUSD: token.valueUSD
        }))
      }
    });

  } catch (error) {
    console.error('Update carteira error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/carteiras/:id - Remover carteira
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se carteira existe e pertence ao usuário
    const carteiraExistente = await prisma.carteira.findUnique({
      where: { id },
      include: {
        cliente: {
          select: { usuarioId: true }
        }
      }
    });

    if (!carteiraExistente) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }

    if (carteiraExistente.cliente.usuarioId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.carteira.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Carteira removida com sucesso'
    });

  } catch (error) {
    console.error('Delete carteira error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/carteiras/:id/refresh - Atualizar dados da carteira das APIs
router.post('/:id/refresh', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se carteira existe e pertence ao usuário
    const carteira = await prisma.carteira.findUnique({
      where: { id },
      include: {
        cliente: {
          select: { usuarioId: true }
        }
      }
    });

    if (!carteira) {
      return res.status(404).json({ error: 'Carteira não encontrada' });
    }

    if (carteira.cliente.usuarioId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Simular busca de dados atualizados (aqui você integraria com APIs reais)
    const dadosSimulados = {
      valorAtual: Math.random() * 50000 + 1000,
      tokens: [
        {
          symbol: carteira.tipo === 'solana' ? 'SOL' : 'ETH',
          balance: Math.random() * 10,
          valueUSD: Math.random() * 15000
        },
        {
          symbol: 'USDC',
          balance: Math.random() * 5000,
          valueUSD: Math.random() * 5000
        }
      ]
    };

    // Atualizar carteira
    const carteiraAtualizada = await prisma.carteira.update({
      where: { id },
      data: {
        valorAtual: dadosSimulados.valorAtual,
        ultimaAtualizacao: new Date()
      }
    });

    // Atualizar tokens
    await prisma.token.deleteMany({ where: { carteiraId: id } });
    await prisma.token.createMany({
      data: dadosSimulados.tokens.map(token => ({
        symbol: token.symbol,
        balance: token.balance,
        valueUSD: token.valueUSD,
        carteiraId: id
      }))
    });

    // Buscar dados atualizados
    const resultado = await prisma.carteira.findUnique({
      where: { id },
      include: { tokens: true }
    });

    res.json({
      success: true,
      message: 'Carteira atualizada com dados das APIs',
      carteira: {
        id: resultado!.id,
        endereco: resultado!.endereco,
        tipo: resultado!.tipo,
        nome: resultado!.nome,
        valorAtual: resultado!.valorAtual,
        ultimaAtualizacao: resultado!.ultimaAtualizacao?.toISOString(),
        tokens: resultado!.tokens.map(token => ({
          symbol: token.symbol,
          balance: token.balance,
          valueUSD: token.valueUSD
        }))
      }
    });

  } catch (error) {
    console.error('Refresh carteira error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 