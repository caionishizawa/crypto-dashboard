-- Script para verificar a estrutura atual da tabela clientes
-- Execute este script no SQL Editor do Supabase para ver o que existe

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'clientes'
) as tabela_existe;

-- 2. Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- 3. Verificar dados existentes (se houver)
SELECT COUNT(*) as total_clientes FROM clientes;

-- 4. Verificar algumas linhas de exemplo (se houver dados)
SELECT * FROM clientes LIMIT 3; 