import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://crypto-dusky-ten.vercel.app');
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
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0',
      database: process.env.DATABASE_URL ? 'configured' : 'not configured'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 