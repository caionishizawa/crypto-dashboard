-- Teste simples de inserção direta
-- Execute este script para verificar se a inserção funciona

-- 1. Tentar inserção direta
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status) 
VALUES ('Teste Direto', 'teste.direto@email.com', '$2a$12$test.hash', 'pendente')
ON CONFLICT (email) DO NOTHING;

-- 2. Verificar se foi inserido
SELECT * FROM solicitacoes_usuarios WHERE email = 'teste.direto@email.com';

-- 3. Limpar teste
DELETE FROM solicitacoes_usuarios WHERE email = 'teste.direto@email.com';
