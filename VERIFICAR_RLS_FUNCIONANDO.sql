-- VERIFICAÇÃO FINAL DA RLS FUNCIONANDO
-- Este script verifica se tudo está funcionando corretamente

-- 1. Verificar status da tabela
SELECT 
  '📊 Status da Tabela:' as secao,
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END as rls_status
FROM pg_tables 
WHERE tablename = 'solicitacoes_usuarios';

-- 2. Listar todas as políticas ativas
SELECT 
  '🔐 Políticas Ativas:' as secao,
  policyname,
  CASE 
    WHEN permissive THEN 'PERMISSIVA'
    ELSE 'RESTRITIVA'
  END as tipo,
  roles,
  cmd as operacao
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios'
ORDER BY policyname;

-- 3. Verificar dados existentes
SELECT 
  '📋 Dados Existentes:' as secao,
  COUNT(*) as total_solicitacoes,
  COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
  COUNT(CASE WHEN status = 'aprovado' THEN 1 END) as aprovadas,
  COUNT(CASE WHEN status = 'rejeitado' THEN 1 END) as rejeitadas
FROM solicitacoes_usuarios;

-- 4. Verificar estrutura da tabela
SELECT 
  '🏗️ Estrutura da Tabela:' as secao,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'solicitacoes_usuarios'
ORDER BY ordinal_position;

-- 5. Verificar índices
SELECT 
  '📈 Índices:' as secao,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'solicitacoes_usuarios';

-- 6. Teste de inserção anônima (simulado)
SELECT 
  '🧪 Teste de Inserção Anônima:' as secao,
  'Para testar, execute no frontend:' as instrucao,
  'apiClient.solicitarCadastro({nome, email, senha})' as comando;

-- 7. Verificar permissões de usuários
SELECT 
  '👥 Permissões de Usuários:' as secao,
  'Admin: Pode ver, atualizar e deletar todas as solicitações' as admin_perms,
  'Usuário: Pode ver apenas suas próprias solicitações' as user_perms,
  'Anônimo: Pode inserir novas solicitações' as anon_perms;

-- 8. Resumo final
SELECT 
  '🎯 RESUMO FINAL:' as secao,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'solicitacoes_usuarios' 
      AND rowsecurity = true
    ) THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END as rls_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'solicitacoes_usuarios'
    ) THEN '✅ POLÍTICAS CONFIGURADAS'
    ELSE '❌ SEM POLÍTICAS'
  END as policies_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'solicitacoes_usuarios'
      AND cmd = 'INSERT'
      AND roles = '{anon}'
    ) THEN '✅ INSERÇÃO ANÔNIMA PERMITIDA'
    ELSE '❌ INSERÇÃO ANÔNIMA BLOQUEADA'
  END as anon_insert_status;

-- 9. Instruções para teste manual
SELECT 
  '📝 PRÓXIMOS PASSOS:' as secao,
  '1. Execute este script no Supabase SQL Editor' as passo1,
  '2. Verifique se RLS está habilitado' as passo2,
  '3. Teste cadastro de novo usuário no frontend' as passo3,
  '4. Verifique se aparece na tabela solicitacoes_usuarios' as passo4,
  '5. Aprove o usuário como admin' as passo5,
  '6. Teste login com senha original' as passo6;
