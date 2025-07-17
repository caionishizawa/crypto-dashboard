# 🚀 Como Fazer o Banco de Dados Funcionar no Netlify

## 📊 Situação Atual

Seu site está no **"Modo Offline"** (indicador amarelo no topo direito) porque as variáveis de ambiente do Supabase não estão configuradas no Netlify.

## 🔧 Etapas para Ativar o Banco de Dados

### 1. **Obter as Chaves do Supabase**

1. Vá para o seu projeto no Supabase
2. **Settings** → **API** 
3. Copie:
   - **URL**: `https://spopnfahfydqnpgqcaw.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. **Configurar Variáveis de Ambiente no Netlify**

1. Vá para o **Netlify Dashboard**
2. Abra seu projeto `courageous-jelly-382fd9`
3. **Site settings** → **Environment variables**
4. Clique em **Add new variable**
5. Adicione estas 2 variáveis:

```bash
VITE_SUPABASE_URL=https://spopnfahfydqnpgqcaw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sua-chave-aqui
```

### 3. **Criar as Tabelas no Supabase**

1. No Supabase, vá para **SQL Editor**
2. Execute este script:

```sql
-- Criar tabela de clientes
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  data_inicio DATE NOT NULL,
  investimento_inicial DECIMAL(15,2) NOT NULL,
  btc_total DECIMAL(15,8) DEFAULT 0,
  preco_medio DECIMAL(15,2) DEFAULT 0,
  valor_atual_btc DECIMAL(15,2) DEFAULT 0,
  valor_carteira_defi DECIMAL(15,2) DEFAULT 0,
  total_depositado DECIMAL(15,2) DEFAULT 0,
  valor_atual_usd DECIMAL(15,2) DEFAULT 0,
  rendimento_total DECIMAL(15,2) DEFAULT 0,
  apy_medio DECIMAL(5,2) DEFAULT 0,
  tempo_mercado VARCHAR(100) DEFAULT '',
  score_risco VARCHAR(50) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de transações
CREATE TABLE transacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  btc_amount DECIMAL(15,8),
  usd_value DECIMAL(15,2) NOT NULL,
  btc_price DECIMAL(15,2),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de carteiras
CREATE TABLE carteiras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endereco VARCHAR(255) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  nome VARCHAR(255),
  valor_atual DECIMAL(15,2),
  ultima_atualizacao TIMESTAMP,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de tokens
CREATE TABLE tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  balance DECIMAL(20,8) NOT NULL,
  value_usd DECIMAL(15,2) NOT NULL,
  carteira_id UUID REFERENCES carteiras(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de snapshots diários
CREATE TABLE daily_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(data, cliente_id)
);
```

### 4. **Configurar RLS (Row Level Security)**

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE carteiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todos os usuários autenticados)
CREATE POLICY "Users can view all clients" ON clientes
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create clients" ON clientes
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update clients" ON clientes
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete clients" ON clientes
FOR DELETE USING (auth.role() = 'authenticated');

-- Aplicar políticas similares para outras tabelas
CREATE POLICY "Users can view all transactions" ON transacoes
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create transactions" ON transacoes
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view all wallets" ON carteiras
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create wallets" ON carteiras
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view all tokens" ON tokens
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all snapshots" ON daily_snapshots
FOR SELECT USING (auth.role() = 'authenticated');
```

### 5. **Corrigir URLs de Autenticação**

1. No Supabase, vá para **Authentication** → **URL Configuration**
2. Configure:
   - **Site URL**: `https://courageous-jelly-382fd9.netlify.app`
   - **Redirect URLs**: `https://courageous-jelly-382fd9.netlify.app`

### 6. **Fazer Deploy**

1. Após configurar as variáveis de ambiente no Netlify
2. Faça um novo deploy:
   - Vá para **Deploys** no Netlify
   - Clique em **Trigger deploy** → **Deploy site**

## 🎯 Resultado Esperado

Após completar todas as etapas:

1. **Indicador mudará de amarelo para verde** (Modo Online)
2. **Dados serão salvos no Supabase** (não mais no localStorage)
3. **Autenticação funcionará** via Supabase
4. **Múltiplos usuários** poderão acessar o sistema
5. **Dados persistirão** entre sessões

## ✅ Como Verificar se Funcionou

1. **Acesse seu site**: `https://courageous-jelly-382fd9.netlify.app`
2. **Procure pelo indicador verde** no topo direito: "Modo Online"
3. **Faça login** com: `admin@dashboard.com` / `admin123`
4. **Crie um novo cliente** e veja se aparece no banco do Supabase

## 🚨 Problemas Comuns

### Problema: Indicador continua amarelo
- **Solução**: Verifique se as variáveis de ambiente estão corretas no Netlify

### Problema: Erro de autenticação
- **Solução**: Verifique se as URLs estão configuradas corretamente no Supabase

### Problema: Dados não aparecem
- **Solução**: Verifique se as tabelas foram criadas e se RLS está configurado

## 📞 Suporte

Se algo não funcionar:

1. Verifique o console do navegador (F12) para erros
2. Confirme se as variáveis de ambiente estão no Netlify
3. Teste as tabelas no Supabase com um SELECT simples
4. Verifique se o RLS está configurado corretamente

**Lembre-se**: O sistema já funciona em modo offline, então você pode usar enquanto configura o banco de dados! 