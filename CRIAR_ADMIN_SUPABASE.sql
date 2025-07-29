-- Script para criar um usuário admin no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Inserir usuário na tabela auth.users (se não existir)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'admin@crypto.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome": "Administrador", "tipo": "admin"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Inserir dados na tabela usuarios (se não existir)
INSERT INTO usuarios (
  id,
  nome,
  email,
  tipo,
  dataRegistro,
  createdAt,
  updatedAt
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@crypto.com'),
  'Administrador',
  'admin@crypto.com',
  'admin',
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se o usuário foi criado
SELECT 
  u.id,
  u.nome,
  u.email,
  u.tipo,
  u.dataRegistro
FROM usuarios u
WHERE u.email = 'admin@crypto.com'; 