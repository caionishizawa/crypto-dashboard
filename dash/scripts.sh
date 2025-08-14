#!/bin/bash

# 🚀 CRYPTO DASHBOARD - SCRIPT UNIFICADO
# =====================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

info() {
    echo -e "${BLUE}[DICA]${NC} $1"
}

# Função para mostrar menu principal
show_menu() {
    echo "🚀 Crypto Dashboard - Script Unificado"
    echo "======================================"
    echo "1. 🏗️  Setup inicial completo"
    echo "2. 🌐 Configurar banco na nuvem (Supabase)"
    echo "3. 🔄 Alternar entre banco local/nuvem"
    echo "4. 🚀 Iniciar sistema de desenvolvimento"
    echo "5. 🔧 Corrigir problemas de CORS/Frontend"
    echo "6. 📦 Deploy para produção"
    echo "7. 🗄️  Gerenciar banco de dados"
    echo "8. 🧹 Limpar e reinstalar"
    echo "9. 📋 Backup e restore"
    echo "10. ❌ Sair"
    echo "======================================"
    echo -n "Escolha uma opção [1-10]: "
}

# 1. Setup inicial completo
setup_inicial() {
    log "🏗️ Iniciando setup completo..."
    
    # Verificar se PostgreSQL está instalado
    if ! command -v psql &> /dev/null; then
        log "📦 Instalando PostgreSQL..."
        sudo apt update
        sudo apt install postgresql postgresql-contrib -y
    fi
    
    # Configurar banco local
    log "🗄️ Configurando banco de dados local..."
    sudo -u postgres psql -c "CREATE DATABASE crypto_dashboard;" 2>/dev/null || echo "Banco já existe"
    sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'password';" 2>/dev/null || echo "Usuário já existe"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE crypto_dashboard TO postgres;" 2>/dev/null
    
    # Backend setup
    log "⚙️ Configurando backend..."
    cd backend
    npm install
    
    # Criar .env para desenvolvimento local
    if [ ! -f .env ]; then
        cat > .env << 'EOF'
# 💻 CONFIGURAÇÃO LOCAL DE DESENVOLVIMENTO
DATABASE_URL="postgresql://postgres:password@localhost:5432/crypto_dashboard?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET="crypto-dashboard-jwt-secret-dev"
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:3000"
EOF
        log "✅ Arquivo .env criado no backend"
    fi
    
    npx prisma db push
    npx prisma generate
    npm run db:seed
    cd ..
    
    # Frontend setup
    log "🎨 Configurando frontend..."
    npm install
    
    # Criar .env para frontend
    if [ ! -f .env ]; then
        echo 'VITE_API_URL=http://localhost:3001/api' > .env
        log "✅ Arquivo .env criado no frontend"
    fi
    
    # Configurar Vite para porta 5173
    if [ -f "vite.config.ts" ]; then
        cp vite.config.ts vite.config.ts.backup
        cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
EOF
        log "✅ Vite configurado para porta 5173"
    fi
    
    log "🎉 Setup completo! Use a opção 4 para iniciar desenvolvimento."
}

# 2. Configurar banco na nuvem (Supabase)
setup_supabase() {
    log "🌐 Configurando banco na nuvem (Supabase)..."
    
    echo "📋 INSTRUÇÕES PARA SUPABASE:"
    echo "1. Acesse: https://supabase.com"
    echo "2. Faça login com GitHub"
    echo "3. Clique 'New Project'"
    echo "4. Configure:"
    echo "   - Nome: crypto-dashboard"
    echo "   - Senha: (anote bem!)"
    echo "   - Região: South America (São Paulo)"
    echo "5. Aguarde criação (2-3 minutos)"
    echo "6. Vá em Settings > Database"
    echo "7. Copie Connection String"
    echo ""
    
    echo -n "Você já criou o projeto no Supabase? [s/N]: "
    read created
    
    if [ "$created" = "s" ]; then
        echo ""
        echo "📝 Cole aqui sua Connection String do Supabase:"
        echo "Formato: postgresql://postgres.xxx:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
        echo -n "Connection String: "
        read connection_string
        
        if [ -n "$connection_string" ]; then
            # Converter para porta 5432 (direct connection)
            direct_url=$(echo "$connection_string" | sed 's/:6543/:5432/g' | sed 's/?pgbouncer=true/?sslmode=require\&connect_timeout=10/g')
            
            # Criar .env para Supabase
            cat > backend/.env << EOF
# 🌐 CONFIGURAÇÃO DO BANCO NA NUVEM (SUPABASE)
DATABASE_URL="$direct_url"
JWT_SECRET="sua_chave_jwt_super_segura_aqui"
NODE_ENV=production
PORT=3001
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:3000"
EOF
            
            log "✅ Configuração do Supabase salva!"
            
            # Tentar migrar dados
            log "🚀 Tentando migrar dados para Supabase..."
            cd backend
            if npx prisma db push --skip-generate; then
                npx prisma generate
                npm run db:seed
                log "✅ Dados migrados com sucesso!"
            else
                warn "❌ Erro na migração. Verifique a connection string."
            fi
            cd ..
        fi
    else
        echo "💡 Primeiro crie o projeto no Supabase e volte aqui!"
    fi
}

