-- Script para verificar e corrigir a estrutura da tabela clientes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- 2. Adicionar colunas que podem estar faltando
-- APY Médio
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'apy_medio'
    ) THEN
        ALTER TABLE clientes ADD COLUMN apy_medio DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Coluna apy_medio adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna apy_medio já existe';
    END IF;
END $$;

-- Tempo no Mercado
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'tempo_mercado'
    ) THEN
        ALTER TABLE clientes ADD COLUMN tempo_mercado VARCHAR(50) DEFAULT '';
        RAISE NOTICE 'Coluna tempo_mercado adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna tempo_mercado já existe';
    END IF;
END $$;

-- Score de Risco
DO $$ 
BEGIN
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

-- 3. Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position; 