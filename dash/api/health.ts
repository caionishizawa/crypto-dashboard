export default (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://crypto-dashboard-frontend.onrender.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: 'production',
      version: '1.0.0',
      message: 'API funcionando!'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: 'Health check failed'
    });
  }
}; 