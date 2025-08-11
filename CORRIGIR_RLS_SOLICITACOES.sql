-- Script para corrigir as políticas RLS da tabela solicitacoes_usuarios

-- 1. Desabilitar RLS temporariamente
ALTER TABLE solicitacoes_usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes (força a limpeza)
DROP POLICY IF EXISTS "Admins podem ver todas as solicitações" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias solicitações" ON solicitacoes_usuarios;
DROP POLICY IF EXISTS "Permitir inserção de solicitações" ON solicitacoes_usuarios;

-- 3. Reabilitar RLS
ALTER TABLE solicitacoes_usuarios ENABLE ROW LEVEL SECURITY;

-- 4. Recriar as políticas na ordem correta

-- Política para permitir inserção de novas solicitações (PRIMEIRA - mais permissiva)
CREATE POLICY "Permitir inserção de solicitações" ON solicitacoes_usuarios
  FOR INSERT WITH CHECK (true);

-- Política para admins verem todas as solicitações
CREATE POLICY "Admins podem ver todas as solicitações" ON solicitacoes_usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()::text
      AND usuarios.tipo = 'admin'
    )
  );

-- Política para usuários verem apenas suas próprias solicitações
CREATE POLICY "Usuários podem ver suas próprias solicitações" ON solicitacoes_usuarios
  FOR SELECT USING (
    email = (
      SELECT email FROM usuarios
      WHERE usuarios.id = auth.uid()::text
    )
  );

-- 5. Verificar se as políticas foram criadas corretamente
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'solicitacoes_usuarios'
ORDER BY policyname;

-- 6. Testar inserção
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status) 
VALUES ('Teste Correção RLS', 'teste.correcao@email.com', '$2a$12$test.hash', 'pendente')
ON CONFLICT (email) DO NOTHING;

-- 7. Verificar se funcionou
SELECT * FROM solicitacoes_usuarios WHERE email = 'teste.correcao@email.com';

-- 8. Limpar teste
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.correcao@email.com';
