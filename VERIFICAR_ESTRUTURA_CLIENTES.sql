-- Script para verificar a estrutura completa da tabela clientes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar todas as colunas da tabela clientes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  is_identity
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela
SELECT 
  constraint_name,
  constraint_type,
  table_name,
  column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'clientes'
AND tc.table_schema = 'public';

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_clientes FROM clientes;

-- 4. Verificar uma linha de exemplo (se houver dados)
SELECT * FROM clientes LIMIT 1; 