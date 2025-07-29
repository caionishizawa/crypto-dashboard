-- Script para corrigir a tabela clientes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar a estrutura atual da tabela clientes
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

-- 2. Adicionar sequência para ID automático (se não existir)
CREATE SEQUENCE IF NOT EXISTS clientes_id_seq;

-- 3. Alterar a coluna id para usar sequência automática
ALTER TABLE clientes ALTER COLUMN id SET DEFAULT nextval('clientes_id_seq');
ALTER TABLE clientes ALTER COLUMN id SET NOT NULL;

-- 4. Associar a sequência à coluna id
ALTER SEQUENCE clientes_id_seq OWNED BY clientes.id;

-- 5. Verificar se foi corrigido
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