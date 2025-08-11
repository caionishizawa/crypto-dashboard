-- Script AGESSIVO para corrigir RLS da tabela solicitacoes_usuarios
-- Este script vai forçar a correção completa

-- 1. Fazer backup dos dados existentes (se houver)
CREATE TEMP TABLE backup_solicitacoes AS 
SELECT * FROM solicitacoes_usuarios;

-- 2. Desabilitar RLS completamente
ALTER TABLE solicitacoes_usuarios DISABLE ROW LEVEL SECURITY;

-- 3. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Admins podem ver todas as solicitações" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias solicitações" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Permitir inserção de solicitações" ON solicitacoes_usuarios;

-- 4. Verificar se não há mais políticas
SELECT COUNT(*) as politicas_restantes 
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios';

-- 5. Reabilitar RLS
ALTER TABLE solicitacoes_usuarios ENABLE ROW LEVEL SECURITY;

-- 6. Criar APENAS a política de INSERT primeiro (mais importante)
CREATE POLICY "Permitir inserção de solicitações" ON solicitacoes_usuarios
  FOR INSERT WITH CHECK (true);

-- 7. Testar inserção imediatamente
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status) 
VALUES ('Teste Forçado', 'teste.forcado@email.com', '$2a$12$test.hash', 'pendente')
ON CONFLICT (email) DO NOTHING;

-- 8. Verificar se a inserção funcionou
SELECT COUNT(*) as registros_apos_teste 
FROM solicitacoes_usuarios 
WHERE email = 'teste.forcado@email.com';

-- 9. Se funcionou, criar as outras políticas
CREATE POLICY "Admins podem ver todas as solicitações" ON solicitacoes_usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text
      AND usuarios.tipo = 'admin'
    )
  );

CREATE POLICY "Usuários podem ver suas próprias solicitações" ON solicitacoes_usuarios
  FOR SELECT USING (
    email = (
      SELECT email FROM usuarios
      WHERE usuarios.id = auth.uid()::text
    )
  );

-- 10. Verificar todas as políticas criadas
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios'
ORDER BY policyname;

-- 11. Limpar teste
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.forcado@email.com';

-- 12. Restaurar dados do backup (se houver)
INSERT INTO solicitacoes_usuarios 
SELECT * FROM backup_solicitacoes 
ON CONFLICT (email) DO NOTHING;

-- 13. Limpar tabela temporária
DROP TABLE backup_solicitacoes;
