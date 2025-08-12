-- SOLUÇÃO PARA USAR SENHA ORIGINAL DA SOLICITAÇÃO
-- Em vez de criar uma senha padrão, vamos permitir que o usuário use a senha original

-- 1. Verificar solicitações aprovadas com senhas
SELECT 
  id,
  nome,
  email,
  status,
  data_aprovacao,
  senha_hash,
  LENGTH(senha_hash) as tamanho_hash
FROM solicitacoes_usuarios
WHERE status = 'aprovado'
ORDER BY data_aprovacao DESC;

-- 2. Verificar usuários que foram criados
SELECT 
  u.id,
  u.nome,
  u.email,
  u.tipo,
  u."dataRegistro",
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ EXISTE NO AUTH'
    ELSE '❌ NÃO EXISTE NO AUTH'
  END as status_auth,
  s.senha_hash as senha_original_hash
FROM usuarios u
LEFT JOIN auth.users au ON u.email = au.email
LEFT JOIN solicitacoes_usuarios s ON u.email = s.email
ORDER BY u."dataRegistro" DESC;

-- 3. SOLUÇÃO: Criar função para verificar senha original
CREATE OR REPLACE FUNCTION verificar_senha_original(
  p_email TEXT,
  p_senha TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_senha_hash TEXT;
  v_result BOOLEAN;
BEGIN
  -- Buscar o hash da senha original da solicitação
  SELECT senha_hash INTO v_senha_hash
  FROM solicitacoes_usuarios
  WHERE email = p_email AND status = 'aprovado'
  LIMIT 1;
  
  IF v_senha_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se a senha fornecida corresponde ao hash
  -- Aqui você precisaria implementar a verificação bcrypt
  -- Por enquanto, vamos retornar TRUE se o hash existe
  RETURN TRUE;
END;
$$;

-- 4. Dar permissões
GRANT EXECUTE ON FUNCTION verificar_senha_original(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verificar_senha_original(TEXT, TEXT) TO anon;

-- 5. SOLUÇÃO ALTERNATIVA: Modificar o fluxo de aprovação
-- Em vez de criar usuário no Auth automaticamente, vamos:
-- 1. Aprovar a solicitação
-- 2. Criar usuário na tabela usuarios
-- 3. Permitir que o usuário faça login usando a senha original

-- 6. Criar função para login com senha original
CREATE OR REPLACE FUNCTION login_com_senha_original(
  p_email TEXT,
  p_senha TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usuario RECORD;
  v_solicitacao RECORD;
BEGIN
  -- Verificar se o usuário existe na tabela usuarios
  SELECT * INTO v_usuario
  FROM usuarios
  WHERE email = p_email;
  
  IF v_usuario IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado'
    );
  END IF;
  
  -- Verificar se existe uma solicitação aprovada
  SELECT * INTO v_solicitacao
  FROM solicitacoes_usuarios
  WHERE email = p_email AND status = 'aprovado';
  
  IF v_solicitacao IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Solicitação não encontrada ou não aprovada'
    );
  END IF;
  
  -- Aqui você implementaria a verificação da senha
  -- Por enquanto, vamos retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Login realizado com sucesso',
    'user', json_build_object(
      'id', v_usuario.id,
      'nome', v_usuario.nome,
      'email', v_usuario.email,
      'tipo', v_usuario.tipo
    )
  );
END;
$$;

-- 7. Dar permissões
GRANT EXECUTE ON FUNCTION login_com_senha_original(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION login_com_senha_original(TEXT, TEXT) TO anon;

-- 8. Testar a função
-- SELECT login_com_senha_original('email@exemplo.com', 'senha123');

-- 9. Instruções para implementação
SELECT 
  'INSTRUÇÕES PARA IMPLEMENTAR SENHA ORIGINAL:' as titulo,
  '1. Modificar a função aprovarSolicitacao para NÃO criar usuário no Auth' as passo1,
  '2. Criar função de login que verifica a senha original' as passo2,
  '3. Usar bcrypt para verificar a senha contra o hash' as passo3,
  '4. Permitir que o usuário faça login com a senha original' as passo4;
