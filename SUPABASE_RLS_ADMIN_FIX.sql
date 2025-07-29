-- Script para configurar RLS apenas para usuários autenticados (admins)
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas existentes
DROP POLICY IF EXISTS "Permitir acesso completo a clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir acesso completo a transacoes" ON transacoes;
DROP POLICY IF EXISTS "Permitir acesso completo a carteiras" ON carteiras;
DROP POLICY IF EXISTS "Permitir acesso completo a carteira_snapshots" ON carteira_snapshots;
DROP POLICY IF EXISTS "Permitir acesso completo a daily_snapshots" ON daily_snapshots;
DROP POLICY IF EXISTS "Permitir acesso completo a token_snapshots" ON token_snapshots;
DROP POLICY IF EXISTS "Permitir acesso completo a tokens" ON tokens;
DROP POLICY IF EXISTS "Permitir acesso completo a performance_data" ON performance_data;

-- 2. Criar políticas que permitem apenas usuários autenticados
-- Políticas para a tabela 'clientes' - apenas admins
CREATE POLICY "Apenas admins podem ver clientes" ON clientes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem criar clientes" ON clientes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem atualizar clientes" ON clientes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem deletar clientes" ON clientes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para a tabela 'transacoes' - apenas admins
CREATE POLICY "Apenas admins podem ver transacoes" ON transacoes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem criar transacoes" ON transacoes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem atualizar transacoes" ON transacoes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem deletar transacoes" ON transacoes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para a tabela 'carteiras' - apenas admins
CREATE POLICY "Apenas admins podem ver carteiras" ON carteiras
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem criar carteiras" ON carteiras
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem atualizar carteiras" ON carteiras
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem deletar carteiras" ON carteiras
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para outras tabelas - apenas admins
CREATE POLICY "Apenas admins podem ver carteira_snapshots" ON carteira_snapshots
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem criar carteira_snapshots" ON carteira_snapshots
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem atualizar carteira_snapshots" ON carteira_snapshots
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins podem deletar carteira_snapshots" ON carteira_snapshots
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 