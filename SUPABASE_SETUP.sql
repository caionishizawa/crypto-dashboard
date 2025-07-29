-- Script de configuração do Supabase para o Dashboard
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY DEFAULT 'user-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'admin' CHECK (tipo IN ('admin', 'cliente')),
    dataRegistro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY DEFAULT 'cliente-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('bitcoin', 'conservador')),
    dataInicio DATE NOT NULL,
    investimentoInicial DECIMAL(15,2) NOT NULL DEFAULT 0,
    btcTotal DECIMAL(20,8) DEFAULT 0,
    precoMedio DECIMAL(15,2) DEFAULT 0,
    valorAtualBTC DECIMAL(15,2) DEFAULT 0,
    valorCarteiraDeFi DECIMAL(15,2) DEFAULT 0,
    totalDepositado DECIMAL(15,2) DEFAULT 0,
    valorAtualUSD DECIMAL(15,2) DEFAULT 0,
    rendimentoTotal DECIMAL(15,2) DEFAULT 0,
    apyMedio DECIMAL(5,2) DEFAULT 0,
    tempoMercado TEXT DEFAULT '0 meses',
    scoreRisco TEXT DEFAULT 'Baixo',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transaco (
    id TEXT PRIMARY KEY DEFAULT 'transacao-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'deposito')),
    btcAmount DECIMAL(20,8) DEFAULT 0,
    usdValue DECIMAL(15,2) NOT NULL,
    btcPrice DECIMAL(15,2) DEFAULT 0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de carteiras
CREATE TABLE IF NOT EXISTS carteiras (
    id TEXT PRIMARY KEY DEFAULT 'carteira-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    endereco TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('solana', 'ethereum')),
    valorAtual DECIMAL(15,2) DEFAULT 0,
    tokens JSONB DEFAULT '[]',
    ultimaAtualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de snapshots diários
CREATE TABLE IF NOT EXISTS snapshots (
    id TEXT PRIMARY KEY DEFAULT 'snapshot-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    valorTotal DECIMAL(15,2) NOT NULL,
    valorBTC DECIMAL(15,2) DEFAULT 0,
    valorDeFi DECIMAL(15,2) DEFAULT 0,
    rendimento DECIMAL(15,2) DEFAULT 0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de dados de performance (para gráficos)
CREATE TABLE IF NOT EXISTS desempenho_data (
    id TEXT PRIMARY KEY DEFAULT 'perf-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    mes TEXT NOT NULL,
    btcPuro DECIMAL(15,2) DEFAULT 0,
    btcDeFi DECIMAL(15,2) DEFAULT 0,
    usdParado DECIMAL(15,2) DEFAULT 0,
    usdDeFi DECIMAL(15,2) DEFAULT 0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_clientes_tipo ON clientes(tipo);
CREATE INDEX IF NOT EXISTS idx_transaco_cliente_id ON transaco(cliente_id);
CREATE INDEX IF NOT EXISTS idx_transaco_data ON transaco(data);
CREATE INDEX IF NOT EXISTS idx_carteiras_cliente_id ON carteiras(cliente_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_cliente_id ON snapshots(cliente_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_data ON snapshots(data);

-- Função para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updatedAt
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carteiras_updated_at BEFORE UPDATE ON carteiras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (id, nome, email, senha, tipo, dataRegistro) 
VALUES (
    'admin-001',
    'Administrador',
    'admin@dashboard.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', -- admin123
    'admin',
    '2024-01-01'
) ON CONFLICT (id) DO NOTHING;

-- Inserir alguns clientes de exemplo
INSERT INTO clientes (id, nome, tipo, dataInicio, investimentoInicial, btcTotal, precoMedio, valorAtualBTC, valorCarteiraDeFi, apyMedio, tempoMercado, scoreRisco) 
VALUES 
(
    'cliente-a-001',
    'João Silva',
    'bitcoin',
    '2024-01-01',
    50000,
    0.0511,
    48920,
    95000,
    268000,
    24.5,
    '12 meses',
    'Médio-Alto'
),
(
    'cliente-b-002',
    'Maria Santos',
    'conservador',
    '2024-01-01',
    100000,
    0,
    0,
    0,
    0,
    15.0,
    '12 meses',
    'Baixo'
) ON CONFLICT (id) DO NOTHING;

-- Inserir transações de exemplo
INSERT INTO transaco (cliente_id, data, tipo, btcAmount, usdValue, btcPrice) 
VALUES 
('cliente-a-001', '2024-01-01', 'compra', 0.0125, 50000, 40000),
('cliente-a-001', '2024-03-15', 'compra', 0.0105, 52500, 50000),
('cliente-a-001', '2024-06-20', 'compra', 0.0133, 47500, 35700),
('cliente-a-001', '2024-09-10', 'compra', 0.0095, 50000, 52600),
('cliente-a-001', '2024-12-01', 'compra', 0.0053, 50000, 94300),
('cliente-b-002', '2024-01-01', 'deposito', 0, 100000, 0),
('cliente-b-002', '2024-04-01', 'deposito', 0, 50000, 0),
('cliente-b-002', '2024-07-01', 'deposito', 0, 50000, 0),
('cliente-b-002', '2024-10-01', 'deposito', 0, 50000, 0);

-- Configurar RLS (Row Level Security) se necessário
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transaco ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE carteiras ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE desempenho_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (descomente se quiser usar RLS)
-- CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios FOR SELECT USING (auth.uid()::text = id);
-- CREATE POLICY "Admins podem ver todos os clientes" ON clientes FOR ALL USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND tipo = 'admin'));
-- CREATE POLICY "Admins podem ver todas as transações" ON transaco FOR ALL USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND tipo = 'admin')); 