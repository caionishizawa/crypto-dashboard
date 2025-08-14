import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, confirmarSenha } = req.body;

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({ error: 'As senhas não coincidem' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar se email já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar usuário
    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        tipo: 'admin' // Por padrão criar como admin
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        dataRegistro: true
      }
    });

    // Gerar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        ...user,
        dataRegistro: user.dataRegistro.toISOString().split('T')[0]
      },
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        tipo: true,
        dataRegistro: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        dataRegistro: user.dataRegistro.toISOString().split('T')[0]
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/me - Obter dados do usuário atual
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        dataRegistro: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      user: {
        ...user,
        dataRegistro: user.dataRegistro.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/refresh - Renovar token
router.post('/refresh', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Gerar novo token
    const token = jwt.sign(
      { id: req.user!.id, email: req.user!.email, tipo: req.user!.tipo },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token
    });

  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 