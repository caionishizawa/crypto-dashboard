import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (cuidado em produção!)
  await prisma.carteiraSnapshot.deleteMany();
  await prisma.tokenSnapshot.deleteMany();
  await prisma.dailySnapshot.deleteMany();
  await prisma.token.deleteMany();
  await prisma.carteira.deleteMany();
  await prisma.transacao.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.performanceData.deleteMany();

  // 1. Criar usuário administrador
  console.log('👤 Criando usuário administrador...');
  const senhaAdmin = await bcrypt.hash('admin123', 10);
  const usuarioAdmin = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@dashboard.com',
      senha: senhaAdmin,
      tipo: 'admin'
    }
  });

  // 2. Criar usuário cliente
  console.log('👤 Criando usuário cliente...');
  const senhaCliente = await bcrypt.hash('cliente123', 10);
  const usuarioCliente = await prisma.usuario.create({
    data: {
      nome: 'Cliente Exemplo',
      email: 'cliente@dashboard.com',
      senha: senhaCliente,
      tipo: 'cliente'
    }
  });

  // 3. Criar clientes de exemplo
  console.log('🏦 Criando clientes de exemplo...');
  
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: 'João Silva',
      tipo: 'bitcoin',
      dataInicio: new Date('2023-01-15'),
      investimentoInicial: 50000,
      btcTotal: 2.5,
      precoMedio: 20000,
      valorAtualBTC: 105000,
      valorCarteiraDeFi: 25000,
      totalDepositado: 75000,
      valorAtualUSD: 130000,
      rendimentoTotal: 55000,
      apyMedio: 73.33,
      tempoMercado: '1 ano e 2 meses',
      scoreRisco: 'Moderado',
      usuarioId: usuarioAdmin.id
    }
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: 'Maria Santos',
      tipo: 'conservador',
      dataInicio: new Date('2023-03-10'),
      investimentoInicial: 25000,
      btcTotal: 0.8,
      precoMedio: 31250,
      valorAtualBTC: 33600,
      valorCarteiraDeFi: 15000,
      totalDepositado: 40000,
      valorAtualUSD: 48600,
      rendimentoTotal: 8600,
      apyMedio: 25.8,
      tempoMercado: '10 meses',
      scoreRisco: 'Baixo',
      usuarioId: usuarioAdmin.id
    }
  });

  const cliente3 = await prisma.cliente.create({
    data: {
      nome: 'Carlos Oliveira',
      tipo: 'bitcoin',
      dataInicio: new Date('2022-11-20'),
      investimentoInicial: 100000,
      btcTotal: 5.2,
      precoMedio: 19230,
      valorAtualBTC: 218400,
      valorCarteiraDeFi: 45000,
      totalDepositado: 125000,
      valorAtualUSD: 263400,
      rendimentoTotal: 138400,
      apyMedio: 110.72,
      tempoMercado: '1 ano e 4 meses',
      scoreRisco: 'Alto',
      usuarioId: usuarioAdmin.id
    }
  });

  // 4. Criar transações de exemplo
  console.log('💰 Criando transações de exemplo...');
  
  const transacoes = [
    {
      data: new Date('2023-01-15'),
      tipo: 'deposito',
      usdValue: 50000,
      clienteId: cliente1.id
    },
    {
      data: new Date('2023-01-15'),
      tipo: 'compra',
      btcAmount: 2.5,
      usdValue: 50000,
      btcPrice: 20000,
      clienteId: cliente1.id
    },
    {
      data: new Date('2023-02-20'),
      tipo: 'deposito',
      usdValue: 25000,
      clienteId: cliente1.id
    },
    {
      data: new Date('2023-03-10'),
      tipo: 'deposito',
      usdValue: 25000,
      clienteId: cliente2.id
    },
    {
      data: new Date('2023-03-10'),
      tipo: 'compra',
      btcAmount: 0.8,
      usdValue: 25000,
      btcPrice: 31250,
      clienteId: cliente2.id
    },
    {
      data: new Date('2023-04-15'),
      tipo: 'deposito',
      usdValue: 15000,
      clienteId: cliente2.id
    }
  ];

  for (const transacao of transacoes) {
    await prisma.transacao.create({ data: transacao });
  }

  // 5. Criar carteiras de exemplo
  console.log('🏦 Criando carteiras de exemplo...');
  
  const carteira1 = await prisma.carteira.create({
    data: {
      endereco: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      tipo: 'solana',
      nome: 'Carteira Solana Principal',
      valorAtual: 75000,
      ultimaAtualizacao: new Date(),
      clienteId: cliente1.id
    }
  });

  const carteira2 = await prisma.carteira.create({
    data: {
      endereco: '0x742d35Cc6634C0532925a3b8D8132A6B5F6C9f6a',
      tipo: 'ethereum',
      nome: 'Carteira Ethereum DeFi',
      valorAtual: 55000,
      ultimaAtualizacao: new Date(),
      clienteId: cliente1.id
    }
  });

  const carteira3 = await prisma.carteira.create({
    data: {
      endereco: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      tipo: 'solana',
      nome: 'Carteira Solana Conservadora',
      valorAtual: 48600,
      ultimaAtualizacao: new Date(),
      clienteId: cliente2.id
    }
  });

  // 6. Criar tokens de exemplo
  console.log('🪙 Criando tokens de exemplo...');
  
  const tokens = [
    {
      symbol: 'SOL',
      balance: 850,
      valueUSD: 45000,
      carteiraId: carteira1.id
    },
    {
      symbol: 'USDC',
      balance: 30000,
      valueUSD: 30000,
      carteiraId: carteira1.id
    },
    {
      symbol: 'ETH',
      balance: 15,
      valueUSD: 35000,
      carteiraId: carteira2.id
    },
    {
      symbol: 'USDT',
      balance: 20000,
      valueUSD: 20000,
      carteiraId: carteira2.id
    },
    {
      symbol: 'SOL',
      balance: 600,
      valueUSD: 31800,
      carteiraId: carteira3.id
    },
    {
      symbol: 'USDC',
      balance: 16800,
      valueUSD: 16800,
      carteiraId: carteira3.id
    }
  ];

  for (const token of tokens) {
    await prisma.token.create({ data: token });
  }

  // 7. Criar dados de performance
  console.log('📊 Criando dados de performance...');
  
  const performanceData = [
    { month: '2023-01', btcPuro: 5.2, btcDeFi: 8.7, usdParado: 0.5, usdDeFi: 2.1 },
    { month: '2023-02', btcPuro: 12.8, btcDeFi: 15.3, usdParado: 0.4, usdDeFi: 3.2 },
    { month: '2023-03', btcPuro: -8.5, btcDeFi: -5.2, usdParado: 0.4, usdDeFi: 1.8 },
    { month: '2023-04', btcPuro: 18.2, btcDeFi: 22.1, usdParado: 0.3, usdDeFi: 4.5 },
    { month: '2023-05', btcPuro: 7.8, btcDeFi: 11.2, usdParado: 0.4, usdDeFi: 2.9 },
    { month: '2023-06', btcPuro: 15.4, btcDeFi: 19.8, usdParado: 0.5, usdDeFi: 3.7 },
    { month: '2023-07', btcPuro: 9.3, btcDeFi: 13.6, usdParado: 0.4, usdDeFi: 2.4 },
    { month: '2023-08', btcPuro: -3.2, btcDeFi: 1.8, usdParado: 0.3, usdDeFi: 1.2 },
    { month: '2023-09', btcPuro: 11.7, btcDeFi: 16.4, usdParado: 0.4, usdDeFi: 3.8 },
    { month: '2023-10', btcPuro: 22.5, btcDeFi: 28.3, usdParado: 0.5, usdDeFi: 5.1 },
    { month: '2023-11', btcPuro: 35.8, btcDeFi: 42.7, usdParado: 0.4, usdDeFi: 7.2 },
    { month: '2023-12', btcPuro: 41.2, btcDeFi: 48.9, usdParado: 0.5, usdDeFi: 8.4 }
  ];

  for (const data of performanceData) {
    await prisma.performanceData.create({ data });
  }

  // 8. Criar snapshots diários de exemplo
  console.log('📈 Criando snapshots diários...');
  
  const hoje = new Date();
  for (let i = 30; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);

    // Snapshot para cliente1
    await prisma.dailySnapshot.create({
      data: {
        data: data,
        valorTotal: 130000 + (Math.random() - 0.5) * 10000,
        clienteId: cliente1.id
      }
    });

    // Snapshot para cliente2
    await prisma.dailySnapshot.create({
      data: {
        data: data,
        valorTotal: 48600 + (Math.random() - 0.5) * 5000,
        clienteId: cliente2.id
      }
    });

    // Snapshot para cliente3
    await prisma.dailySnapshot.create({
      data: {
        data: data,
        valorTotal: 263400 + (Math.random() - 0.5) * 20000,
        clienteId: cliente3.id
      }
    });
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('👤 Usuários criados:');
  console.log('- Admin: admin@dashboard.com (senha: admin123)');
  console.log('- Cliente: cliente@dashboard.com (senha: cliente123)');
  console.log('');
  console.log('📊 Dados criados:');
  console.log('- 2 usuários');
  console.log('- 3 clientes');
  console.log('- 6 transações');
  console.log('- 3 carteiras');
  console.log('- 6 tokens');
  console.log('- 12 meses de performance');
  console.log('- 93 snapshots diários');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 