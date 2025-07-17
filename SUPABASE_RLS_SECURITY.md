# 🔒 Configuração de RLS (Row Level Security) - Dashboard Financeiro

## Visão Geral

Este documento detalha a configuração de Row Level Security (RLS) para o dashboard financeiro, implementando controles de acesso baseados em roles e ownership.

## 🏗️ Estrutura de Usuários

### Tabela de Usuários Auth
```sql
-- Criar tabela de perfis para estender auth.users
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tipo VARCHAR(50) CHECK (tipo IN ('admin', 'cliente')) NOT NULL DEFAULT 'cliente',
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Função para Verificar Role
```sql
-- Função para verificar o tipo do usuário atual
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT tipo FROM public.user_profiles 
  WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;
```

## 🔐 Políticas de RLS por Tabela

### 1. Tabela user_profiles
```sql
-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Users podem ver próprio perfil, admins veem tudo
CREATE POLICY "Users can view own profile, admins view all" ON public.user_profiles
FOR SELECT USING (
  auth.uid() = id OR auth.user_role() = 'admin'
);

-- Política para INSERT: Apenas durante signup
CREATE POLICY "Users can insert own profile on signup" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para UPDATE: Users podem atualizar próprio perfil, admins tudo
CREATE POLICY "Users can update own profile, admins update all" ON public.user_profiles
FOR UPDATE USING (
  auth.uid() = id OR auth.user_role() = 'admin'
);

-- Política para DELETE: Apenas admins
CREATE POLICY "Only admins can delete profiles" ON public.user_profiles
FOR DELETE USING (auth.user_role() = 'admin');
```

### 2. Tabela clientes
```sql
-- Habilitar RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: 
-- - Admins veem todos os clientes
-- - Clientes veem apenas seus próprios dados
CREATE POLICY "Clientes access policy" ON public.clientes
FOR SELECT USING (
  auth.user_role() = 'admin' OR 
  (auth.user_role() = 'cliente' AND user_id = auth.uid())
);

-- Política para INSERT: Apenas admins podem criar clientes
CREATE POLICY "Only admins can create clients" ON public.clientes
FOR INSERT WITH CHECK (auth.user_role() = 'admin');

-- Política para UPDATE: Apenas admins podem atualizar clientes
CREATE POLICY "Only admins can update clients" ON public.clientes
FOR UPDATE USING (auth.user_role() = 'admin');

-- Política para DELETE: Apenas admins podem deletar clientes
CREATE POLICY "Only admins can delete clients" ON public.clientes
FOR DELETE USING (auth.user_role() = 'admin');
```

### 3. Tabela transacoes
```sql
-- Habilitar RLS
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Baseada no cliente vinculado
CREATE POLICY "Transacoes access policy" ON public.transacoes
FOR SELECT USING (
  auth.user_role() = 'admin' OR 
  (auth.user_role() = 'cliente' AND EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = transacoes.cliente_id AND c.user_id = auth.uid()
  ))
);

-- Política para INSERT: Apenas admins
CREATE POLICY "Only admins can create transactions" ON public.transacoes
FOR INSERT WITH CHECK (auth.user_role() = 'admin');

-- Política para UPDATE: Apenas admins
CREATE POLICY "Only admins can update transactions" ON public.transacoes
FOR UPDATE USING (auth.user_role() = 'admin');

-- Política para DELETE: Apenas admins
CREATE POLICY "Only admins can delete transactions" ON public.transacoes
FOR DELETE USING (auth.user_role() = 'admin');
```

### 4. Tabela carteiras
```sql
-- Habilitar RLS
ALTER TABLE public.carteiras ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Baseada no cliente vinculado
CREATE POLICY "Carteiras access policy" ON public.carteiras
FOR SELECT USING (
  auth.user_role() = 'admin' OR 
  (auth.user_role() = 'cliente' AND EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = carteiras.cliente_id AND c.user_id = auth.uid()
  ))
);

-- Política para INSERT: Apenas admins
CREATE POLICY "Only admins can create wallets" ON public.carteiras
FOR INSERT WITH CHECK (auth.user_role() = 'admin');

-- Política para UPDATE: Apenas admins
CREATE POLICY "Only admins can update wallets" ON public.carteiras
FOR UPDATE USING (auth.user_role() = 'admin');

