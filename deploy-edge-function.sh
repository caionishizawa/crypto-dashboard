#!/bin/bash

# Script para deploy automático da Edge Function
echo "🚀 Iniciando deploy da Edge Function..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

# Verificar se está logado
echo "🔐 Verificando login no Supabase..."
supabase status

# Fazer deploy da Edge Function
echo "📦 Fazendo deploy da Edge Function 'criar-usuario'..."
supabase functions deploy criar-usuario

# Verificar se o deploy foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployada com sucesso!"
    echo "📋 Listando funções disponíveis:"
    supabase functions list
else
    echo "❌ Erro no deploy da Edge Function"
    exit 1
fi

echo "🎉 Deploy concluído! Agora quando você aprovar um usuário, ele será criado automaticamente no Auth."
