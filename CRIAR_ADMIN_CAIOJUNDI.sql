-- SCRIPT PARA CRIAR USUÁRIO ADMIN
-- Email: caiojundi@gmail.com
-- Senha: 123456
-- Tipo: admin

-- 1. Verificar se o usuário já existe
SELECT 
  'usuarios' as tabela,
  id,
  nome,
  email,
  tipo
FROM usuarios 
WHERE email = 'caiojundi@gmail.com'
UNION ALL
SELECT 
  'auth.users' as tabela,
  id,
  raw_user_meta_data->>'nome' as nome,
  email,
  raw_user_meta_data->>'tipo' as tipo
FROM auth.users 
WHERE email = 'caiojundi@gmail.com';

-- 2. Criar usuário no Supabase Auth (se não existir)
-- NOTA: Este comando precisa ser executado via API ou interface
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
-- VALUES ('caiojundi@gmail.com', crypt('123456', gen_salt('bf')), NOW(), '{"nome": "Caio Jundi", "tipo": "admin"}');

-- 3. Criar usuário na tabela usuarios (se não existir)
INSERT INTO usuarios (id, nome, email, tipo, "dataRegistro", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Caio Jundi',
  'caiojundi@gmail.com',
  'admin',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  tipo = 'admin',
  "updatedAt" = NOW()
WHERE usuarios.email = 'caiojundi@gmail.com';

-- 4. Verificar se foi criado/atualizado
SELECT 
  id,
  nome,
  email,
  tipo,
  "dataRegistro",
  "updatedAt"
FROM usuarios 
WHERE email = 'caiojundi@gmail.com';

-- 5. Listar todos os usuários admin
SELECT 
  id,
  nome,
  email,
  tipo,
  "dataRegistro"
FROM usuarios 
WHERE tipo = 'admin'
ORDER BY "dataRegistro" DESC;

-- 6. Confirmar criação
SELECT 'USUÁRIO ADMIN CAIOJUNDI CRIADO/ATUALIZADO COM SUCESSO!' as status;
