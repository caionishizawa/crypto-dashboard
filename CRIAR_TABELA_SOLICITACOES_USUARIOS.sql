-- Criar tabela para solicitações de usuários aguardando aprovação
CREATE TABLE IF NOT EXISTS solicitacoes_usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  aprovado_por UUID REFERENCES usuarios(id),
  motivo_rejeicao TEXT,
  observacoes TEXT
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes_usuarios(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_email ON solicitacoes_usuarios(email);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_data ON solicitacoes_usuarios(data_solicitacao);

-- Adicionar RLS (Row Level Security)
ALTER TABLE solicitacoes_usuarios ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todas as solicitações
CREATE POLICY "Admins podem ver todas as solicitações" ON solicitacoes_usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.tipo = 'admin'
    )
  );

-- Política para usuários verem apenas suas próprias solicitações
CREATE POLICY "Usuários podem ver suas próprias solicitações" ON solicitacoes_usuarios
  FOR SELECT USING (
    email = (
      SELECT email FROM usuarios 
      WHERE usuarios.id = auth.uid()
    )
  );

-- Inserir algumas solicitações de exemplo (opcional)
INSERT INTO solicitacoes_usuarios (nome, email, senha_hash, status, observacoes) VALUES
('João Silva', 'joao.silva@email.com', '$2a$12$example.hash', 'pendente', 'Interessado em investimentos DeFi'),
('Maria Santos', 'maria.santos@email.com', '$2a$12$example.hash', 'pendente', 'Cliente conservador'),
('Pedro Costa', 'pedro.costa@email.com', '$2a$12$example.hash', 'pendente', 'Experiência em crypto');

-- Verificar se a tabela foi criada
SELECT * FROM solicitacoes_usuarios;
