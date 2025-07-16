# 🚀 Deploy no Netlify + Supabase

Este guia mostra como fazer deploy do **Dashboard Crypto** no Netlify com Supabase como backend.

## 📋 Pré-requisitos

- Conta no [Netlify](https://netlify.co m)
- Conta no [Supabase](https://supabase.com)
- Git configurado
- Node.js 18+ instalado

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Defina:
   - **Name**: `crypto-dashboard`
   - **Database Password**: (gere uma senha forte)
   - **Region**: escolha a mais próxima
5. Clique em "Create new project"

### 2. Configurar Banco de Dados

Após criar o projeto, vá para **SQL Editor** no Supabase e execute as seguintes queries:

```sql
-- Criar tabela de usuários
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'cliente',
  data_registro TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de clientes
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
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
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cliente_id, data)
);

-- Criar tabela de performance
CREATE TABLE performance_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month VARCHAR(20) UNIQUE NOT NULL,
  btc_puro DECIMAL(5,2),
  btc_defi DECIMAL(5,2),
  usd_parado DECIMAL(5,2),
  usd_defi DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir dados iniciais de performance
INSERT INTO performance_data (month, btc_puro, btc_defi, usd_parado, usd_defi) VALUES
('Jan', 45.2, 52.8, 8.5, 12.3),
('Feb', 38.7, 48.9, 7.2, 11.8),
('Mar', 52.1, 61.4, 9.8, 14.2),
('Apr', 48.3, 56.7, 8.9, 13.1),
('May', 41.9, 49.5, 7.6, 11.4),
('Jun', 55.8, 64.2, 10.2, 15.6);

-- Inserir usuário admin inicial
INSERT INTO usuarios (nome, email, tipo) VALUES
('Administrador', 'admin@dashboard.com', 'admin');
```

### 3. Configurar Autenticação

1. Vá para **Authentication** no Supabase
2. Em **Settings**, configure:
   - **Site URL**: `https://seu-app.netlify.app`
   - **Redirect URLs**: `https://seu-app.netlify.app`
3. Habilite **Email Authentication**
4. Configure **Email Templates** se necessário

### 4. Configurar RLS (Row Level Security)

Execute no SQL Editor:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE carteiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessário)
CREATE POLICY "Usuários podem ver todos os clientes" ON clientes
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem criar clientes" ON clientes
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar clientes" ON clientes
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem deletar clientes" ON clientes
FOR DELETE USING (auth.role() = 'authenticated');
```

### 5. Obter Chaves do Supabase

1. Vá para **Settings** > **API** no Supabase
2. Copie:
   - **URL**: `https://seu-projeto.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🌐 Configuração do Netlify

### 1. Preparar o Projeto

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/crypto-dashboard.git
cd crypto-dashboard
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Edite o arquivo `.env`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ENVIRONMENT=production
```

### 2. Deploy no Netlify

#### Opção 1: Via Git (Recomendado)

1. Faça commit das alterações:
```bash
git add .
git commit -m "Configuração para Netlify + Supabase"
git push origin main
```

2. Acesse [Netlify Dashboard](https://app.netlify.com)
3. Clique em "New site from Git"
4. Conecte seu repositório GitHub
5. Configure:
   - **Branch**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

6. Adicione **Environment Variables**:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
   - `VITE_ENVIRONMENT`: `production`

7. Clique em "Deploy site"

#### Opção 2: Deploy Manual

1. Faça o build:
```bash
npm run build
```

2. Acesse Netlify Dashboard
3. Arraste a pasta `dist` para o campo "Deploy"

### 3. Configurar Domínio (Opcional)

1. Vá para **Domain settings** no Netlify
2. Adicione seu domínio customizado
3. Configure DNS conforme instruções
4. Atualize a **Site URL** no Supabase

## 🔧 Configurações Adicionais

### Headers de Segurança

O arquivo `netlify.toml` já inclui headers de segurança. Você pode adicionar mais:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
```

### Redirects Personalizados

Adicione redirects específicos no `netlify.toml`:

```toml
[[redirects]]
  from = "/admin"
  to = "/index.html"
  status = 200
  
[[redirects]]
  from = "/cliente"
  to = "/index.html"
  status = 200
```

### Formulários Netlify

Para capturar leads ou contatos:

```toml
[build]
  functions = "functions"
  
[[plugins]]
  package = "@netlify/plugin-functions"
```

## 🚀 Deploy Automático

O deploy será automático sempre que você fizer push para a branch `main`:

```bash
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

O Netlify irá:
1. Detectar mudanças no repositório
2. Instalar dependências
3. Executar build
4. Fazer deploy automático

## 📊 Monitoramento

### Logs do Netlify

- Acesse **Deploys** no Netlify Dashboard
- Veja logs de build e deploy
- Monitore erros e warnings

### Analytics do Supabase

- Acesse **Analytics** no Supabase
- Monitore queries e performance
- Acompanhe uso de recursos

## 🔒 Segurança

### Variáveis de Ambiente

- Nunca commite arquivos `.env`
- Use apenas variáveis `VITE_` para frontend
- Mantenha chaves privadas no Supabase

### Autenticação

- Configure RLS no Supabase
- Implemente validação adequada
- Use tokens JWT corretamente

### HTTPS

- Netlify inclui HTTPS automaticamente
- Certifique-se de que Supabase está configurado para HTTPS

## 🐛 Troubleshooting

### Erro de CORS

Se encontrar erros de CORS:

1. Vá para **Authentication** > **Settings** no Supabase
2. Adicione seu domínio Netlify em **Site URL**
3. Adicione em **Redirect URLs**

### Erro de Build

Se o build falhar:

1. Verifique logs no Netlify
2. Confirme que todas as dependências estão instaladas
3. Verifique se as variáveis de ambiente estão corretas

### Erro de Banco

Se houver problemas com o banco:

1. Verifique se as tabelas foram criadas
2. Confirme que RLS está configurado
3. Verifique se as políticas estão corretas

## 📞 Suporte

Para problemas específicos:

- **Netlify**: [Documentação](https://docs.netlify.com)
- **Supabase**: [Documentação](https://supabase.com/docs)
- **Projeto**: Criar issue no GitHub

## 🎉 Conclusão

Agora você tem um sistema completo:
- ✅ Frontend hospedado no Netlify
- ✅ Backend no Supabase
- ✅ Autenticação configurada
- ✅ Banco de dados PostgreSQL
- ✅ Deploy automático
- ✅ HTTPS habilitado

Seu dashboard está pronto para uso em produção! 🚀 