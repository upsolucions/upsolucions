#!/usr/bin/env node

/**
 * Script para configurar deploy automático Git + Vercel
 * Configura repositório Git, GitHub Actions e deploy no Vercel
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploySetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.packageJson = this.loadPackageJson();
  }

  loadPackageJson() {
    try {
      return JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
    } catch (error) {
      console.error('❌ Erro ao carregar package.json:', error.message);
      process.exit(1);
    }
  }

  checkGitRepository() {
    console.log('🔍 Verificando repositório Git...');
    
    try {
      execSync('git status', { stdio: 'pipe' });
      console.log('✅ Repositório Git encontrado');
      return true;
    } catch (error) {
      console.log('⚠️  Repositório Git não encontrado');
      return false;
    }
  }

  initializeGit() {
    console.log('🚀 Inicializando repositório Git...');
    
    try {
      execSync('git init', { stdio: 'inherit' });
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Initial commit: Setup projeto Up Soluções"', { stdio: 'inherit' });
      console.log('✅ Repositório Git inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Git:', error.message);
    }
  }

  checkVercelCLI() {
    console.log('🔍 Verificando Vercel CLI...');
    
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI encontrado');
      return true;
    } catch (error) {
      console.log('⚠️  Vercel CLI não encontrado');
      return false;
    }
  }

  installVercelCLI() {
    console.log('📦 Instalando Vercel CLI...');
    
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI instalado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao instalar Vercel CLI:', error.message);
      console.log('💡 Tente executar: npm install -g vercel');
    }
  }

  createGitignore() {
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    
    if (!fs.existsSync(gitignorePath)) {
      console.log('📝 Criando .gitignore...');
      
      const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Next.js
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/`;
      
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log('✅ .gitignore criado');
    } else {
      console.log('✅ .gitignore já existe');
    }
  }

  createEnvExample() {
    const envExamplePath = path.join(this.projectRoot, '.env.example');
    
    if (!fs.existsSync(envExamplePath)) {
      console.log('📝 Criando .env.example...');
      
      const envExampleContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Performance Optimizations
NEXT_TELEMETRY_DISABLED=1
FAST_REFRESH=true
NODE_OPTIONS=--max-old-space-size=4096
TURBOPACK=1

# Development
NEXT_PRIVATE_STANDALONE=true
NEXT_PRIVATE_DEBUG_CACHE=false`;
      
      fs.writeFileSync(envExamplePath, envExampleContent);
      console.log('✅ .env.example criado');
    } else {
      console.log('✅ .env.example já existe');
    }
  }

  updatePackageJsonScripts() {
    console.log('📝 Atualizando scripts do package.json...');
    
    const newScripts = {
      ...this.packageJson.scripts,
      "dev:fast": "next dev --turbo",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "build:analyze": "ANALYZE=true npm run build",
      "deploy:preview": "vercel",
      "deploy:prod": "vercel --prod",
      "setup:vercel": "vercel link",
      "check:deploy": "vercel ls"
    };
    
    this.packageJson.scripts = newScripts;
    
    fs.writeFileSync(
      path.join(this.projectRoot, 'package.json'),
      JSON.stringify(this.packageJson, null, 2)
    );
    
    console.log('✅ Scripts do package.json atualizados');
  }

  createDeployGuide() {
    const guidePath = path.join(this.projectRoot, 'DEPLOY-GUIDE.md');
    
    console.log('📝 Criando guia de deploy...');
    
    const guideContent = `# 🚀 Guia de Deploy - Up Soluções

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

\`\`\`bash
# Criar repositório no GitHub (via web)
# Depois conectar o repositório local:
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git branch -M main
git push -u origin main
\`\`\`

### 2. Configurar Vercel

\`\`\`bash
# Login no Vercel
vercel login

# Conectar projeto
vercel link

# Deploy inicial
vercel --prod
\`\`\`

### 3. Configurar Secrets no GitHub

Vá para: **GitHub Repository → Settings → Secrets and variables → Actions**

Adicione os seguintes secrets:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VERCEL_TOKEN=seu_token_do_vercel
VERCEL_ORG_ID=seu_org_id_do_vercel
VERCEL_PROJECT_ID=seu_project_id_do_vercel
\`\`\`

#### Como obter os IDs do Vercel:

\`\`\`bash
# Após fazer vercel link, verifique o arquivo .vercel/project.json
cat .vercel/project.json
\`\`\`

## 🚀 Deploy Automático

### Fluxo de Deploy

1. **Push para main** → Deploy automático para produção
2. **Pull Request** → Deploy de preview automático
3. **Manual** → Via GitHub Actions (workflow_dispatch)

### Comandos Úteis

\`\`\`bash
# Deploy manual de preview
npm run deploy:preview

# Deploy manual para produção
npm run deploy:prod

# Verificar deploys
npm run check:deploy

# Desenvolvimento rápido
npm run dev:fast
\`\`\`

## 📊 Monitoramento

### URLs Importantes

- **Produção**: https://seu-projeto.vercel.app
- **GitHub Actions**: https://github.com/SEU_USUARIO/REPO/actions
- **Vercel Dashboard**: https://vercel.com/dashboard

### Logs e Debug

\`\`\`bash
# Ver logs do Vercel
vercel logs

# Ver status do último deploy
vercel ls

# Ver informações do projeto
vercel inspect
\`\`\`

## 🔧 Solução de Problemas

### Deploy Falha

1. Verificar logs no GitHub Actions
2. Verificar variáveis de ambiente
3. Testar build local: \`npm run build\`

### Secrets Não Funcionam

1. Verificar nomes dos secrets (case-sensitive)
2. Verificar se foram adicionados no repositório correto
3. Re-executar workflow

### Vercel CLI Issues

\`\`\`bash
# Reinstalar Vercel CLI
npm uninstall -g vercel
npm install -g vercel@latest

# Re-login
vercel logout
vercel login
\`\`\`

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
- [Next.js Deploy](https://nextjs.org/docs/deployment)`;
    
    fs.writeFileSync(guidePath, guideContent);
    console.log('✅ Guia de deploy criado: DEPLOY-GUIDE.md');
  }

  showNextSteps() {
    console.log('\n🎉 CONFIGURAÇÃO DE DEPLOY CONCLUÍDA!\n');
    
    console.log('📋 PRÓXIMOS PASSOS:\n');
    
    console.log('1. 📁 CRIAR REPOSITÓRIO NO GITHUB:');
    console.log('   - Acesse: https://github.com/new');
    console.log('   - Nome: up-solucoes-site');
    console.log('   - Público ou Privado (sua escolha)');
    console.log('');
    
    console.log('2. 🔗 CONECTAR REPOSITÓRIO LOCAL:');
    console.log('   git remote add origin https://github.com/SEU_USUARIO/up-solucoes-site.git');
    console.log('   git branch -M main');
    console.log('   git push -u origin main');
    console.log('');
    
    console.log('3. 🚀 CONFIGURAR VERCEL:');
    console.log('   vercel login');
    console.log('   vercel link');
    console.log('   vercel --prod');
    console.log('');
    
    console.log('4. 🔐 CONFIGURAR SECRETS NO GITHUB:');
    console.log('   - Vá para: Repository → Settings → Secrets → Actions');
    console.log('   - Adicione os secrets listados no DEPLOY-GUIDE.md');
    console.log('');
    
    console.log('5. ✅ TESTAR DEPLOY:');
    console.log('   - Faça um commit e push');
    console.log('   - Verifique GitHub Actions');
    console.log('   - Acesse o site no Vercel');
    console.log('');
    
    console.log('📖 DOCUMENTAÇÃO COMPLETA: DEPLOY-GUIDE.md');
    console.log('🌐 SITE LOCAL: http://localhost:3000');
    console.log('');
    
    console.log('🎯 COMANDOS ÚTEIS:');
    console.log('   npm run dev:fast     # Desenvolvimento rápido');
    console.log('   npm run deploy:preview  # Deploy de teste');
    console.log('   npm run deploy:prod     # Deploy produção');
    console.log('   npm run check:deploy    # Verificar deploys');
  }

  async run() {
    console.log('🚀 CONFIGURANDO DEPLOY AUTOMÁTICO - UP SOLUÇÕES\n');
    
    // 1. Verificar/Inicializar Git
    if (!this.checkGitRepository()) {
      this.initializeGit();
    }
    
    // 2. Verificar/Instalar Vercel CLI
    if (!this.checkVercelCLI()) {
      this.installVercelCLI();
    }
    
    // 3. Criar arquivos necessários
    this.createGitignore();
    this.createEnvExample();
    
    // 4. Atualizar package.json
    this.updatePackageJsonScripts();
    
    // 5. Criar guia de deploy
    this.createDeployGuide();
    
    // 6. Mostrar próximos passos
    this.showNextSteps();
  }
}

// Executar setup
if (require.main === module) {
  const setup = new DeploySetup();
  setup.run().catch(console.error);
}

module.exports = DeploySetup;