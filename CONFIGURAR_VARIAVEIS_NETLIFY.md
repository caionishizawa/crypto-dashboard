# 🔧 Configurar Variáveis de Ambiente no Netlify

## 🚨 ERRO 401 - Supabase não configurado

O erro 401 indica que as variáveis de ambiente do Supabase não estão configuradas no Netlify.

## ✅ Solução: Configurar Variáveis de Ambiente

### 1. Acessar Netlify Dashboard

1. Vá para [app.netlify.com](https://app.netlify.com)
2. Clique no seu site
3. Vá em **Site settings** (aba lateral)

### 2. Configurar Environment Variables

1. **Clique em "Environment variables"**
2. **Adicione as seguintes variáveis:**

```env
VITE_SUPABASE_URL=https://spopnfahhfydqnpgjcqw.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
VITE_ENVIRONMENT=production
```

### 3. Obter Credenciais do Supabase

1. **Acesse** [supabase.com](https://supabase.com)
2. **Vá no seu projeto**
3. **Clique em "Settings" > "API"**
4. **Copie:**
   - **Project URL**: `https://spopnfahhfydqnpgjcqw.supabase.co`
   - **anon public key**: (a chave longa que começa com `eyJ...`)

### 4. Configurar no Netlify

No Netlify Dashboard, adicione:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://spopnfahhfydqnpgjcqw.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sua-chave-anonima-aqui` |
| `VITE_ENVIRONMENT` | `production` |

### 5. Fazer Deploy Manual

Após configurar as variáveis:

1. **Vá em "Deploys"**
2. **Clique em "Trigger deploy"**
3. **Escolha "Deploy site"**

## 🔍 Verificar Configuração

### Teste Local

Para testar se as credenciais estão corretas:

```bash
# Verificar se o Supabase está configurado
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Teste no Browser

Abra o console do browser e digite:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

## 🚨 Problemas Comuns

### Erro: "Supabase não configurado"

- Verifique se as variáveis estão escritas corretamente
- Confirme se não há espaços extras
- Verifique se a chave anônima está completa

### Erro: "Invalid API key"

- Verifique se a chave anônima está correta
- Confirme se não copiou a chave service_role por engano
- Verifique se o projeto Supabase está ativo

### Erro: "Project not found"

- Verifique se a URL do projeto está correta
- Confirme se o projeto não foi deletado
- Verifique se você tem acesso ao projeto

## 🎯 Próximos Passos

Após configurar as variáveis:

1. **Fazer deploy manual** no Netlify
2. **Testar o login** com:
   - Email: `admin@dashboard.com`
   - Senha: `admin123`
3. **Verificar se os dados carregam**

## 📞 Suporte

Se ainda houver problemas:

1. **Verifique os logs** do Netlify
2. **Teste localmente** com `npm run dev`
3. **Verifique se o Supabase** está funcionando

---

**⚠️ IMPORTANTE:** As variáveis de ambiente são essenciais para o funcionamento do sistema! 