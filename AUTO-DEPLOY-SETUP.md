# 🚀 Configuração de Deploy Automático - Up Solucions

## 📋 Visão Geral

Este projeto agora possui deploy automático configurado para Git e Vercel. Sempre que você fizer push para o repositório, o site será automaticamente atualizado.

## ⚡ Comandos Rápidos

```bash
# Deploy completo (Git + Vercel)
npm run deploy

# Deploy direto para produção
npm run deploy:prod

# Deploy para preview/teste
npm run deploy:preview

# Apenas Git push
npm run git:push

# Apenas Vercel deploy
npm run vercel:deploy

# Git push + Vercel em sequência
npm run full-deploy
```

## 🔧 Configuração Inicial

### 1. Configurar Repositório GitHub

```bash
# Executar o script de deploy automático
npm run deploy
```

O script irá:
- ✅ Verificar se o Git está configurado
- ✅ Criar repositório no GitHub (se necessário)
- ✅ Fazer commit e push das mudanças
- ✅ Configurar Vercel automaticamente

### 2. Configurar Secrets no GitHub (para CI/CD)

No seu repositório GitHub, vá em **Settings > Secrets and variables > Actions** e adicione:

```env
VERCEL_TOKEN=seu_token_do_vercel
VERCEL_ORG_ID=seu_org_id
VERCEL_PROJECT_ID=seu_project_id
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_do_supabase
```

#### Como obter os tokens:

**Vercel Token:**
1. Acesse [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Clique em "Create Token"
3. Dê um nome (ex: "GitHub Actions")
4. Copie o token gerado

**Vercel Org ID e Project ID:**
```bash
# No diretório do projeto
vercel link
# Isso criará .vercel/project.json com os IDs
```

### 3. Configurar Supabase (Opcional)

Se ainda não configurou:
```bash
node scripts/setup-supabase.js
```

## 🔄 Como Funciona o Deploy Automático

### GitHub Actions (CI/CD)

- **Push para `main`** → Deploy automático para **produção**
- **Pull Request** → Deploy automático para **preview**
- **Manual** → Escolha entre produção ou preview

### Fluxo de Trabalho

1. **Desenvolvimento Local**
   ```bash
   npm run dev  # Servidor local
   ```

2. **Fazer Mudanças**
   - Edite os arquivos
   - Teste localmente

3. **Deploy Automático**
   ```bash
   npm run deploy  # Script interativo
   # OU
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main  # Deploy automático!
   ```

4. **Resultado**
   - ✅ Código no GitHub atualizado
   - ✅ Site no Vercel atualizado automaticamente
   - ✅ Notificação de sucesso/erro

## 📱 Monitoramento

### GitHub Actions
- Vá em **Actions** no seu repositório
- Veja o status dos deploys em tempo real
- Logs detalhados de cada etapa

### Vercel Dashboard
- Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
- Veja deployments, logs e métricas
- Configure domínio personalizado

## 🛠️ Comandos Úteis

```bash
# Verificar status do Git
git status

# Ver histórico de commits
git log --oneline

# Verificar remote configurado
git remote -v

# Status do Vercel
vercel ls

# Logs do último deploy
vercel logs

# Abrir projeto no Vercel
vercel open
```

## 🔍 Troubleshooting

### Erro: "Permission denied"
```bash
# Verificar se está logado no GitHub
gh auth status

# Fazer login se necessário
gh auth login
```

### Erro: "Vercel token invalid"
```bash
# Fazer login novamente
vercel login

# Verificar se está logado
vercel whoami
```

### Deploy falhou no GitHub Actions
1. Verifique os **Secrets** estão configurados
2. Veja os **logs** na aba Actions
3. Verifique se o **build local** funciona: `npm run build`

### Site não atualiza
1. Verifique se o **deploy foi bem-sucedido**
2. **Limpe o cache** do navegador (Ctrl+F5)
3. Verifique se está acessando a **URL correta**

## 📚 Recursos Adicionais

- [Documentação do Vercel](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Next.js Deploy](https://nextjs.org/docs/deployment)

## 🎯 Próximos Passos

1. **Execute o primeiro deploy**: `npm run deploy`
2. **Configure os secrets** no GitHub
3. **Teste o fluxo** fazendo uma mudança pequena
4. **Configure domínio personalizado** no Vercel (opcional)
5. **Configure Supabase** para sincronização (opcional)

---

**🎉 Agora seu site tem deploy automático configurado!**

Sempre que fizer `git push`, seu site será atualizado automaticamente. ✨