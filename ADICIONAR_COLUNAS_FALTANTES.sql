-- Script simples para adicionar colunas faltantes na tabela clientes
-- Execute este script no SQL Editor do Supabase

-- Verificar estrutura atual
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- Adicionar colunas que podem estar faltando
DO $$ 
BEGIN
    -- btc_total
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'btc_total'
    ) THEN
        ALTER TABLE clientes ADD COLUMN btc_total DECIMAL(20,8) DEFAULT 0;
        RAISE NOTICE 'Coluna btc_total adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna btc_total já existe';
    END IF;

    -- preco_medio
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'preco_medio'
    ) THEN
        ALTER TABLE clientes ADD COLUMN preco_medio DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Coluna preco_medio adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna preco_medio já existe';
    END IF;

    -- valor_atual_btc
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'valor_atual_btc'
    ) THEN
        ALTER TABLE clientes ADD COLUMN valor_atual_btc DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Coluna valor_atual_btc adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna valor_atual_btc já existe';
    END IF;

    -- valor_carteira_defi
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'valor_carteira_defi'
    ) THEN
        ALTER TABLE clientes ADD COLUMN valor_carteira_defi DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Coluna valor_carteira_defi adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna valor_carteira_defi já existe';
    END IF;

    -- total_depositado
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'total_depositado'
    ) THEN
        ALTER TABLE clientes ADD COLUMN total_depositado DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Coluna total_depositado adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna total_depositado já existe';
    END IF;

    -- valor_atual_usd
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'valor_atual_usd'
    ) THEN
        ALTER TABLE clientes ADD COLUMN valor_atual_usd DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Coluna valor_atual_usd adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna valor_atual_usd já existe';
    END IF;

    -- rendimento_total
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'rendimento_total'
    ) THEN
        ALTER TABLE clientes ADD COLUMN rendimento_total DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Coluna rendimento_total adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna rendimento_total já existe';
    END IF;

    -- apy_medio
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'apy_medio'
    ) THEN
        ALTER TABLE clientes ADD COLUMN apy_medio DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Coluna apy_medio adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna apy_medio já existe';
    END IF;

    -- tempo_mercado
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'tempo_mercado'
    ) THEN
        ALTER TABLE clientes ADD COLUMN tempo_mercado VARCHAR(50) DEFAULT '';
        RAISE NOTICE 'Coluna tempo_mercado adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna tempo_mercado já existe';
    END IF;

    -- score_risco
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'score_risco'
    ) THEN
        ALTER TABLE clientes ADD COLUMN score_risco VARCHAR(20) DEFAULT '';
        RAISE NOTICE 'Coluna score_risco adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna score_risco já existe';
    END IF;

END $$;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position; 