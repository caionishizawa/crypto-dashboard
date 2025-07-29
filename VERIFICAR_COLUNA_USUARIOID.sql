-- Script para verificar a coluna usuariold
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a coluna usuariold existe e sua estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND table_schema = 'public'
AND column_name = 'usuariold';

-- 2. Verificar se há dados na coluna usuariold
SELECT 
  COUNT(*) as total_clientes,
  COUNT(usuariold) as clientes_com_usuario,
  COUNT(*) - COUNT(usuariold) as clientes_sem_usuario
FROM clientes;

-- 3. Verificar se a coluna é referenciada em outras tabelas (foreign key)
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'clientes'
AND kcu.column_name = 'usuariold';

-- 4. Verificar se há triggers ou funções que usam essa coluna
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'clientes'
AND action_statement LIKE '%usuariold%'; 