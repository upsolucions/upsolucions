# 🚀 Configuração do Supabase para Deploy no Vercel

## ✅ Você criou a conta no Supabase! Próximos passos:

### 1. 📋 Obter as Credenciais do Supabase

1. **Acesse o Dashboard do Supabase:**
   - Vá para https://supabase.com/dashboard
   - Faça login com sua conta

2. **Selecione ou Crie um Projeto:**
   - Se ainda não criou, clique em "New Project"
   - Escolha um nome (ex: "up-solucions")
   - Defina uma senha para o banco de dados
   - Selecione uma região (preferencialmente próxima ao Brasil)

3. **Copiar as Credenciais:**
   - No painel do projeto, vá em **Settings** > **API**
   - Copie os seguintes valores:
     - **Project URL** (algo como: `https://xxxxx.supabase.co`)
     - **anon/public key** (chave longa que começa com `eyJ...`)

### 2. 🔧 Configurar Variáveis no Vercel

1. **Acesse o Vercel Dashboard:**
   - Vá para https://vercel.com/dashboard
   - Selecione seu projeto "Up Solucions"

2. **Configurar Environment Variables:**
   - Vá em **Settings** > **Environment Variables**
   - Adicione as seguintes variáveis:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_project_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_do_supabase
   NEXT_TELEMETRY_DISABLED=1
   NODE_OPTIONS=--max-old-space-size=4096
   ```

   **⚠️ IMPORTANTE:** Substitua pelos valores reais copiados do Supabase!

### 3. 🗄️ Configurar Banco de Dados (Opcional)

Se quiser usar o sistema de admin completo:

1. **No Supabase Dashboard:**
   - Vá em **SQL Editor**
   - Execute este comando para criar a tabela:

   ```sql
   CREATE TABLE site_content (
     id TEXT PRIMARY KEY,
     content JSONB NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Inserir conteúdo inicial
   INSERT INTO site_content (id, content) VALUES (
     'main',
     '{}'
   );
   ```

2. **Configurar Storage (para imagens):**
   - Vá em **Storage**
   - Crie um bucket chamado `site-images`
   - Configure como público

### 4. 🚀 Fazer Redeploy

1. **No Vercel Dashboard:**
   - Vá na aba **Deployments**
   - Clique nos três pontos do último deploy
   - Selecione **Redeploy**

2. **Ou faça um novo commit:**
   ```bash
   git add .
   git commit -m "Update Supabase configuration"
   git push origin main
   ```

### 5. ✅ Verificar se Funcionou

1. **Acesse seu site no Vercel**
2. **Teste o modo admin:**
   - Adicione `?admin=true` na URL
   - Exemplo: `https://seu-site.vercel.app?admin=true`
3. **Verifique se consegue editar conteúdo**

## 🆘 Solução de Problemas

### Se o deploy ainda falhar:
1. Verifique se as variáveis estão corretas no Vercel
2. Confirme se a URL do Supabase não tem `/` no final
3. Verifique os logs de build no Vercel

### Se não quiser usar Supabase agora:
O site funcionará perfeitamente sem Supabase! Apenas:
- Use as variáveis de desenvolvimento que já estão configuradas
- O modo admin salvará dados apenas no navegador
- Imagens serão armazenadas como Data URLs

## 📞 Próximos Passos
1. ✅ Obter credenciais do Supabase
2. ✅ Configurar no Vercel
3. ✅ Fazer redeploy
4. ✅ Testar o site

**Seu projeto está quase pronto para produção! 🎉**