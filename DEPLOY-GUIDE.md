# 🚀 Guia de Deploy - Up Soluções

## ✅ Configuração Completa

Este projeto está configurado para deploy automático usando:
- **Git** para controle de versão
- **GitHub Actions** para CI/CD
- **Vercel** para hospedagem

## 📋 Pré-requisitos

- [x] Node.js 18+ instalado
- [x] Git configurado
- [x] Conta no GitHub
- [x] Conta no Vercel
- [x] Vercel CLI instalado

## 🔧 Configuração Inicial

### 1. Configurar Repositório GitHub

```bash
# Criar repositório no GitHub (via web)
# Depois conectar o repositório local:
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git branch -M main
git push -u origin main
```

### 2. Configurar Vercel

```bash
# Login no Vercel
vercel login

# Conectar projeto
vercel link

# Deploy inicial
vercel --prod
```

### 3. Configurar Secrets no GitHub

Vá para: **GitHub Repository → Settings → Secrets and variables → Actions**

Adicione os seguintes secrets:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VERCEL_TOKEN=seu_token_do_vercel
VERCEL_ORG_ID=seu_org_id_do_vercel
VERCEL_PROJECT_ID=seu_project_id_do_vercel
```

#### Como obter os IDs do Vercel:

```bash
# Após fazer vercel link, verifique o arquivo .vercel/project.json
cat .vercel/project.json
```

## 🚀 Deploy Automático

### Fluxo de Deploy

1. **Push para main** → Deploy automático para produção
2. **Pull Request** → Deploy de preview automático
3. **Manual** → Via GitHub Actions (workflow_dispatch)

### Comandos Úteis

```bash
# Deploy manual de preview
npm run deploy:preview

# Deploy manual para produção
npm run deploy:prod

# Verificar deploys
npm run check:deploy

# Desenvolvimento rápido
npm run dev:fast
```

## 📊 Monitoramento

### URLs Importantes

- **Produção**: https://seu-projeto.vercel.app
- **GitHub Actions**: https://github.com/SEU_USUARIO/REPO/actions
- **Vercel Dashboard**: https://vercel.com/dashboard

### Logs e Debug

```bash
# Ver logs do Vercel
vercel logs

# Ver status do último deploy
vercel ls

# Ver informações do projeto
vercel inspect
```

## 🔧 Solução de Problemas

### Deploy Falha

1. Verificar logs no GitHub Actions
2. Verificar variáveis de ambiente
3. Testar build local: `npm run build`

### Secrets Não Funcionam

1. Verificar nomes dos secrets (case-sensitive)
2. Verificar se foram adicionados no repositório correto
3. Re-executar workflow

### Vercel CLI Issues

```bash
# Reinstalar Vercel CLI
npm uninstall -g vercel
npm install -g vercel@latest

# Re-login
vercel logout
vercel login
```

## 📝 Próximos Passos

1. ✅ Configurar domínio customizado no Vercel
2. ✅ Configurar analytics
3. ✅ Configurar monitoring de performance
4. ✅ Configurar backup automático

---

**🎉 Deploy configurado com sucesso!**

Para dúvidas, consulte:
- [Documentação do Vercel](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Next.js Deploy](https://nextjs.org/docs/deployment)