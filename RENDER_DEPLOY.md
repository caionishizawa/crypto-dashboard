# ⚡ Deploy Rápido no Render

## 🚀 1. Acesse render.com
- Crie conta gratuita
- Conecte GitHub

## 📊 2. Criar Banco (30 segundos)
- "New" → "PostgreSQL"
- Nome: `crypto-dashboard-db`
- Copie a **External Database URL**

## 🔧 3. Deploy Backend (1 minuto)
- "New" → "Web Service"
- Repositório: `caionishizawa/crypto-dashboard`
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm run start:dev`

**Environment Variables:**
```
DATABASE_URL=sua-url-do-banco-aqui
JWT_SECRET=crypto-dashboard-jwt-secret-2024
NODE_ENV=production
CORS_ORIGINS=https://crypto-dashboard-frontend.onrender.com
```

## 🎨 4. Deploy Frontend (1 minuto)
- "New" → "Static Site"
- Mesmo repositório
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

**Environment Variables:**
```
VITE_API_URL=https://crypto-dashboard-backend.onrender.com/api
```

## ✅ 5. Testar
- Frontend: `https://crypto-dashboard-frontend.onrender.com`
- Login: admin@dashboard.com / admin123

## 🎯 Resultado: Site 100% Funcional!

- ✅ Frontend funcionando
- ✅ Backend funcionando  
- ✅ Banco funcionando
- ✅ SSL automático
- ✅ Domínio gratuito

**Total: 5 minutos para ter tudo online!** 