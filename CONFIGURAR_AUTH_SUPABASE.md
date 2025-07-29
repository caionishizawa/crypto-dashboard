# Configurar Supabase Auth para Primeiro Acesso

## 🔧 **Passos para configurar:**

### **1. Acesse o Supabase Dashboard:**
- Vá para [supabase.com](https://supabase.com)
- Acesse seu projeto

### **2. Configure Authentication:**
- Clique em **"Authentication"** no menu lateral
- Clique em **"Settings"**

### **3. Desabilitar Confirmação de Email:**
- Em **"Email Auth"**, desmarque a opção **"Confirm email"**
- Clique em **"Save"**

### **4. Configurar Políticas de Senha (Opcional):**
- Em **"Password Auth"**, você pode configurar:
  - **Min length:** 6 (ou o que preferir)
  - **Require uppercase:** false
  - **Require lowercase:** false
  - **Require numbers:** false
  - **Require special characters:** false

### **5. Salvar Configurações:**
- Clique em **"Save"** para aplicar as mudanças

## ✅ **Depois de configurar:**

- Volte ao seu site no Netlify
- Clique em **"Registrar"**
- Crie sua conta admin
- **O registro funcionará sem confirmação de email!**

## 🎯 **Como testar:**

1. **Acesse:** `courageous-jelly-382fd9.netlify.app`
2. **Clique em "Registrar"**
3. **Preencha os dados:**
   - Nome: Seu nome
   - Email: Seu email real
   - Senha: Sua senha
4. **Clique em "Criar Conta"**
5. **Faça login** com os dados criados
6. **Teste criar um cliente**

**Configure o Supabase Auth e teste o registro!** 🚀 