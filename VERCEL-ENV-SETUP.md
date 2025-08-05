# 🔧 Como Configurar Variáveis de Ambiente no Vercel

## Passo a Passo Detalhado

### 1. Acesse o Painel do Vercel

1. Vá para [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Você verá uma lista dos seus projetos

### 2. Selecione Seu Projeto

1. Clique no projeto **"upsolucions"** (ou o nome que você deu)
2. Você será direcionado para o dashboard do projeto

### 3. Acesse as Configurações

1. No topo da página, clique na aba **"Settings"**
2. No menu lateral esquerdo, clique em **"Environment Variables"**

### 4. Adicionar as Variáveis de Ambiente

Você precisa adicionar **2 variáveis**:

#### Variável 1: NEXT_PUBLIC_SUPABASE_URL

1. Clique no botão **"Add New"** ou **"Add"**
2. No campo **"Name"**, digite: `NEXT_PUBLIC_SUPABASE_URL`
3. No campo **"Value"**, cole a URL do seu projeto Supabase
   - Exemplo: `https://xyzabc123.supabase.co`
4. Em **"Environment"**, selecione:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Clique em **"Save"**

#### Variável 2: NEXT_PUBLIC_SUPABASE_ANON_KEY

1. Clique novamente em **"Add New"**
2. No campo **"Name"**, digite: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. No campo **"Value"**, cole a chave anônima do Supabase
   - Exemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Em **"Environment"**, selecione:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Clique em **"Save"**

### 5. Como Obter as Credenciais do Supabase

Se você ainda não tem as credenciais:

1. **Acesse o Supabase**:
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta

2. **Selecione seu projeto**:
   - Clique no projeto que você criou

3. **Acesse as configurações da API**:
   - No menu lateral, clique em **"Settings"**
   - Clique em **"API"**

4. **Copie as credenciais**:
   - **Project URL**: Copie a URL que aparece em "Project URL"
   - **anon/public key**: Copie a chave que aparece em "Project API keys" > "anon public"

### 6. Verificar se Funcionou

Após adicionar as variáveis:

1. **Redeploy automático**: O Vercel fará um novo deploy automaticamente
2. **Aguarde**: Espere alguns minutos para o deploy terminar
3. **Teste**: Acesse seu site e verifique se o indicador de sincronização mudou de amarelo para verde

### 7. Localização Visual no Vercel

```
Vercel Dashboard
├── Seus Projetos
│   └── upsolucions (clique aqui)
│       ├── Overview
│       ├── Deployments
│       ├── Functions
│       ├── Settings ← CLIQUE AQUI
│       │   ├── General
│       │   ├── Domains
│       │   ├── Environment Variables ← CLIQUE AQUI
│       │   ├── Git
│       │   └── ...
│       └── ...
```

### 8. Exemplo Visual das Variáveis

Quando configurado corretamente, você verá algo assim:

```
Environment Variables
┌─────────────────────────────────────────────────────────────┐
│ Name: NEXT_PUBLIC_SUPABASE_URL                              │
│ Value: https://xyzabc123.supabase.co                        │
│ Environment: Production, Preview, Development               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Name: NEXT_PUBLIC_SUPABASE_ANON_KEY                         │
│ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...             │
│ Environment: Production, Preview, Development               │
└─────────────────────────────────────────────────────────────┘
```

### 9. Solução de Problemas

#### ❌ Não encontro a aba "Settings"
- Certifique-se de que está dentro do projeto (não na página inicial)
- A aba "Settings" fica no topo, ao lado de "Overview"

#### ❌ Não encontro "Environment Variables"
- Primeiro clique em "Settings" no topo
- Depois procure "Environment Variables" no menu lateral esquerdo

#### ❌ As variáveis não estão funcionando
- Verifique se os nomes estão exatamente corretos (com maiúsculas)
- Confirme se selecionou todos os ambientes (Production, Preview, Development)
- Aguarde o redeploy automático terminar

#### ❌ Não tenho as credenciais do Supabase
- Siga o passo 5 acima para obter as credenciais
- Se não tem projeto no Supabase, crie um novo em supabase.com

### 10. Resultado Esperado

Após configurar corretamente:
- ✅ O site fará redeploy automaticamente
- ✅ O indicador de sincronização ficará verde
- ✅ Os dados serão sincronizados entre dispositivos
- ✅ Você verá "Sincronizado" no canto da tela

---

**💡 Dica**: Se tiver dúvidas, o suporte do Vercel é muito bom. Você pode acessar a documentação oficial em [vercel.com/docs](https://vercel.com/docs/concepts/projects/environment-variables).