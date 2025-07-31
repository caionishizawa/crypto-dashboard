-- Adicionar coluna apy_medio na tabela clientes
ALTER TABLE clientes 
ADD COLUMN apy_medio DECIMAL(10,2) DEFAULT 0;

-- Comentário explicativo
COMMENT ON COLUMN clientes.apy_medio IS 'APY médio do cliente em porcentagem';

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clientes' AND column_name = 'apy_medio'; 