-- Política para DELETE: Apenas admins
CREATE POLICY "Only admins can delete wallets" ON public.carteiras
FOR DELETE USING (auth.user_role() = 'admin');
```

### 5. Tabela tokens
```sql
-- Habilitar RLS
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Baseada na carteira vinculada
CREATE POLICY "Tokens access policy" ON public.tokens
FOR SELECT USING (
  auth.user_role() = 'admin' OR 
  (auth.user_role() = 'cliente' AND EXISTS (
    SELECT 1 FROM public.carteiras w 
    JOIN public.clientes c ON c.id = w.cliente_id
    WHERE w.id = tokens.carteira_id AND c.user_id = auth.uid()
  ))
);

-- Política para INSERT: Apenas admins
CREATE POLICY "Only admins can create tokens" ON public.tokens
FOR INSERT WITH CHECK (auth.user_role() = 'admin');

-- Política para UPDATE: Apenas admins
CREATE POLICY "Only admins can update tokens" ON public.tokens
FOR UPDATE USING (auth.user_role() = 'admin');

-- Política para DELETE: Apenas admins
CREATE POLICY "Only admins can delete tokens" ON public.tokens
FOR DELETE USING (auth.user_role() = 'admin');
```

### 6. Tabela daily_snapshots
```sql
-- Habilitar RLS
ALTER TABLE public.daily_snapshots ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Baseada no cliente vinculado
CREATE POLICY "Snapshots access policy" ON public.daily_snapshots
FOR SELECT USING (
  auth.user_role() = 'admin' OR 
  (auth.user_role() = 'cliente' AND EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = daily_snapshots.cliente_id AND c.user_id = auth.uid()
  ))
);

-- Política para INSERT: Apenas admins
CREATE POLICY "Only admins can create snapshots" ON public.daily_snapshots
FOR INSERT WITH CHECK (auth.user_role() = 'admin');

-- Política para UPDATE: Apenas admins
CREATE POLICY "Only admins can update snapshots" ON public.daily_snapshots
FOR UPDATE USING (auth.user_role() = 'admin');

-- Política para DELETE: Apenas admins
CREATE POLICY "Only admins can delete snapshots" ON public.daily_snapshots
FOR DELETE USING (auth.user_role() = 'admin');
```

## 🔧 Triggers para Auditoria

### Trigger para atualizar updated_at
```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas principais
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## 🎯 Implementação no Frontend

### 1. Configuração do Cliente Supabase
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### 2. Middleware de Autenticação
```typescript
// src/middleware/auth.ts
import { supabase } from '../lib/supabase'

export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}

export const isAdmin = async () => {
  const profile = await getUserProfile()
  return profile?.tipo === 'admin'
}
```

### 3. Queries com RLS
```typescript
// src/services/clienteService.ts
import { supabase } from '../lib/supabase'

export const getClientes = async () => {
  // RLS automaticamente filtra baseado no usuário
  const { data, error } = await supabase
    .from('clientes')
    .select(`
      *,
      transacoes(*),
      carteiras(*, tokens(*)),
      daily_snapshots(*)
    `)
  
  if (error) throw error
  return data
}
```

## 🔍 Auditoria e Monitoramento

### Logs de Acesso
```sql
-- Criar tabela de logs de acesso
CREATE TABLE public.access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

### Monitoramento de Políticas
```sql
-- Query para verificar políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 📋 Checklist de Implementação

- [ ] Criar tabela `user_profiles`
- [ ] Implementar função `auth.user_role()`
- [ ] Adicionar coluna `user_id` nas tabelas necessárias
- [ ] Configurar políticas RLS para todas as tabelas
- [ ] Implementar triggers de auditoria
- [ ] Atualizar queries do frontend para usar RLS
- [ ] Testar acesso com diferentes roles
- [ ] Configurar logs de auditoria
- [ ] Documentar políticas para a equipe

## 🚨 Importante

1. **Sempre teste as políticas** antes de implementar em produção
2. **Backup do banco** antes de aplicar mudanças
3. **Monitore os logs** para identificar tentativas de acesso não autorizado
4. **Revise as políticas** periodicamente para garantir que ainda atendem aos requisitos

## 📞 Troubleshooting

### Problema: Usuário não consegue acessar dados
```sql
-- Verificar políticas aplicadas
SELECT * FROM pg_policies WHERE tablename = 'clientes';

-- Verificar role do usuário
SELECT auth.user_role();
```

### Problema: Performance lenta
```sql
-- Criar índices para otimizar RLS
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX idx_transacoes_cliente_id ON public.transacoes(cliente_id);
```

Esta configuração garante que apenas usuários autorizados acessem dados específicos, mantendo a segurança e integridade do sistema financeiro. 