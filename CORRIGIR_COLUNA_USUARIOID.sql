-- Script para corrigir a coluna usuariold na tabela clientes
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

-- 2. Renomear a coluna usuariold para usuarioId (se necessário)
ALTER TABLE clientes RENAME COLUMN IF EXISTS usuariold TO usuarioId;

-- 3. Tornar a coluna usuarioId opcional (nullable)
ALTER TABLE clientes ALTER COLUMN usuarioId DROP NOT NULL;

-- 4. Ou, se preferir, definir um valor padrão
-- ALTER TABLE clientes ALTER COLUMN usuarioId SET DEFAULT 'admin';

-- 5. Verificar se foi corrigido
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND table_schema = 'public'
ORDER BY ordinal_position; 