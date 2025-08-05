# 🚀 Guia Completo: Deploy no Vercel com Supabase

## 📋 Status Atual
✅ **Conta Supabase criada**  
✅ **Repositório GitHub configurado:** `https://github.com/upsolucions/upsolucions.git`  
✅ **Código corrigido e enviado**  
⏳ **Próximo:** Conectar ao Vercel e configurar variáveis

---

## 🎯 PASSO 1: Obter Credenciais do Supabase

### 1.1 Acessar Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login com sua conta

### 1.2 Criar/Selecionar Projeto
**Se ainda não criou um projeto:**
1. Clique em **"New Project"**
2. Nome sugerido: `up-solucions`
3. Escolha uma senha forte para o banco
4. Região: `South America (São Paulo)` ou `US East`
5. Clique em **"Create new project"**
6. ⏳ Aguarde 2-3 minutos para o projeto ser criado

### 1.3 Copiar Credenciais
1. No painel do projeto, vá em **Settings** → **API**
2. **COPIE ESTES VALORES:**
   - **Project URL:** `https://xxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

📝 **Anote estes valores, você precisará deles no próximo passo!**

---

## 🎯 PASSO 2: Conectar Repositório ao Vercel

### 2.1 Acessar Vercel
- Vá para: https://vercel.com
- Faça login (pode usar sua conta GitHub)

### 2.2 Importar Projeto
1. Clique em **"Add New..."** → **"Project"**
2. Conecte sua conta GitHub se necessário
3. Procure por `upsolucions/upsolucions`
4. Clique em **"Import"**

### 2.3 Configurar Deploy
1. **Project Name:** `up-solucions` (ou o nome que preferir)
2. **Framework Preset:** Next.js (deve detectar automaticamente)
3. **Root Directory:** `./` (padrão)
4. **Build Command:** `npm run build` (padrão)
5. **Output Directory:** `.next` (padrão)

---

## 🎯 PASSO 3: Configurar Variáveis de Ambiente

### 3.1 Antes de Fazer Deploy
**⚠️ IMPORTANTE:** Configure as variáveis ANTES do primeiro deploy!

1. Na tela de configuração do projeto, clique em **"Environment Variables"**
2. Adicione estas variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL
[Cole aqui a Project URL do Supabase]

NEXT_PUBLIC_SUPABASE_ANON_KEY
[Cole aqui a anon public key do Supabase]

NEXT_TELEMETRY_DISABLED
1

NODE_OPTIONS
--max-old-space-size=4096
```

### 3.2 Fazer Deploy
1. Após configurar as variáveis, clique em **"Deploy"**
2. ⏳ Aguarde 2-5 minutos para o build completar
3. 🎉 Seu site estará online!

---

## 🎯 PASSO 4: Configurar Banco de Dados (Opcional)

### 4.1 Criar Tabela no Supabase
1. No Supabase Dashboard, vá em **SQL Editor**
2. Cole e execute este código:

```sql
-- Criar tabela para conteúdo do site
CREATE TABLE site_content (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro inicial
INSERT INTO site_content (id, content) VALUES (
  'main',
  '{}'
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read" ON site_content
  FOR SELECT USING (true);

-- Política para permitir escrita pública (temporária)
CREATE POLICY "Allow public write" ON site_content
  FOR ALL USING (true);
```

### 4.2 Configurar Storage para Imagens
1. Vá em **Storage** no Supabase
2. Clique em **"Create a new bucket"**
3. Nome: `site-images`
4. Marque **"Public bucket"**
5. Clique em **"Create bucket"**

---

## 🎯 PASSO 5: Testar o Site

### 5.1 Acessar Site
1. No Vercel, clique no link do seu site
2. Exemplo: `https://up-solucions.vercel.app`

### 5.2 Testar Modo Admin
1. Adicione `?admin=true` na URL
2. Exemplo: `https://up-solucions.vercel.app?admin=true`
3. Teste editar textos e imagens
4. Verifique se as alterações são salvas

---

## 🆘 Solução de Problemas

### ❌ Se o deploy falhar:
1. **Verifique as variáveis de ambiente no Vercel**
2. **Confirme se a URL do Supabase não tem `/` no final**
3. **Veja os logs de erro em Vercel → Functions**

### ❌ Se o modo admin não funcionar:
1. **Verifique se as credenciais do Supabase estão corretas**
2. **Confirme se a tabela `site_content` foi criada**
3. **Teste localmente primeiro com `npm run dev`**

### ✅ Alternativa sem Supabase:
Se quiser deploy imediato sem configurar banco:
```env
NEXT_PUBLIC_SUPABASE_URL=https://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

---

## 📞 Resumo dos Links Importantes

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Seu Repositório:** https://github.com/upsolucions/upsolucions

## 🎉 Próximos Passos
1. ✅ Obter credenciais do Supabase
2. ✅ Conectar repositório ao Vercel
3. ✅ Configurar variáveis de ambiente
4. ✅ Fazer deploy
5. ✅ Testar o site

**Seu projeto estará 100% funcional em produção! 🚀**