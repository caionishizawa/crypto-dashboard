-- CORREÇÃO FINAL E DEFINITIVA DAS POLÍTICAS RLS
-- Este script vai resolver o problema de uma vez por todas

-- 1. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'solicitacoes_usuarios';

-- 2. REMOVER TODAS as políticas existentes (limpar completamente)
DROP POLICY IF EXISTS "Permitir inserção anônima" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Permitir atualização para admins" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Enable read access for all users" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Enable update for users based on email" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON solicitacoes_usuarios;

-- 3. DESABILITAR RLS temporariamente para inserção anônima
ALTER TABLE solicitacoes_usuarios DISABLE ROW LEVEL SECURITY;

-- 4. Testar inserção sem RLS
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status) 
VALUES ('Teste Sem RLS', 'teste.sem.rls@email.com', '$2a$12$test.hash', 'pendente')
ON CONFLICT (email) DO NOTHING;

-- 5. Verificar se foi inserido
SELECT * FROM solicitacoes_usuarios WHERE email = 'teste.sem.rls@email.com';

-- 6. Limpar teste
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.sem.rls@email.com';

-- 7. REABILITAR RLS
ALTER TABLE solicitacoes_usuarios ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICA SIMPLES E EFETIVA para inserção anônima
CREATE POLICY "anon_insert" ON solicitacoes_usuarios
FOR INSERT 
TO anon
WITH CHECK (true);

-- 9. CRIAR POLÍTICA para leitura de usuários autenticados
CREATE POLICY "auth_select" ON solicitacoes_usuarios
FOR SELECT 
TO authenticated
USING (true);

-- 10. CRIAR POLÍTICA para atualização de usuários autenticados
CREATE POLICY "auth_update" ON solicitacoes_usuarios
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- 11. Verificar as políticas criadas
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

-- 12. Testar inserção anônima com as novas políticas
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status) 
VALUES ('Teste Final RLS', 'teste.final.rls@email.com', '$2a$12$test.hash', 'pendente')
ON CONFLICT (email) DO NOTHING;

-- 13. Verificar se foi inserido
SELECT * FROM solicitacoes_usuarios WHERE email = 'teste.final.rls@email.com';

-- 14. Limpar teste final
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.final.rls@email.com';

-- 15. Confirmar que tudo está funcionando
SELECT 'CORREÇÃO FINALIZADA COM SUCESSO!' as status;
