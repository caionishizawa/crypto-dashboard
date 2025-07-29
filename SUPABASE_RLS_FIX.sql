-- Script para configurar Row Level Security (RLS) no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar RLS nas tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE carteiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_data ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas para a tabela 'usuarios'
-- Permitir que usuários vejam todos os usuários (para login/registro)
CREATE POLICY "Usuarios podem ver todos os usuários" ON usuarios
    FOR SELECT USING (true);

-- Permitir que usuários se registrem
CREATE POLICY "Usuarios podem se registrar" ON usuarios
    FOR INSERT WITH CHECK (true);

-- Permitir que usuários atualizem seus próprios dados
CREATE POLICY "Usuarios podem atualizar seus dados" ON usuarios
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 3. Criar políticas para a tabela 'clientes'
-- Permitir que usuários autenticados vejam todos os clientes
CREATE POLICY "Usuarios autenticados podem ver clientes" ON clientes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados criem clientes
CREATE POLICY "Usuarios autenticados podem criar clientes" ON clientes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir que usuários autenticados atualizem clientes
CREATE POLICY "Usuarios autenticados podem atualizar clientes" ON clientes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados deletem clientes
CREATE POLICY "Usuarios autenticados podem deletar clientes" ON clientes
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Criar políticas para a tabela 'transacoes'
-- Permitir que usuários autenticados vejam todas as transações
CREATE POLICY "Usuarios autenticados podem ver transacoes" ON transacoes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados criem transações
CREATE POLICY "Usuarios autenticados podem criar transacoes" ON transacoes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir que usuários autenticados atualizem transações
CREATE POLICY "Usuarios autenticados podem atualizar transacoes" ON transacoes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados deletem transações
CREATE POLICY "Usuarios autenticados podem deletar transacoes" ON transacoes
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Criar políticas para a tabela 'carteiras'
-- Permitir que usuários autenticados vejam todas as carteiras
CREATE POLICY "Usuarios autenticados podem ver carteiras" ON carteiras
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados criem carteiras
CREATE POLICY "Usuarios autenticados podem criar carteiras" ON carteiras
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir que usuários autenticados atualizem carteiras
CREATE POLICY "Usuarios autenticados podem atualizar carteiras" ON carteiras
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados deletem carteiras
CREATE POLICY "Usuarios autenticados podem deletar carteiras" ON carteiras
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Criar políticas para a tabela 'snapshots'
-- Permitir que usuários autenticados vejam todos os snapshots
CREATE POLICY "Usuarios autenticados podem ver snapshots" ON snapshots
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados criem snapshots
CREATE POLICY "Usuarios autenticados podem criar snapshots" ON snapshots
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir que usuários autenticados atualizem snapshots
CREATE POLICY "Usuarios autenticados podem atualizar snapshots" ON snapshots
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados deletem snapshots
CREATE POLICY "Usuarios autenticados podem deletar snapshots" ON snapshots
    FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Criar políticas para a tabela 'performance_data'
-- Permitir que usuários autenticados vejam todos os dados de performance
CREATE POLICY "Usuarios autenticados podem ver performance_data" ON performance_data
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados criem dados de performance
CREATE POLICY "Usuarios autenticados podem criar performance_data" ON performance_data
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir que usuários autenticados atualizem dados de performance
CREATE POLICY "Usuarios autenticados podem atualizar performance_data" ON performance_data
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados deletem dados de performance
CREATE POLICY "Usuarios autenticados podem deletar performance_data" ON performance_data
    FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 