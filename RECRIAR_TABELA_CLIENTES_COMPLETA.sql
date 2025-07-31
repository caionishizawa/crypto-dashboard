-- Script para recriar a tabela clientes com estrutura completa
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar a estrutura atual
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- 2. Fazer backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS clientes_backup AS 
SELECT * FROM clientes;

-- 3. Dropar a tabela atual
DROP TABLE IF EXISTS clientes CASCADE;

-- 4. Recriar a tabela com estrutura completa
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('bitcoin', 'conservador')),
    data_inicio DATE,
    investimento_inicial DECIMAL(15,2) DEFAULT 0,
    btc_total DECIMAL(20,8) DEFAULT 0,
    preco_medio DECIMAL(15,2) DEFAULT 0,
    valor_atual_btc DECIMAL(15,2) DEFAULT 0,
    valor_carteira_defi DECIMAL(15,2) DEFAULT 0,
    total_depositado DECIMAL(15,2) DEFAULT 0,
    valor_atual_usd DECIMAL(15,2) DEFAULT 0,
    rendimento_total DECIMAL(15,2) DEFAULT 0,
    apy_medio DECIMAL(10,2) DEFAULT 0,
    tempo_mercado VARCHAR(50) DEFAULT '',
    score_risco VARCHAR(20) DEFAULT '',
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Adicionar comentários
COMMENT ON TABLE clientes IS 'Tabela de clientes do dashboard de criptomoedas';
COMMENT ON COLUMN clientes.id IS 'ID único do cliente';
COMMENT ON COLUMN clientes.nome IS 'Nome do cliente';
COMMENT ON COLUMN clientes.tipo IS 'Tipo de estratégia: bitcoin ou conservador';
COMMENT ON COLUMN clientes.data_inicio IS 'Data de início do investimento';
COMMENT ON COLUMN clientes.investimento_inicial IS 'Valor inicial investido';
COMMENT ON COLUMN clientes.btc_total IS 'Total de Bitcoin acumulado';
COMMENT ON COLUMN clientes.preco_medio IS 'Preço médio de compra do Bitcoin';
COMMENT ON COLUMN clientes.valor_atual_btc IS 'Valor atual em Bitcoin';
COMMENT ON COLUMN clientes.valor_carteira_defi IS 'Valor atual da carteira DeFi';
COMMENT ON COLUMN clientes.total_depositado IS 'Total depositado pelo cliente';
COMMENT ON COLUMN clientes.valor_atual_usd IS 'Valor atual total em USD';
COMMENT ON COLUMN clientes.rendimento_total IS 'Rendimento total acumulado';
COMMENT ON COLUMN clientes.apy_medio IS 'APY médio em porcentagem';
COMMENT ON COLUMN clientes.tempo_mercado IS 'Tempo no mercado';
COMMENT ON COLUMN clientes.score_risco IS 'Score de risco do cliente';
COMMENT ON COLUMN clientes.usuario_id IS 'ID do usuário que criou o cliente';

-- 6. Criar índices para performance
CREATE INDEX idx_clientes_usuario_id ON clientes(usuario_id);
CREATE INDEX idx_clientes_tipo ON clientes(tipo);
CREATE INDEX idx_clientes_created_at ON clientes(created_at);

-- 7. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Restaurar dados do backup (se existirem)
-- Descomente as linhas abaixo se quiser restaurar dados antigos
-- INSERT INTO clientes (nome, tipo, data_inicio, investimento_inicial, btc_total, preco_medio, valor_atual_btc, valor_carteira_defi, total_depositado, valor_atual_usd, rendimento_total, apy_medio, tempo_mercado, score_risco, usuario_id)
-- SELECT nome, tipo, data_inicio, investimento_inicial, btc_total, preco_medio, valor_atual_btc, valor_carteira_defi, total_depositado, valor_atual_usd, rendimento_total, apy_medio, tempo_mercado, score_risco, usuario_id
-- FROM clientes_backup;

-- 9. Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- 10. Limpar backup (opcional)
-- DROP TABLE IF EXISTS clientes_backup; 