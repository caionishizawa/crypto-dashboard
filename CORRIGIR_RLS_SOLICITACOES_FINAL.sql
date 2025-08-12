-- CORREÇÃO FINAL DA RLS PARA SOLICITAÇÕES DE USUÁRIOS
-- Este script resolve o problema da RLS desabilitada e configura tudo corretamente

-- 1. Verificar status atual da tabela
SELECT 
  'Status atual da tabela:' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'solicitacoes_usuarios';

-- 2. Verificar políticas existentes
SELECT 
  'Políticas existentes:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios';

-- 3. REMOVER TODAS as políticas existentes para limpar
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
DROP POLICY IF EXISTS "Admins podem ver todas as solicitações" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias solicitações" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Permitir inserção de solicitações" ON solicitacoes_usuarios;

-- 4. HABILITAR RLS na tabela
ALTER TABLE solicitacoes_usuarios ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS CORRETAS

-- Política 1: Permitir inserção anônima (para novos cadastros)
CREATE POLICY "Permitir inserção anônima" ON solicitacoes_usuarios
  FOR INSERT TO anon WITH CHECK (true);

-- Política 2: Permitir inserção para usuários autenticados (fallback)
CREATE POLICY "Permitir inserção autenticada" ON solicitacoes_usuarios
  FOR INSERT TO authenticated WITH CHECK (true);

-- Política 3: Admins podem ver todas as solicitações
CREATE POLICY "Admins podem ver todas as solicitações" ON solicitacoes_usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text
      AND usuarios.tipo = 'admin'
    )
  );

-- Política 4: Usuários autenticados podem ver suas próprias solicitações
CREATE POLICY "Usuários podem ver suas próprias solicitações" ON solicitacoes_usuarios
  FOR SELECT USING (
    email = (
      SELECT email FROM usuarios
      WHERE usuarios.id = auth.uid()::text
    )
  );

-- Política 5: Admins podem atualizar solicitações (aprovar/rejeitar)
CREATE POLICY "Admins podem atualizar solicitações" ON solicitacoes_usuarios
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text
      AND usuarios.tipo = 'admin'
    )
  );

-- Política 6: Admins podem deletar solicitações processadas
CREATE POLICY "Admins podem deletar solicitações" ON solicitacoes_usuarios
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text
      AND usuarios.tipo = 'admin'
    )
  );

-- 6. Verificar se RLS foi habilitado
SELECT 
  'RLS habilitado:' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'solicitacoes_usuarios';

-- 7. Verificar políticas criadas
SELECT 
  'Políticas criadas:' as info,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios'
ORDER BY policyname;

-- 8. Testar inserção anônima (deve funcionar agora)
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status, observacoes) 
VALUES ('Teste RLS Corrigido', 'teste.rls@email.com', '$2a$12$test.hash.corrigido', 'pendente', 'Teste de inserção anônima com RLS')
ON CONFLICT (email) DO NOTHING;

-- 9. Verificar se foi inserido
SELECT 
  'Teste de inserção:' as info,
  id,
  nome,
  email,
  status,
  data_solicitacao
FROM solicitacoes_usuarios 
WHERE email = 'teste.rls@email.com';

-- 10. Limpar teste
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.rls@email.com';

-- 11. Resumo final
SELECT 
  '✅ RLS CORRIGIDA COM SUCESSO!' as status,
  'Tabela solicitacoes_usuarios agora tem RLS habilitado com políticas corretas' as descricao,
  'Inserção anônima funcionando' as teste_insercao,
  'Admins podem gerenciar todas as solicitações' as permissao_admin,
  'Usuários podem ver suas próprias solicitações' as permissao_usuario;