# 3. Alternar entre banco local/nuvem
alternar_banco() {
    log "🔄 Alternador de Banco de Dados"
    echo "==============================="
    echo "1. 💻 Usar banco LOCAL (PostgreSQL local)"
    echo "2. 🌐 Usar banco NA NUVEM (Supabase)"
    echo "3. 📋 Ver configuração atual"
    echo "4. 🔙 Voltar"
    echo -n "Escolha [1-4]: "
    
    read banco_choice
    case $banco_choice in
        1)
            log "💻 Configurando para banco LOCAL..."
            cat > backend/.env << 'EOF'
# 💻 CONFIGURAÇÃO DE BANCO LOCAL
DATABASE_URL="postgresql://postgres:password@localhost:5432/crypto_dashboard?schema=public"
JWT_SECRET="crypto-dashboard-jwt-secret-dev"
NODE_ENV=development
PORT=3001
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:3000"
EOF
            log "✅ Configurado para banco LOCAL!"
            info "🎯 Vantagens: Mais rápido, privado, funciona offline"
            ;;
        2)
            log "🌐 Configurando para banco NA NUVEM..."
            echo -n "Cole sua Connection String do Supabase: "
            read connection_string
            
            if [ -n "$connection_string" ]; then
                direct_url=$(echo "$connection_string" | sed 's/:6543/:5432/g' | sed 's/?pgbouncer=true/?sslmode=require\&connect_timeout=10/g')
                
                cat > backend/.env << EOF
# 🌐 CONFIGURAÇÃO DE BANCO NA NUVEM (SUPABASE)
DATABASE_URL="$direct_url"
JWT_SECRET="sua_chave_jwt_super_segura_aqui"
NODE_ENV=production
PORT=3001
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:3000"
EOF
                log "✅ Configurado para banco NA NUVEM!"
                info "🎯 Vantagens: Compartilhamento, backup automático"
            fi
            ;;
        3)
            log "📋 Verificando configuração atual..."
            if [ -f "backend/.env" ]; then
                echo "📄 Conteúdo do backend/.env:"
                cat backend/.env | head -5
                echo ""
                if grep -q "localhost" backend/.env; then
                    info "🎯 Configuração atual: BANCO LOCAL"
                elif grep -q "supabase" backend/.env; then
                    info "🎯 Configuração atual: BANCO NA NUVEM"
                else
                    warn "❓ Configuração não identificada"
                fi
            else
                warn "❌ Arquivo backend/.env não encontrado"
            fi
            ;;
        4)
            return
            ;;
    esac
}

# 4. Iniciar sistema de desenvolvimento
start_dev() {
    log "🚀 Iniciando sistema completo..."
    
    # Parar processos antigos
    pkill -f "nodemon" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    sleep 2
    
    # Verificar configuração
    if [ ! -f "backend/.env" ]; then
        error "❌ Backend não configurado. Execute o setup primeiro."
        return
    fi
    
    if [ ! -f ".env" ]; then
        error "❌ Frontend não configurado. Execute o setup primeiro."
        return
    fi
    
    # Função para limpar ao sair
    cleanup() {
        log "🛑 Parando serviços..."
        pkill -f "nodemon" 2>/dev/null || true
        pkill -f "vite" 2>/dev/null || true
        exit 0
    }
    
    trap cleanup SIGINT
    
    # Iniciar backend
    log "🔧 Iniciando backend..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Aguardar backend iniciar
    log "⏳ Aguardando backend iniciar..."
    for i in {1..30}; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            log "✅ Backend iniciado!"
            break
        fi
        sleep 1
    done
    
    # Iniciar frontend
    log "🌐 Iniciando frontend..."
    npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    log "🎉 Sistema iniciado!"
    info "📊 Backend: http://localhost:3001/health"
    info "🌐 Frontend: http://localhost:5173"
    info "👤 Login Admin: admin@dashboard.com / admin123"
    info "👤 Login Cliente: cliente@dashboard.com / cliente123"
    echo ""
    warn "Pressione Ctrl+C para parar os serviços"
    
    # Aguardar processos
    wait
}

