-- Script para corrigir a tabela usuarios para usar Supabase Auth
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a constraint NOT NULL da coluna senha
ALTER TABLE usuarios ALTER COLUMN senha DROP NOT NULL;

-- 2. Ou, se preferir, remover completamente a coluna senha (recomendado)
-- ALTER TABLE usuarios DROP COLUMN IF EXISTS senha;

-- 3. Verificar se a tabela foi corrigida
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position; 