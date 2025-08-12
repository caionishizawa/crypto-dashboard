-- SCRIPT PARA MUDAR USUÁRIO JIPO PARA ADMIN
-- Usuário: jipo (caiojundi@gmail.com)
-- ID: df7c7c80-a279-46e5-a2ae-8d06eb4f0dd

-- 1. Verificar o usuário atual
SELECT 
  id,
  nome,
  email,
  tipo,
  "dataRegistro"
FROM usuarios 
WHERE email = 'caiojundi@gmail.com';

-- 2. Mudar o tipo de 'user' para 'admin'
UPDATE usuarios 
SET 
  tipo = 'admin',
  "updatedAt" = NOW()
WHERE email = 'caiojundi@gmail.com';

-- 3. Verificar se a mudança foi aplicada
SELECT 
  id,
  nome,
  email,
  tipo,
  "dataRegistro",
  "updatedAt"
FROM usuarios 
WHERE email = 'caiojundi@gmail.com';

-- 4. Verificar todos os usuários admin
SELECT 
  id,
  nome,
  email,
  tipo,
  "dataRegistro"
FROM usuarios 
WHERE tipo = 'admin'
ORDER BY "dataRegistro" DESC;

-- 5. Confirmar a mudança
SELECT 'USUÁRIO JIPO AGORA É ADMIN!' as status;