# 5. Corrigir problemas de CORS/Frontend
corrigir_cors() {
    log "🔧 Corrigindo problemas de CORS e Frontend..."
    
    # Parar processos antigos
    pkill -f "nodemon" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    sleep 2
    
    # Corrigir CORS no backend
    if [ -f "backend/.env" ]; then
        # Atualizar apenas a linha CORS_ORIGINS
        sed -i 's/CORS_ORIGINS=.*/CORS_ORIGINS="http:\/\/localhost:5173,http:\/\/localhost:5174,http:\/\/localhost:3000"/' backend/.env
        log "✅ CORS corrigido no backend"
    fi
    
    # Configurar Vite para porta 5173
    if [ -f "vite.config.ts" ]; then
        cp vite.config.ts vite.config.ts.backup
        cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
EOF
        log "✅ Vite configurado para porta 5173"
    fi
    
    # Verificar .env do frontend
    if [ ! -f ".env" ]; then
        echo 'VITE_API_URL=http://localhost:3001/api' > .env
        log "✅ Arquivo .env criado no frontend"
    fi
    
    log "✅ Problemas de CORS corrigidos!"
    info "🚀 Use a opção 4 para iniciar o sistema"
}

# 6. Deploy para produção
deploy_prod() {
    log "🚀 Preparando deploy para produção..."
    
    echo "🌐 OPÇÕES DE DEPLOY GRATUITAS:"
    echo "1. 🏆 Render (Recomendado)"
    echo "2. 🌟 Netlify + Supabase"
    echo "3. 📖 Ver guia completo"
    echo "4. 🔙 Voltar"
    echo -n "Escolha [1-4]: "
    
    read deploy_choice
    case $deploy_choice in
        1)
            log "🏆 Preparando para Render..."
            
            # Build do projeto
            log "🔨 Fazendo build..."
            npm run build
            cd backend && npm run build && cd ..
            
            log "✅ Build concluído!"
            info "📖 Próximos passos:"
            info "1. 🚀 Acesse: https://render.com"
            info "2. 🌐 Conecte GitHub e configure Web Service"
            info "3. ⚙️ Configure variáveis de ambiente"
            ;;
        2)
            log "🌟 Preparando para Netlify + Supabase..."
            
            # Build do projeto
            npm run build
            
            # Criar configuração Netlify
            cat > netlify.toml << 'EOF'
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
            
            log "✅ Configuração do Netlify criada!"
            info "📖 Próximos passos:"
            info "1. 🗄️ Banco: https://supabase.com - criar projeto"
            info "2. 🚀 Backend: https://render.com - conecte GitHub"
            info "3. 🌐 Frontend: https://netlify.com - conecte GitHub"
            ;;
        3)
            log "🔥 Preparando para Render..."
            
            # Build do projeto
            npm run build
            cd backend && npm run build && cd ..
            
            log "✅ Builds concluídos!"
            info "📖 Próximos passos:"
            info "1. 🌐 Acesse: https://render.com"
            info "2. 🗄️ Crie PostgreSQL Database"
            info "3. 🚀 Crie Web Service para backend"
            info "4. 🌐 Crie Static Site para frontend"
            ;;
        4)
            info "📖 Guias completos disponíveis:"
            info "- DEPLOY_GUIDE.md"
            info "- DEPLOY_PLATFORMS.md"
            info "- DEPLOY_GRATUITO.md"
            ;;
        5)
            return
            ;;
    esac
}

