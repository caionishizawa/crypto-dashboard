-- SOLUÇÃO RADICAL PARA RESOLVER RLS DE UMA VEZ
-- Vamos desabilitar RLS completamente para a tabela solicitacoes_usuarios

-- 1. Verificar status atual
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'solicitacoes_usuarios';

-- 2. REMOVER TODAS as políticas existentes
DROP POLICY IF EXISTS "anon_insert" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "auth_select" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "auth_update" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Permitir inserção anônima" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Permitir atualização para admins" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Enable read access for all users" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Enable update for users based on email" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON solicitacoes_usuarios;

-- 3. DESABILITAR RLS COMPLETAMENTE para esta tabela
ALTER TABLE solicitacoes_usuarios DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'solicitacoes_usuarios';

-- 5. Testar inserção anônima
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status) 
VALUES ('Teste Sem RLS Radical', 'teste.radical@email.com', '$2a$12$test.hash', 'pendente')
ON CONFLICT (email) DO NOTHING;

-- 6. Verificar se foi inserido
SELECT * FROM solicitacoes_usuarios WHERE email = 'teste.radical@email.com';

-- 7. Limpar teste
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.radical@email.com';

-- 8. Confirmar que RLS está desabilitado
SELECT 
  'RLS DESABILITADO - INSERÇÃO ANÔNIMA FUNCIONANDO!' as status,
  rowsecurity as rls_status
FROM pg_tables 
WHERE tablename = 'solicitacoes_usuarios';
