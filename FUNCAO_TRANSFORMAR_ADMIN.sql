-- Função SQL para transformar usuário em admin (contorna RLS)
CREATE OR REPLACE FUNCTION transformar_usuario_em_admin(usuario_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resultado JSON;
  usuario_atual TEXT;
  tipo_atual TEXT;
BEGIN
  -- Verificar se o usuário atual é admin
  SELECT id, tipo INTO usuario_atual, tipo_atual
  FROM usuarios
  WHERE id = auth.uid()::text;
  
  IF NOT FOUND OR tipo_atual != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Apenas administradores podem transformar usuários em admins'
    );
  END IF;
  
  -- Verificar se não está tentando transformar a si mesmo
  IF usuario_atual = usuario_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Você já é um administrador'
    );
  END IF;
  
  -- Verificar se o usuário alvo existe
  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = usuario_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado'
    );
  END IF;
  
  -- Verificar se o usuário alvo já é admin
  IF EXISTS (SELECT 1 FROM usuarios WHERE id = usuario_id AND tipo = 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Este usuário já é um administrador'
    );
  END IF;
  
  -- Fazer o UPDATE
  UPDATE usuarios 
  SET tipo = 'admin', updated_at = NOW()
  WHERE id = usuario_id;
  
  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Usuário transformado em administrador com sucesso'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro interno: ' || SQLERRM
    );
END;
$$;

-- Comentário sobre a função
COMMENT ON FUNCTION transformar_usuario_em_admin(TEXT) IS 
'Função para transformar usuário em admin, contornando políticas RLS. Apenas admins podem usar.';