# 7. Gerenciar banco de dados
manage_db() {
    log "🗄️ Gerenciamento do Banco de Dados"
    echo "================================="
    echo "1. 📊 Abrir Prisma Studio"
    echo "2. 🔄 Aplicar migrações"
    echo "3. 🌱 Popular com dados (seed)"
    echo "4. 🔄 Reset completo do banco"
    echo "5. 📋 Ver logs do PostgreSQL"
    echo "6. 🔙 Voltar"
    echo -n "Escolha [1-6]: "
    
    read db_choice
    case $db_choice in
        1)
            log "📊 Abrindo Prisma Studio..."
            cd backend && npx prisma studio
            ;;
        2)
            log "🔄 Aplicando migrações..."
            cd backend
            npx prisma db push
            npx prisma generate
            log "✅ Migrações aplicadas!"
            ;;
        3)
            log "🌱 Populando banco com dados..."
            cd backend && npm run db:seed
            ;;
        4)
            warn "⚠️ ATENÇÃO: Isso apagará todos os dados!"
            echo -n "Confirma o reset? [s/N]: "
            read confirm
            if [ "$confirm" = "s" ]; then
                cd backend
                npx prisma db push --force-reset
                npx prisma generate
                npm run db:seed
                log "✅ Banco resetado e populado!"
            fi
            ;;
        5)
            log "📋 Mostrando logs do PostgreSQL..."
            sudo tail -f /var/log/postgresql/postgresql-*.log
            ;;
        6)
            return
            ;;
    esac
}

# 8. Limpar e reinstalar
clean_install() {
    log "🧹 Limpando projeto..."
    
    # Parar processos
    pkill -f "nodemon" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    log "🗑️ Removendo node_modules..."
    rm -rf node_modules
    rm -rf backend/node_modules
    
    log "🗑️ Removendo builds..."
    rm -rf dist
    rm -rf backend/dist
    
    log "🗑️ Removendo locks..."
    rm -f package-lock.json
    rm -f backend/package-lock.json
    
    log "📦 Reinstalando dependências..."
    npm install
    cd backend && npm install && cd ..
    
    log "🔄 Reconfigurando Prisma..."
    cd backend
    npx prisma generate
    if [ -f .env ]; then
        npx prisma db push
        npm run db:seed
    fi
    cd ..
    
    log "✅ Projeto limpo e reinstalado!"
}

# 9. Backup e restore
backup_restore() {
    log "💾 Backup e Restore"
    echo "=================="
    echo "1. 📁 Fazer backup do banco"
    echo "2. 🔄 Restaurar backup"
    echo "3. 📋 Listar backups"
    echo "4. 🔙 Voltar"
    echo -n "Escolha [1-4]: "
    
    read backup_choice
    case $backup_choice in
        1)
            log "📁 Fazendo backup..."
            mkdir -p backups
            
            # Verificar qual banco está sendo usado
            if grep -q "localhost" backend/.env; then
                # Backup local
                pg_dump crypto_dashboard > "backups/backup_local_$(date +%Y%m%d_%H%M%S).sql"
                log "✅ Backup local criado!"
            else
                # Backup nuvem (via Prisma)
                cd backend
                npx prisma db pull
                log "✅ Schema do banco na nuvem salvo!"
            fi
            ;;
        2)
            log "🔄 Restaurando backup..."
            ls -la backups/
            echo -n "Nome do arquivo de backup: "
            read backup_file
            
            if [ -f "backups/$backup_file" ]; then
                if [[ "$backup_file" == *.gz ]]; then
                    gunzip -c "backups/$backup_file" | psql crypto_dashboard
                else
                    psql crypto_dashboard < "backups/$backup_file"
                fi
                log "✅ Backup restaurado!"
            else
                error "❌ Arquivo não encontrado!"
            fi
            ;;
        3)
            log "📋 Backups disponíveis:"
            ls -la backups/ 2>/dev/null || echo "Nenhum backup encontrado"
            ;;
        4)
            return
            ;;
    esac
}

# Menu principal
main() {
    while true; do
        show_menu
        read choice
        
        case $choice in
            1) setup_inicial ;;
            2) setup_supabase ;;
            3) alternar_banco ;;
            4) start_dev ;;
            5) corrigir_cors ;;
            6) deploy_prod ;;
            7) manage_db ;;
            8) clean_install ;;
            9) backup_restore ;;
            10)
                log "👋 Até logo!"
                exit 0
                ;;
            *)
                error "❌ Opção inválida!"
                ;;
        esac
        
        echo ""
        echo "Pressione Enter para continuar..."
        read
        clear
    done
}

# Verificar se está na pasta do projeto
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    error "❌ Execute este script na pasta raiz do projeto crypto-dashboard"
    exit 1
fi

# Executar menu principal
clear
main 