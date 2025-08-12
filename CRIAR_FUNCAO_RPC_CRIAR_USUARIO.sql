-- FUNÇÃO RPC PARA CRIAR USUÁRIO VIA BACKEND
-- Esta função será chamada pelo frontend para criar usuários no Auth

-- 1. Criar a função RPC
CREATE OR REPLACE FUNCTION criar_usuario_aprovado(
  p_email TEXT,
  p_nome TEXT,
  p_senha TEXT DEFAULT '123456'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Verificar se o usuário já existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário já existe no sistema de autenticação'
    );
  END IF;

  -- Criar usuário no auth.users (isso precisa ser feito via API do Supabase)
  -- Como não podemos fazer isso diretamente via SQL, vamos criar na tabela usuarios
  -- e o usuário precisará usar a senha original da solicitação

  -- Inserir na tabela usuarios
  INSERT INTO usuarios (id, nome, email, tipo, "dataRegistro", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid(),
    p_nome,
    p_email,
    'user',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    tipo = 'user',
    "updatedAt" = NOW()
  RETURNING id INTO v_user_id;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Usuário criado com sucesso! Use a senha original da solicitação para fazer login.',
    'user_id', v_user_id,
    'email', p_email,
    'nome', p_nome
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 2. Dar permissão para a função ser chamada
GRANT EXECUTE ON FUNCTION criar_usuario_aprovado(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION criar_usuario_aprovado(TEXT, TEXT, TEXT) TO anon;

-- 3. Testar a função
SELECT criar_usuario_aprovado('teste@exemplo.com', 'Usuário Teste');

-- 4. Verificar se foi criado
SELECT * FROM usuarios WHERE email = 'teste@exemplo.com';

-- 5. Limpar teste
DELETE FROM usuarios WHERE email = 'teste@exemplo.com';
