# 🚀 Dashboard Administrativo - Gestão de Carteiras Crypto

Painel administrativo moderno para gestão de clientes e suas carteiras de criptomoedas (Solana e Ethereum) com integração às APIs Helius e Debank.

## ✨ Funcionalidades Implementadas

### 🔐 Sistema de Autenticação Completo

- **Tela de Login**: Interface moderna com validação de credenciais
- **Tela de Cadastro**: Registro de novos usuários com validação
- **Proteção de Rotas**: Acesso restrito ao dashboard apenas para usuários logados
- **Sessão Persistente**: Mantém login ativo usando LocalStorage
- **Logout Seguro**: Botão de sair que limpa a sessão completamente

### 🏠 Painel Administrativo com Abas

- **Aba Clientes**: Visualização e gestão de todos os clientes
- **Aba Carteiras**: Vinculação e monitoramento de carteiras blockchain  
- **Aba Snapshots**: Histórico de snapshots diários automáticos

### 💰 Gestão de Carteiras

- Suporte para carteiras **Solana** e **Ethereum**
- Integração com APIs **Helius** (Solana) e **Debank** (Ethereum)
- Visualização em tempo real do valor das carteiras
- Listagem de tokens e seus valores em USD

### 📊 Sistema de Snapshots Diários

- Captura automática de dados das carteiras
- Histórico completo de valores por data
- Snapshots individuais e globais (todos os clientes)
- Armazenamento de dados de tokens e valores

### 📈 Gráficos Dinâmicos e Modernos

- Gráficos redesenhados com estilo mais limpo e dinâmico
- Efeitos visuais modernos com gradientes e animações
- Comparação entre estratégias (BTC parado vs BTC + DeFi, USD parado vs USD + DeFi)
- Indicadores de performance em tempo real

### 👥 Base de Dados de Clientes

- Visualização aprimorada da lista de clientes
- Indicação de número de carteiras vinculadas
- Informações detalhadas de performance
- Sistema de tipos de perfil (Bitcoin/Conservador)

## 🛠️ Tecnologias Utilizadas

- **React 18** + **TypeScript**
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Recharts** para gráficos interativos
- **Lucide React** para ícones modernos
- **Axios** para chamadas às APIs blockchain

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dash-vite
```

O projeto estará disponível em `http://localhost:5173`

### 🔑 Credenciais de Demonstração

Para testar o sistema imediatamente, use estas credenciais:

**Conta Administrador:**
- **Email:** `admin@dashboard.com`
- **Senha:** `admin123`

**Ou crie uma nova conta** usando o botão "Cadastre-se" na tela de login.

## 📁 Estrutura do Projeto

```
src/
├── App.tsx              # Componente principal com todas as funcionalidades
├── main.tsx             # Ponto de entrada da aplicação
├── index.css            # Estilos globais
└── vite-env.d.ts        # Tipagens TypeScript para Vite
```

## 🔧 APIs Integradas

### Helius (Solana)
- Endpoint simulado para buscar dados de carteiras Solana
- Retorna balance de SOL, USDC e outros tokens SPL
- Valores atualizados em tempo real

### Debank (Ethereum)  
- Endpoint simulado para carteiras Ethereum
- Suporte a ETH, USDT, USDC e outros tokens ERC-20
- Integração com protocolos DeFi

## 📊 Funcionalidades dos Snapshots

1. **Snapshot Individual**: Captura dados de uma carteira específica
2. **Snapshot Global**: Captura dados de todas as carteiras de todos os clientes
3. **Histórico**: Mantém registro das 5 capturas mais recentes
4. **Dados Salvos**: 
   - Valor total em USD
   - Breakdown por carteira
   - Lista de tokens e quantities

## 🎨 Melhorias Visuais

- Interface dark mode com gradientes modernos
- Componentes com bordas arredondadas e sombras
- Animações CSS sutis (pulse, hover effects)
- Tipografia consistente e hierárquica
- Cores temáticas para diferentes blockchains:
  - 🟣 Roxo para Solana
  - 🔵 Azul para Ethereum
  - 🟠 Laranja para Bitcoin

## 🔐 Detalhes do Sistema de Autenticação

### Funcionalidades de Segurança
- **Validação de Formulários**: Verificação de campos obrigatórios e formatação
- **Verificação de Email Único**: Impede cadastro de emails duplicados
- **Validação de Senhas**: Mínimo de 6 caracteres e confirmação obrigatória
- **Feedback Visual**: Mensagens de erro claras e intuitivas
- **Sessão Automática**: Login persistente entre sessões do navegador

### Fluxo de Autenticação
1. **Primeira Visita**: Usuário vê tela de login automaticamente
2. **Login/Cadastro**: Validação de credenciais em tempo real
3. **Acesso ao Dashboard**: Redirecionamento automático após autenticação
4. **Persistência**: Sessão mantida mesmo após fechar o navegador
5. **Logout**: Limpeza completa da sessão e redirecionamento para login

### Interface do Sistema
- **Design Moderno**: Gradientes e efeitos visuais elegantes
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **UX Intuitiva**: Transições suaves entre login e cadastro
- **Credenciais Demo**: Conta de teste pré-configurada para facilitar acesso

## 🔮 Próximos Passos

1. Implementar conexão real com APIs Helius e Debank
2. ~~Adicionar sistema de autenticação~~ ✅ **CONCLUÍDO**
3. Persistência de dados em banco de dados
4. Notificações em tempo real
5. Exportação de relatórios
6. Dashboard mobile responsivo
7. Recuperação de senha por email
8. Autenticação de dois fatores (2FA)

## 📝 Notas Técnicas

- Todas as integrações com APIs estão simuladas com dados mock
- Sistema de tipos TypeScript completo para type safety
- Componentes funcionais com React Hooks
- Estado gerenciado localmente com useState
- Estrutura modular e escalável

---

**Desenvolvido em Português** 🇧🇷 | **Compatível com Node.js 18+** ⚡
