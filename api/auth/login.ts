import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Simulação de banco de dados (em produção, use um banco real)
const users = [
  {
    id: 1,
    nome: 'Admin',
    email: 'admin@dashboard.com',
    senha: '$2b$10$8K1p/a0dFCzCwWNZyaP8pOwNL9L9Y6hQJjWFOg9zULpLPg5tQTa2m', // admin123
    tipo: 'admin'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://crypto-dusky-ten.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = users.find(u => u.email === email);

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
      process.env.JWT_SECRET || 'crypto-dashboard-jwt-secret-2024',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 