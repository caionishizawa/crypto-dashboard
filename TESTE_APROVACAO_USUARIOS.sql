-- SCRIPT DE TESTE PARA VERIFICAR SE O SISTEMA DE APROVAÇÃO ESTÁ FUNCIONANDO

-- 1. Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('criar_usuario_aprovado', 'sincronizar_usuario_auth', 'marcar_usuario_auth_criado')
ORDER BY routine_name;

-- 2. Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_sincronizar_auth';

-- 3. Verificar se a coluna auth_criado foi adicionada
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'auth_criado';

-- 4. Verificar status atual dos usuários
SELECT 
  u.id,
  u.nome,
  u.email,
  u.tipo,
  u.auth_criado,
  u."dataRegistro",
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ PODE FAZER LOGIN'
    ELSE '❌ NÃO PODE FAZER LOGIN'
  END as status_login,
  CASE 
    WHEN s.id IS NOT NULL THEN '📋 TEM SOLICITAÇÃO'
    ELSE '❌ SEM SOLICITAÇÃO'
  END as tem_solicitacao
FROM usuarios u
LEFT JOIN auth.users au ON u.email = au.email
LEFT JOIN solicitacoes_usuarios s ON u.email = s.email
ORDER BY u."dataRegistro" DESC;

-- 5. Verificar solicitações aprovadas
SELECT 
  s.id,
  s.nome,
  s.email,
  s.status,
  s.data_aprovacao,
  s.aprovado_por,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ CRIADO NA TABELA'
    ELSE '❌ NÃO CRIADO NA TABELA'
  END as status_tabela,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ CRIADO NO AUTH'
    ELSE '❌ NÃO CRIADO NO AUTH'
  END as status_auth
FROM solicitacoes_usuarios s
LEFT JOIN usuarios u ON s.email = u.email
LEFT JOIN auth.users au ON s.email = au.email
WHERE s.status = 'aprovado'
ORDER BY s.data_aprovacao DESC;

-- 6. Testar a função RPC (se existir)
-- SELECT criar_usuario_aprovado('teste.rpc@exemplo.com', 'Usuário Teste RPC');

-- 7. Estatísticas gerais
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
INNER JOIN auth.users au ON u.email = au.email
UNION ALL
SELECT 
  'Solicitações aprovadas:' as descricao,
  COUNT(*) as total
FROM solicitacoes_usuarios
WHERE status = 'aprovado'
UNION ALL
SELECT 
  'Solicitações pendentes:' as descricao,
  COUNT(*) as total
FROM solicitacoes_usuarios
WHERE status = 'pendente';

-- 8. Verificar se há usuários que precisam ser criados no Auth
SELECT 
  'Usuários que precisam ser criados no Auth:' as status,
  COUNT(*) as total
FROM usuarios u
LEFT JOIN auth.users au ON u.email = au.email
WHERE au.id IS NULL
UNION ALL
SELECT 
  'Usuários já criados no Auth:' as status,
  COUNT(*) as total
FROM usuarios u
INNER JOIN auth.users au ON u.email = au.email;

-- 9. Instruções para o próximo passo
SELECT 
  'PRÓXIMOS PASSOS:' as instrucao,
  '1. Se há usuários que não podem fazer login, crie-os manualmente no Supabase Dashboard' as passo1,
  '2. Vá em Authentication > Users > Add User' as passo2,
  '3. Use o email e uma senha temporária (ex: 123456)' as passo3,
  '4. Teste o login com as credenciais criadas' as passo4;
