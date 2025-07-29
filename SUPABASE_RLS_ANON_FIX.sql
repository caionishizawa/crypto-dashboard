-- Script para permitir acesso anônimo às tabelas
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas existentes que restringem a usuários autenticados
DROP POLICY IF EXISTS "Usuarios autenticados podem ver clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar clientes" ON clientes;

DROP POLICY IF EXISTS "Usuarios autenticados podem ver transacoes" ON transacoes;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar transacoes" ON transacoes;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar transacoes" ON transacoes;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar transacoes" ON transacoes;

DROP POLICY IF EXISTS "Usuarios autenticados podem ver carteiras" ON carteiras;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar carteiras" ON carteiras;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar carteiras" ON carteiras;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar carteiras" ON carteiras;

DROP POLICY IF EXISTS "Usuarios autenticados podem ver carteira_snapshots" ON carteira_snapshots;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar carteira_snapshots" ON carteira_snapshots;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar carteira_snapshots" ON carteira_snapshots;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar carteira_snapshots" ON carteira_snapshots;

DROP POLICY IF EXISTS "Usuarios autenticados podem ver daily_snapshots" ON daily_snapshots;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar daily_snapshots" ON daily_snapshots;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar daily_snapshots" ON daily_snapshots;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar daily_snapshots" ON daily_snapshots;

DROP POLICY IF EXISTS "Usuarios autenticados podem ver token_snapshots" ON token_snapshots;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar token_snapshots" ON token_snapshots;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar token_snapshots" ON token_snapshots;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar token_snapshots" ON token_snapshots;

DROP POLICY IF EXISTS "Usuarios autenticados podem ver tokens" ON tokens;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar tokens" ON tokens;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar tokens" ON tokens;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar tokens" ON tokens;

DROP POLICY IF EXISTS "Usuarios autenticados podem ver performance_data" ON performance_data;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar performance_data" ON performance_data;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar performance_data" ON performance_data;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar performance_data" ON performance_data;

-- 2. Criar novas políticas que permitem acesso anônimo
-- Políticas para a tabela 'clientes'
CREATE POLICY "Permitir acesso completo a clientes" ON clientes
    FOR ALL USING (true);

-- Políticas para a tabela 'transacoes'
CREATE POLICY "Permitir acesso completo a transacoes" ON transacoes
    FOR ALL USING (true);

-- Políticas para a tabela 'carteiras'
CREATE POLICY "Permitir acesso completo a carteiras" ON carteiras
    FOR ALL USING (true);

-- Políticas para a tabela 'carteira_snapshots'
CREATE POLICY "Permitir acesso completo a carteira_snapshots" ON carteira_snapshots
    FOR ALL USING (true);

-- Políticas para a tabela 'daily_snapshots'
CREATE POLICY "Permitir acesso completo a daily_snapshots" ON daily_snapshots
    FOR ALL USING (true);

-- Políticas para a tabela 'token_snapshots'
CREATE POLICY "Permitir acesso completo a token_snapshots" ON token_snapshots
    FOR ALL USING (true);

-- Políticas para a tabela 'tokens'
CREATE POLICY "Permitir acesso completo a tokens" ON tokens
    FOR ALL USING (true);

-- Políticas para a tabela 'performance_data'
CREATE POLICY "Permitir acesso completo a performance_data" ON performance_data
    FOR ALL USING (true);

-- 3. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 