-- Corrigir políticas RLS para permitir inserção anônima

-- 1. Primeiro, vamos ver as políticas atuais
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios'
ORDER BY policyname;

-- 2. Remover políticas existentes que podem estar bloqueando
DROP POLICY IF EXISTS "Permitir inserção anônima" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Permitir atualização para admins" ON solicitacoes_usuarios;

-- 3. Criar nova política para permitir inserção anônima
CREATE POLICY "Permitir inserção anônima" ON solicitacoes_usuarios
FOR INSERT 
TO anon
WITH CHECK (true);

-- 4. Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados" ON solicitacoes_usuarios
FOR SELECT 
TO authenticated
USING (true);

-- 5. Criar política para permitir atualização para admins
CREATE POLICY "Permitir atualização para admins" ON solicitacoes_usuarios
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Verificar as novas políticas
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios'
ORDER BY policyname;

-- 7. Testar inserção anônima
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status) 
VALUES ('Teste Política Corrigida', 'teste.politica@email.com', '$2a$12$test.hash', 'pendente')
ON CONFLICT (email) DO NOTHING;

-- 8. Verificar se foi inserido
SELECT * FROM solicitacoes_usuarios WHERE email = 'teste.politica@email.com';

-- 9. Limpar teste
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.politica@email.com';
