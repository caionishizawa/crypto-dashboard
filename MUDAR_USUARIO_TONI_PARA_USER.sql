-- Comando para mudar o usuário "toni" de admin para user
UPDATE usuarios 
SET tipo = 'user' 
WHERE email = 'biel.tozzo@gmail.com' AND nome = 'toni';

-- Verificar se a mudança foi aplicada
SELECT id, nome, email, role, created_at 
FROM usuarios 
WHERE email = 'biel.tozzo@gmail.com';
