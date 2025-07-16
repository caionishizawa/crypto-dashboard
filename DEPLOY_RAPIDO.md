# ⚡ Deploy Rápido - Vercel + Supabase

## 🚀 Deploy em 10 minutos!

### 1. Supabase (2 min)
- Acesse: https://supabase.com
- Crie conta e projeto
- Vá em **SQL Editor** → Execute:
```sql
CREATE TABLE usuarios (id SERIAL PRIMARY KEY, nome VARCHAR(100), email VARCHAR(150) UNIQUE, senha VARCHAR(255), tipo VARCHAR(20) DEFAULT 'cliente');
CREATE TABLE carteiras (id SERIAL PRIMARY KEY, usuario_id INTEGER REFERENCES usuarios(id), nome VARCHAR(100), saldo DECIMAL(15, 2) DEFAULT 0.00);
CREATE TABLE transacoes (id SERIAL PRIMARY KEY, carteira_id INTEGER REFERENCES carteiras(id), tipo VARCHAR(20), valor DECIMAL(15, 2), descricao TEXT, data TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO usuarios (nome, email, senha, tipo) VALUES ('Admin', 'admin@dashboard.com', '$2b$10$8K1p/a0dFCzCwWNZyaP8pOwNL9L9Y6hQJjWFOg9zULpLPg5tQTa2m', 'admin');
```
- Copie a **Connection String** (Settings → Database)

### 2. GitHub (2 min)
```bash
git add .
git commit -m "Deploy para Vercel"
git push origin main
```

### 3. Vercel (3 min)
- Acesse: https://vercel.com
- Conecte GitHub
- Importar projeto
- Configurar Environment Variables:
  - `DATABASE_URL`: sua-connection-string-supabase
  - `JWT_SECRET`: uma-chave-secreta-forte
  - `NODE_ENV`: production
- Deploy!

### 4. Teste (1 min)
- Acesse seu site: https://seu-projeto.vercel.app
- Login: admin@dashboard.com / admin123

## ✅ Pronto! Seu site está online!

🌐 **Frontend:** Vercel (grátis)
🗄️ **Backend:** Vercel Functions (grátis)
📊 **Banco:** Supabase (grátis)
🔒 **SSL:** Automático
📱 **Domínio:** .vercel.app (grátis) 