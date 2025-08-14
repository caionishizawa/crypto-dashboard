#!/bin/bash

# Script para automatizar commit e push
echo "🔄 Adicionando arquivos modificados..."
git add .

echo "📝 Fazendo commit..."
git commit -m "$1"

echo "🚀 Fazendo push para o GitHub..."
git push origin master

echo "✅ Push realizado com sucesso!"
