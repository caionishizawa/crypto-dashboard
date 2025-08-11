-- Verificação detalhada das políticas RLS e teste de inserção anônima

-- 1. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'solicitacoes_usuarios';

-- 2. Listar TODAS as políticas com detalhes
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check,
  schemaname
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios'
ORDER BY policyname;

-- 3. Verificar se a política de INSERT tem with_check = true
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios' 
AND cmd = 'INSERT';

-- 4. Testar inserção anônima diretamente
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status) 
VALUES ('Teste Anônimo', 'teste.anonimo@email.com', '$2a$12$test.hash', 'pendente')
ON CONFLICT (email) DO NOTHING;

-- 5. Verificar se foi inserido
SELECT * FROM solicitacoes_usuarios WHERE email = 'teste.anonimo@email.com';

-- 6. Limpar teste
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.anonimo@email.com';

-- 7. Verificar contexto atual
SELECT auth.uid() as current_user_id;
