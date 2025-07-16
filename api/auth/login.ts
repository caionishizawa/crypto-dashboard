export default async (req, res) => {
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

    // Verificar credenciais do usuário admin
    if (email === 'admin@dashboard.com' && senha === 'admin123') {
      
      // Gerar token simples
      const userData = {
        id: 1,
        email: email,
        tipo: 'admin',
        exp: Date.now() + 24 * 60 * 60 * 1000
      };
      
      const token = btoa(JSON.stringify(userData));

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: 1,
          nome: 'Admin',
          email: 'admin@dashboard.com',
          tipo: 'admin'
        }
      });
      
    } else {
      res.status(401).json({ error: 'Email ou senha incorretos' });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Erro no login'
    });
  }
} 