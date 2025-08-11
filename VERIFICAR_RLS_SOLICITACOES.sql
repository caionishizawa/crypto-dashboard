-- Script para verificar o status das políticas RLS na tabela solicitacoes_usuarios

-- 1. Verificar se a tabela existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'solicitacoes_usuarios';

-- 2. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'solicitacoes_usuarios';

-- 3. Listar todas as políticas RLS da tabela
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios'
ORDER BY policyname;

-- 4. Verificar se a política de INSERT existe especificamente
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios' 
AND cmd = 'INSERT';

-- 5. Testar inserção direta (deve funcionar se RLS estiver correto)
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status) 
VALUES ('Teste RLS', 'teste.rls@email.com', '$2a$12$test.hash', 'pendente')
ON CONFLICT (email) DO NOTHING;

-- 6. Verificar se a inserção foi bem-sucedida
SELECT * FROM solicitacoes_usuarios WHERE email = 'teste.rls@email.com';

-- 7. Limpar o teste
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.rls@email.com';
