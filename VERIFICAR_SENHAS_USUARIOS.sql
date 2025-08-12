-- SCRIPT PARA VERIFICAR COMO AS SENHAS ESTÃO ARMAZENADAS
-- ⚠️ ATENÇÃO: Não é possível ver as senhas originais!

-- 1. Verificar usuários na tabela auth.users (Supabase Auth)
SELECT 
  id,
  email,
  encrypted_password, -- Este é o hash da senha (não a senha original)
  email_confirmed_at,
  created_at,
  updated_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar solicitações de usuários (nossa tabela)
SELECT 
  id,
  nome,
  email,
  senha_hash, -- Este é o hash da senha (não a senha original)
  status,
  data_solicitacao
FROM solicitacoes_usuarios
ORDER BY data_solicitacao DESC;

-- 3. Verificar usuários aprovados (nossa tabela)
SELECT 
  id,
  nome,
  email,
  tipo,
  dataRegistro
FROM usuarios
ORDER BY dataRegistro DESC;

-- 4. Contar quantos usuários existem
SELECT 
  'auth.users' as tabela,
  COUNT(*) as total_usuarios
FROM auth.users
UNION ALL
SELECT 
  'usuarios' as tabela,
  COUNT(*) as total_usuarios
FROM usuarios
UNION ALL
SELECT 
  'solicitacoes_usuarios' as tabela,
  COUNT(*) as total_usuarios
FROM solicitacoes_usuarios;

-- 5. Verificar se há senhas em texto plano (NÃO DEVERIA TER!)
SELECT 
  'usuarios' as tabela,
  COUNT(*) as usuarios_sem_senha_hash
FROM usuarios
WHERE senha_hash IS NOT NULL;

-- 6. Verificar estrutura das tabelas
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'solicitacoes_usuarios'
ORDER BY ordinal_position;
