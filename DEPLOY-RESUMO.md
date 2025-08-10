# 🚀 DEPLOY AUTOMÁTICO - UP SOLUÇÕES

## ✅ STATUS DA CONFIGURAÇÃO

**TUDO PRONTO PARA DEPLOY!** O projeto está 100% configurado para deploy automático.

### 📁 Arquivos Configurados

- ✅ **GitHub Actions** (`.github/workflows/deploy.yml`) - Deploy automático
- ✅ **Vercel Config** (`vercel.json`) - Configuração de hospedagem
- ✅ **Scripts NPM** (`package.json`) - Comandos de deploy
- ✅ **Guias** (`DEPLOY-GUIDE.md`) - Documentação completa
- ✅ **Script PowerShell** (`deploy-automatico.ps1`) - Automação Windows

## 🎯 COMO FAZER O DEPLOY

### Opção 1: Script Automático (Recomendado)

```powershell
# Execute no PowerShell (como Administrador)
powershell -ExecutionPolicy Bypass -File deploy-automatico.ps1
```

### Opção 2: Comandos Manuais

#### 1. 📁 Criar Repositório GitHub

1. Acesse: https://github.com/new
2. Nome: `up-solucoes-site`
3. Escolha público ou privado
4. Clique em "Create repository"

#### 2. 🔗 Conectar Repositório Local

```bash
git remote add origin https://github.com/SEU_USUARIO/up-solucoes-site.git
git branch -M main
git push -u origin main
```

#### 3. 🚀 Configurar Vercel

```bash
# Login no Vercel
vercel login

# Conectar projeto
vercel link

# Deploy inicial
vercel --prod
```

#### 4. 🔐 Configurar Secrets GitHub

Vá para: **Repository → Settings → Secrets and variables → Actions**

Adicione estes secrets:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VERCEL_TOKEN=seu_token_do_vercel
VERCEL_ORG_ID=seu_org_id_do_vercel
VERCEL_PROJECT_ID=seu_project_id_do_vercel
```

**Como obter os IDs do Vercel:**

```bash
# Após fazer vercel link, verifique:
cat .vercel/project.json
```

## 🎮 COMANDOS DISPONÍVEIS

### Desenvolvimento
```bash
npm run dev:fast        # Servidor rápido com Turbopack
npm run dev             # Servidor normal
npm run build           # Testar build
```

### Deploy
```bash
npm run deploy:preview  # Deploy de teste
npm run deploy:prod     # Deploy produção
npm run check:deploy    # Verificar deploys
npm run setup:vercel    # Conectar ao Vercel
```

### Automação
```bash
npm run git:push        # Commit e push automático
npm run full-deploy     # Git push + Vercel deploy
```

## 🔄 FLUXO DE DEPLOY AUTOMÁTICO

### 1. Deploy por Push
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# → Deploy automático para PRODUÇÃO
```

### 2. Deploy por Pull Request
```bash
git checkout -b nova-feature
# ... fazer alterações ...
git push origin nova-feature
# → Criar PR no GitHub
# → Deploy automático de PREVIEW
```

### 3. Deploy Manual
- Acesse: GitHub → Actions → "Deploy Automático"
- Clique em "Run workflow"
- Escolha: Preview ou Production

## 📊 MONITORAMENTO

### URLs Importantes
- **Site Produção**: https://seu-projeto.vercel.app
- **GitHub Actions**: https://github.com/SEU_USUARIO/REPO/actions
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Site Local**: http://localhost:3000

### Verificar Status
```bash
# Status dos deploys
vercel ls

# Logs do último deploy
vercel logs

# Informações do projeto
vercel inspect
```

## 🔧 SOLUÇÃO DE PROBLEMAS

### Deploy Falha
1. ✅ Verificar logs no GitHub Actions
2. ✅ Verificar variáveis de ambiente
3. ✅ Testar build local: `npm run build`
4. ✅ Verificar secrets do GitHub

### Vercel CLI Issues
```bash
# Reinstalar Vercel CLI
npm uninstall -g vercel
npm install -g vercel@latest

# Re-login
vercel logout
vercel login
```

### GitHub Actions Falha
1. ✅ Verificar se todos os secrets estão configurados
2. ✅ Verificar se os nomes dos secrets estão corretos
3. ✅ Re-executar o workflow

## 📚 DOCUMENTAÇÃO COMPLETA

- 📖 **DEPLOY-GUIDE.md** - Guia detalhado de deploy
- 🚀 **GUIA-OTIMIZACAO.md** - Otimizações de performance
- 🔧 **SOLUCAO-ERROS-JSON.md** - Correções aplicadas
- 💾 **SOLUCAO-SUPABASE.md** - Configuração do banco

## 🎉 PRÓXIMOS PASSOS

1. ✅ **Executar deploy inicial**
2. ✅ **Configurar domínio customizado**
3. ✅ **Configurar analytics**
4. ✅ **Monitorar performance**
5. ✅ **Configurar backup automático**

---

## 🚀 EXECUÇÃO RÁPIDA

**Para deploy imediato, execute:**

```powershell
# Windows (PowerShell como Admin)
powershell -ExecutionPolicy Bypass -File deploy-automatico.ps1
```

```bash
# Ou manualmente:
vercel login
vercel link
vercel --prod
```

**🎯 Seu site estará online em minutos!**

---

*Configurado com ❤️ para Up Soluções*