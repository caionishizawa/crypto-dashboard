# ⚡ Deploy Rápido - Render + PostgreSQL

## 🚀 Deploy em 10 minutos!

### 1. Render PostgreSQL (2 min)
- Acesse: https://render.com
- Crie conta gratuita
- Vá em **Dashboard** → **New** → **PostgreSQL**
- Configure database e aguarde criação
- Copie a **External Database URL**

### 2. GitHub (2 min)
```bash
git add .
git commit -m "Deploy para Render"
git push origin main
```

### 3. Render Web Service (3 min)
- No Render: **New** → **Web Service**
- Conecte GitHub e selecione repositório
- Configure:
  - **Build Command**: `npm run build`
  - **Start Command**: `npm start`
  - **Environment**: Node
- Configurar Environment Variables:
  - `DATABASE_URL`: sua-external-database-url
  - `JWT_SECRET`: uma-chave-secreta-forte
  - `NODE_ENV`: production
- Deploy!

### 4. Teste (1 min)
- Acesse seu site: https://seu-projeto.onrender.com
- Login: admin@dashboard.com / admin123

## ✅ Pronto! Seu site está online!

🌐 **Frontend:** Render (grátis)
🗄️ **Backend:** Render (grátis)
📊 **Banco:** Render PostgreSQL (grátis)
🔒 **SSL:** Automático
📱 **Domínio:** .onrender.com (grátis) 