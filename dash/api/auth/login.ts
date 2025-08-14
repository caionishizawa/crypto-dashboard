import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration missing');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async (req, res) => {
  // Configurar CORS de forma mais segura
  const allowedOrigins = [
    'https://crypto-dashboard-frontend.onrender.com',
    'https://courageous-jelly-382fd9.netlify.app',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
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

    // Usar Supabase Auth em vez de credenciais hardcoded
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    if (!data.user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Buscar dados adicionais do usuário na tabela usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo, dataRegistro')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      console.error('Erro ao buscar dados do usuário:', userError);
      return res.status(500).json({ error: 'Erro ao carregar dados do usuário' });
    }

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userData,
      session: data.session
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Erro no login'
    });
  }
} 