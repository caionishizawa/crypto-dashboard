-- SOLUÇÃO SIMPLES PARA O PROBLEMA DE APROVAÇÃO
-- O problema é que usuários aprovados não conseguem fazer login porque não existem no Auth

-- 1. Verificar usuários que foram aprovados mas não conseguem fazer login
SELECT 
  u.id,
  u.nome,
  u.email,
  u.tipo,
  u."dataRegistro",
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ PODE FAZER LOGIN'
    ELSE '❌ NÃO PODE FAZER LOGIN'
  END as status_login
FROM usuarios u
LEFT JOIN auth.users au ON u.email = au.email
ORDER BY u."dataRegistro" DESC;

-- 2. SOLUÇÃO: Criar usuários no Auth manualmente via Supabase Dashboard
-- Vá em Authentication > Users > Add User
-- Use os dados dos usuários que não conseguem fazer login

-- 3. Ou usar a API do Supabase para criar usuários
-- Isso precisa ser feito via backend ou Edge Functions

-- 4. SOLUÇÃO ALTERNATIVA: Modificar o fluxo de aprovação
-- Em vez de criar o usuário automaticamente, enviar instruções para o admin

-- 5. Verificar solicitações aprovadas
SELECT 
  id,
  nome,
  email,
  status,
  data_aprovacao,
  aprovado_por
FROM solicitacoes_usuarios
WHERE status = 'aprovado'
ORDER BY data_aprovacao DESC;

-- 6. Verificar se os usuários aprovados foram criados na tabela usuarios
SELECT 
  s.id as solicitacao_id,
  s.nome,
  s.email,
  s.status,
  s.data_aprovacao,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ CRIADO NA TABELA'
    ELSE '❌ NÃO CRIADO NA TABELA'
  END as status_tabela
FROM solicitacoes_usuarios s
LEFT JOIN usuarios u ON s.email = u.email
WHERE s.status = 'aprovado'
ORDER BY s.data_aprovacao DESC;

-- 7. Criar usuários que foram aprovados mas não foram criados na tabela
INSERT INTO usuarios (id, nome, email, tipo, "dataRegistro", "createdAt", "updatedAt")
SELECT 
  s.id,
  s.nome,
  s.email,
  'user',
  s.data_aprovacao,
  s.data_aprovacao,
  NOW()
FROM solicitacoes_usuarios s
LEFT JOIN usuarios u ON s.email = u.email
WHERE s.status = 'aprovado' AND u.id IS NULL
ON CONFLICT (email) DO NOTHING;

-- 8. Verificar resultado final
SELECT 
  'Total de usuários na tabela usuarios:' as descricao,
  COUNT(*) as total
FROM usuarios
UNION ALL
SELECT 
  'Total de usuários no Auth:' as descricao,
  COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
  'Usuários que podem fazer login:' as descricao,
  COUNT(*) as total
FROM usuarios u
INNER JOIN auth.users au ON u.email = au.email;
