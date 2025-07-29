-- Script corrigido para resolver o problema da coluna usuariold
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar a estrutura atual da tabela clientes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Tornar a coluna usuariold opcional (nullable)
ALTER TABLE clientes ALTER COLUMN usuariold DROP NOT NULL;

-- 3. Definir um valor padrão para usuariold (opcional)
-- ALTER TABLE clientes ALTER COLUMN usuariold SET DEFAULT 'admin';

-- 4. Verificar se foi corrigido
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND table_schema = 'public'
ORDER BY ordinal_position; 