# 🚀 Deploy no Vercel + Supabase

## 📋 Pré-requisitos

1. **Conta no Supabase** (gratuita)
2. **Conta no Vercel** (gratuita)
3. **GitHub** (para conectar o repositório)

## 🌐 Passo 1: Configurar Supabase

### 1.1 Criar Projeto no Supabase
1. Acesse: https://supabase.com
2. Clique em "New Project"
3. Escolha nome e senha
4. Aguarde a criação (2-3 minutos)

### 1.2 Obter Connection String
1. Vá em **Settings** > **Database**
2. Copie a **Connection String**
3. Substitua `[YOUR-PASSWORD]` pela senha do banco

**Exemplo:**
```
postgresql://postgres.abcdefgh:SUA-SENHA@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 1.3 Criar Tabelas
1. Vá em **SQL Editor** no Supabase
2. Execute este script:

```sql
-- Criar tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'cliente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de carteiras
CREATE TABLE carteiras (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    saldo DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de transações
CREATE TABLE transacoes (
    id SERIAL PRIMARY KEY,
    carteira_id INTEGER REFERENCES carteiras(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    descricao TEXT,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin
INSERT INTO usuarios (nome, email, senha, tipo) VALUES 
('Admin', 'admin@dashboard.com', '$2b$10$8K1p/a0dFCzCwWNZyaP8pOwNL9L9Y6hQJjWFOg9zULpLPg5tQTa2m', 'admin');
```

## 🚀 Passo 2: Deploy no Vercel

### 2.1 Preparar Repositório GitHub
1. Faça commit das alterações:
```bash
git add .
git commit -m "Configuração para deploy Vercel"
git push origin main
```

### 2.2 Conectar no Vercel
1. Acesse: https://vercel.com
2. Conecte sua conta GitHub
3. Clique em "New Project"
4. Selecione seu repositório
5. Configure:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2.3 Configurar Variáveis de Ambiente
No Vercel Dashboard > Settings > Environment Variables:

```
DATABASE_URL = sua-connection-string-supabase
JWT_SECRET = uma-chave-secreta-forte
NODE_ENV = production
```

### 2.4 Deploy
1. Clique em "Deploy"
2. Aguarde 2-3 minutos
3. Seu site estará online!

## 🎉 Resultado

Você terá:
- **Frontend:** https://seu-projeto.vercel.app
- **Backend:** https://seu-projeto.vercel.app/api
- **Banco:** Supabase (PostgreSQL)
- **Domínio:** Gratuito Vercel
- **SSL:** Automático

## 🔧 Comandos Úteis

```bash
# Testar localmente
npm run dev

# Fazer deploy
git push origin main

# Ver logs
npx vercel logs
```

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no Vercel
2. Teste a conexão com o banco
3. Confirme as variáveis de ambiente 