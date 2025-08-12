# DEPLOY DA EDGE FUNCTION PARA CRIAÇÃO AUTOMÁTICA DE USUÁRIOS

## Pré-requisitos
1. Supabase CLI instalado
2. Projeto configurado

## Passos para Deploy

### 1. Instalar Supabase CLI (se não tiver)
```bash
npm install -g supabase
```

### 2. Login no Supabase
```bash
supabase login
```

### 3. Linkar o projeto
```bash
supabase link --project-ref SEU_PROJECT_REF
```

### 4. Deploy da Edge Function
```bash
supabase functions deploy criar-usuario
```

### 5. Verificar se foi deployado
```bash
supabase functions list
```

## Configuração das Variáveis de Ambiente

A Edge Function usa automaticamente as variáveis do Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Teste da Edge Function

Após o deploy, teste com:
```bash
curl -X POST 'https://SEU_PROJECT_REF.supabase.co/functions/v1/criar-usuario' \
  -H 'Authorization: Bearer SEU_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "teste@exemplo.com",
    "password": "123456",
    "nome": "Usuário Teste",
    "tipo": "user"
  }'
```

## Resultado Esperado
Quando você aprovar um usuário, ele será automaticamente:
1. ✅ Criado na tabela `usuarios`
2. ✅ Criado no Supabase Auth (Authentication > Users)
3. ✅ Poderá fazer login imediatamente com a senha: 123456
