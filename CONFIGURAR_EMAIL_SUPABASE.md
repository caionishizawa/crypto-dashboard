# 📧 Configurar Template de Email no Supabase

## 🎯 Passo a Passo para Configurar o Email de Confirmação

### **1. Acesse o Supabase Dashboard**
- Vá para: `https://supabase.com/dashboard`
- Selecione seu projeto: `spopnfahhfydqnpgjcqw`

### **2. Navegue para Authentication > Emails**
- No menu lateral, clique em **"Authentication"**
- Clique em **"Emails"** (ou "Templates")

### **3. Configure o Template "Confirm signup"**

#### **Assunto do Email:**
```
Confirme seu cadastro - Crypto Dashboard
```

#### **Corpo do Email (HTML):**
Copie e cole o conteúdo do arquivo `SUPABASE_EMAIL_TEMPLATE_SIMPLES.html` na aba **"Source"**.

**Use o template simples** que não tem redirecionamento automático.

### **4. Configurações Adicionais**

#### **Site URL:**
```
https://courageous-jelly-382fd9.netlify.app
```

#### **Redirect URLs (em Authentication > Settings):**
```
https://courageous-jelly-382fd9.netlify.app
https://courageous-jelly-382fd9.netlify.app/
```

**Importante:** O template simples não redireciona automaticamente, apenas confirma o email.

### **5. Teste o Email**
- Vá para **"Users"** no menu Authentication
- Clique em **"Invite user"** ou crie um novo usuário
- Verifique se o email foi enviado com o novo template

## 🎨 Características do Template

### **Design:**
- ✅ **Responsivo** - Funciona em mobile e desktop
- ✅ **Tema verde** - Combina com o site
- ✅ **Profissional** - Design moderno e elegante
- ✅ **Português** - Texto em português brasileiro

### **Funcionalidades:**
- ✅ **Botão de confirmação** - Link direto para confirmar
- ✅ **Link alternativo** - URL completa para copiar/colar
- ✅ **Aviso de segurança** - Informações importantes
- ✅ **Footer informativo** - Texto de segurança

### **Elementos Visuais:**
- ✅ **Gradiente verde** - Header e botão
- ✅ **Ícones** - Emojis para melhor UX
- ✅ **Tipografia** - Fontes modernas e legíveis
- ✅ **Espaçamento** - Layout bem estruturado

## 🔧 Configurações Importantes

### **Rate Limits:**
- ⚠️ **Atenção**: O Supabase tem limites de email
- 📧 **Limite**: ~100 emails por hora (plano gratuito)
- 🚀 **Produção**: Considere usar SMTP customizado

### **SMTP Customizado (Opcional):**
Se quiser usar seu próprio servidor de email:
1. Clique em **"Set up custom SMTP server"**
2. Configure seu provedor de email
3. Teste o envio

## ✅ Resultado Final

Após a configuração, os usuários receberão:
- 📧 **Email elegante** em português
- 🎯 **Botão claro** para confirmar
- 🔒 **Segurança** com avisos apropriados
- 📱 **Responsivo** em qualquer dispositivo

**O template está pronto para uso profissional!** 🎉 