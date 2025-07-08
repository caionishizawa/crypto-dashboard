# 🚀 Crypto Dashboard

Dashboard profissional de criptomoedas desenvolvido com **React**, **TypeScript** e **Vite**.

## ✨ Funcionalidades

- 🔐 **Sistema de Autenticação** (Admin/Cliente)
- 📊 **Dashboard Administrativo** com gestão de usuários
- 💰 **Visualização de Carteiras** com comparações BTC vs DeFi
- 📈 **Gráficos de Performance** interativos
- 📸 **Sistema de Snapshots** com histórico semanal
- 🎨 **Interface Moderna** com Tailwind CSS
- 📱 **Design Responsivo**

## 🛠️ Tecnologias

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilização)
- **Chart.js** (gráficos)
- **Lucide React** (ícones)
- **Arquitetura Modular** com separação de responsabilidades

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/caionishizawa/crypto-dashboard.git

# Entre na pasta do projeto
cd crypto-dashboard

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dash-vite
```

O projeto estará disponível em: **http://localhost:5173**

## 👥 Usuários de Teste

### Administrador
- **Email**: `admin@crypto.com`
- **Senha**: `admin123`

### Clientes
- **Email**: `joao@email.com` | **Senha**: `123456`
- **Email**: `maria@email.com` | **Senha**: `123456`
- **Email**: `carlos@email.com` | **Senha**: `123456`

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   └── auth/            # Componentes de autenticação
├── pages/               # Páginas da aplicação
├── services/            # Lógica de negócio e APIs
├── types/               # Definições TypeScript
├── data/                # Dados mockados
├── utils/               # Funções utilitárias
└── App.tsx              # Componente principal
```

## 🔧 Scripts Disponíveis

```bash
npm run dash-vite        # Servidor de desenvolvimento
npm run build           # Build de produção
npm run preview         # Preview do build
npm run lint            # Verificação de código
```

## 📊 Funcionalidades Principais

### Admin Dashboard
- Gestão completa de usuários
- Visualização de todas as carteiras
- Sistema de snapshots administrativo

### Cliente Dashboard  
- Visualização da carteira pessoal
- Comparação BTC vs estratégias DeFi
- Gráficos de performance histórica
- Snapshots semanais com comparações

## 🏗️ Arquitetura

Projeto desenvolvido com **arquitetura modular** seguindo boas práticas:

- **Separação de responsabilidades**
- **Tipagem completa com TypeScript**
- **Componentes reutilizáveis**
- **Services para lógica de negócio**
- **Estrutura escalável**

## 📄 Licença

Este projeto é de uso educacional e demonstrativo.

---

**Desenvolvido com ❤️ por [Caio Nishizawa](https://github.com/caionishizawa)**
