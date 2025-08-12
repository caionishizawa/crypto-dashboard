-- SOLUÇÃO PARA CRIAR USUÁRIOS NO AUTH AUTOMATICAMENTE
-- Quando um usuário é aprovado, ele precisa ser criado no Supabase Auth

-- 1. Primeiro, vamos verificar se existe algum usuário aprovado sem Auth
SELECT 
  u.id,
  u.nome,
  u.email,
  u.tipo,
  CASE 
    WHEN au.id IS NOT NULL THEN 'EXISTE NO AUTH'
    ELSE 'NÃO EXISTE NO AUTH'
  END as status_auth
FROM usuarios u
LEFT JOIN auth.users au ON u.email = au.email
ORDER BY u."dataRegistro" DESC;

-- 2. Criar uma função para sincronizar usuários com Auth
CREATE OR REPLACE FUNCTION sincronizar_usuario_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta função será chamada quando um usuário for inserido na tabela usuarios
  -- Como não podemos criar usuários no Auth via SQL diretamente,
  -- vamos marcar que precisa ser criado
  
  -- Adicionar uma coluna para marcar que precisa ser criado no Auth
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'usuarios' AND column_name = 'auth_criado') THEN
    ALTER TABLE usuarios ADD COLUMN auth_criado BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Marcar que precisa ser criado no Auth
  NEW.auth_criado = FALSE;
  
  RETURN NEW;
END;
$$;

-- 3. Criar trigger para marcar usuários que precisam ser criados no Auth
DROP TRIGGER IF EXISTS trigger_sincronizar_auth ON usuarios;
CREATE TRIGGER trigger_sincronizar_auth
  BEFORE INSERT ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION sincronizar_usuario_auth();

-- 4. Adicionar coluna auth_criado se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'usuarios' AND column_name = 'auth_criado') THEN
    ALTER TABLE usuarios ADD COLUMN auth_criado BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 5. Marcar todos os usuários existentes como não criados no Auth
UPDATE usuarios SET auth_criado = FALSE WHERE auth_criado IS NULL;

-- 6. Verificar usuários que precisam ser criados no Auth
SELECT 
  id,
  nome,
  email,
  tipo,
  auth_criado,
  "dataRegistro"
FROM usuarios 
WHERE auth_criado = FALSE
ORDER BY "dataRegistro" DESC;

-- 7. Função para marcar usuário como criado no Auth (será chamada manualmente)
CREATE OR REPLACE FUNCTION marcar_usuario_auth_criado(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE usuarios 
  SET auth_criado = TRUE 
  WHERE email = p_email;
  
  RETURN FOUND;
END;
$$;

-- 8. Dar permissões
GRANT EXECUTE ON FUNCTION marcar_usuario_auth_criado(TEXT) TO authenticated;

-- 9. Verificar resultado
SELECT 
  'Usuários que precisam ser criados no Auth:' as status,
  COUNT(*) as total
FROM usuarios 
WHERE auth_criado = FALSE
UNION ALL
SELECT 
  'Usuários já criados no Auth:' as status,
  COUNT(*) as total
FROM usuarios 
WHERE auth_criado = TRUE;
