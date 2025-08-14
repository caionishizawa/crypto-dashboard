# Dashboard Financeiro

Uma aplicação web completa para gerenciamento de carteiras de investimento e clientes, construída com React (frontend) e Node.js (backend).

## 🚀 Tecnologias

### Frontend
- **React** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Axios** para requisições HTTP

### Backend
- **Node.js** com TypeScript
- **Express.js** como framework web
- **Prisma** como ORM
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **bcrypt** para criptografia

## 📁 Estrutura do Projeto

```
dash/
├── api/                    # API routes para Netlify
├── backend/               # Servidor Node.js
│   ├── prisma/           # Schema do banco de dados
│   ├── src/
│   │   ├── controllers/  # Controladores
│   │   ├── middleware/   # Middlewares
│   │   ├── routes/       # Rotas da API
│   │   ├── services/     # Serviços
│   │   └── utils/        # Utilitários
├── src/                  # Frontend React
│   ├── components/       # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços do frontend
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Utilitários
└── public/              # Arquivos estáticos
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- PostgreSQL

### 1. Clone o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd dash
```

### 2. Configure o backend
```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend/` baseado no `.env.example`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/dashboard_db"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3001
```

### 3. Configure o banco de dados
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Configure o frontend
```bash
cd ..
npm install
```

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```env
VITE_API_URL=http://localhost:3001
```

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dash-vite
```

### Produção
```bash
# Build do frontend
npm run build

# Executar backend em produção
cd backend
npm start
```

## 📋 Funcionalidades

### Autenticação
- Login/Registro de usuários
- Verificação de email
- Recuperação de senha
- Autenticação JWT

### Dashboard
- Visão geral das carteiras
- Gráficos de performance
- Métricas financeiras

### Gestão de Clientes
- Cadastro de clientes
- Edição de informações
- Histórico de transações

### Carteiras de Investimento
- Criação de carteiras
- Adição de ativos
- Acompanhamento de performance
- Relatórios

## 🔧 Scripts Disponíveis

### Frontend
- `npm run dash-vite` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção

### Backend
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Inicia o servidor de produção

## 🌐 Deploy

### Netlify (Frontend)
O projeto está configurado para deploy no Netlify com o arquivo `netlify.toml`.

### Render (Backend)
O projeto está configurado para deploy no Render com o arquivo `render.yaml`.

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
