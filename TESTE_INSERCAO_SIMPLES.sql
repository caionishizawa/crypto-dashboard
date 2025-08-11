-- Teste simples de inserção anônima

-- 1. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'solicitacoes_usuarios';

-- 2. Listar políticas de INSERT
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios' 
AND cmd = 'INSERT';

-- 3. Tentar inserção anônima
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status) 
VALUES ('Teste Simples', 'teste.simples@email.com', '$2a$12$test.hash', 'pendente')
ON CONFLICT (email) DO NOTHING;

-- 4. Verificar se foi inserido
SELECT * FROM solicitacoes_usuarios WHERE email = 'teste.simples@email.com';

-- 5. Limpar teste
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.simples@email.com';
