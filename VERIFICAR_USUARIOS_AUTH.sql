-- Script para verificar usuários no Supabase Auth
-- Execute este script no SQL Editor do Supabase

-- Verificar todos os usuários na tabela auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Unconfirmed'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- Verificar usuários na tabela usuarios
SELECT 
  id,
  nome,
  email,
  tipo,
  dataRegistro
FROM usuarios
ORDER BY dataRegistro DESC; 