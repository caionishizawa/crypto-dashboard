# SOLUÇÃO VIA SUPABASE DASHBOARD (SEM CLI)

## Método 1: Via Supabase Dashboard

### 1. Acesse o Supabase Dashboard
- Vá para https://supabase.com/dashboard
- Selecione seu projeto

### 2. Vá para Edge Functions
- No menu lateral, clique em "Edge Functions"
- Clique em "Create a new function"

### 3. Configure a Edge Function
- **Name:** `criar-usuario`
- **Import map:** Deixe vazio
- Clique em "Create function"

### 4. Cole o código
Substitua o código padrão pelo conteúdo do arquivo `edge-function-criar-usuario/index.ts`

### 5. Deploy
- Clique em "Deploy"

## Método 2: Via Supabase CLI (Recomendado)

### 1. Instalar Supabase CLI
```bash
npm install -g supabase
```

### 2. Login
```bash
supabase login
```

### 3. Linkar projeto
```bash
supabase link --project-ref SEU_PROJECT_REF
```

### 4. Deploy
```bash
supabase functions deploy criar-usuario
```

## Método 3: Script Automático
```bash
./deploy-edge-function.sh
```

## Verificar se Funcionou

### 1. Teste via Dashboard
- Vá em "Edge Functions"
- Clique na função `criar-usuario`
- Clique em "Invoke" para testar

### 2. Teste via Site
- Aprove um usuário no site
- Verifique se ele aparece em "Authentication > Users"
- Teste o login com a senha: 123456

## Resultado Esperado

Após o deploy, quando você aprovar um usuário:
1. ✅ Usuário criado na tabela `usuarios`
2. ✅ Usuário criado automaticamente em "Authentication > Users"
3. ✅ Usuário pode fazer login imediatamente
4. ✅ Senha padrão: 123456

## Troubleshooting

Se não funcionar:
1. Verifique se a Edge Function foi deployada
2. Verifique os logs da Edge Function
3. Teste manualmente via Dashboard
4. Verifique se as variáveis de ambiente estão corretas
