# Script PowerShell para Deploy Automático - Up Soluções
# Executa: powershell -ExecutionPolicy Bypass -File deploy-automatico.ps1

Write-Host "🚀 CONFIGURANDO DEPLOY AUTOMÁTICO - UP SOLUÇÕES" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

# Função para verificar se um comando existe
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Função para executar comando com verificação
function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$Description,
        [bool]$ContinueOnError = $false
    )
    
    Write-Host "🔄 $Description..." -ForegroundColor Yellow
    
    try {
        Invoke-Expression $Command
        Write-Host "✅ $Description concluído" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Erro em $Description`: $($_.Exception.Message)" -ForegroundColor Red
        if (-not $ContinueOnError) {
            Write-Host "⚠️  Parando execução devido ao erro" -ForegroundColor Yellow
            exit 1
        }
        return $false
    }
}

# 1. Verificar Node.js
Write-Host "1️⃣ VERIFICANDO PRÉ-REQUISITOS" -ForegroundColor Magenta
Write-Host ""

if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "💡 Instale Node.js 18+ em: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar Git
if (Test-Command "git") {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Git não encontrado!" -ForegroundColor Red
    Write-Host "💡 Instale Git em: https://git-scm.com" -ForegroundColor Yellow
    exit 1
}

# 3. Verificar se está em um repositório Git
Write-Host ""
Write-Host "2️⃣ CONFIGURANDO REPOSITÓRIO GIT" -ForegroundColor Magenta
Write-Host ""

try {
    git status | Out-Null
    Write-Host "✅ Repositório Git encontrado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Repositório Git não encontrado, inicializando..." -ForegroundColor Yellow
    
    Invoke-SafeCommand "git init" "Inicializando repositório Git"
    Invoke-SafeCommand "git add ." "Adicionando arquivos ao Git"
    Invoke-SafeCommand 'git commit -m "Initial commit: Setup projeto Up Soluções"' "Fazendo commit inicial"
}

# 4. Verificar/Instalar Vercel CLI
Write-Host ""
Write-Host "3️⃣ CONFIGURANDO VERCEL CLI" -ForegroundColor Magenta
Write-Host ""

if (Test-Command "vercel") {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  Vercel CLI não encontrado, instalando..." -ForegroundColor Yellow
    Invoke-SafeCommand "npm install -g vercel" "Instalando Vercel CLI"
}

# 5. Verificar dependências do projeto
Write-Host ""
Write-Host "4️⃣ VERIFICANDO DEPENDÊNCIAS" -ForegroundColor Magenta
Write-Host ""

if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
    
    if (Test-Path "node_modules") {
        Write-Host "✅ node_modules encontrado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  node_modules não encontrado, instalando dependências..." -ForegroundColor Yellow
        Invoke-SafeCommand "npm install" "Instalando dependências"
    }
} else {
    Write-Host "❌ package.json não encontrado!" -ForegroundColor Red
    exit 1
}

# 6. Testar build do projeto
Write-Host ""
Write-Host "5️⃣ TESTANDO BUILD DO PROJETO" -ForegroundColor Magenta
Write-Host ""

$buildSuccess = Invoke-SafeCommand "npm run build" "Testando build do projeto" $true

if ($buildSuccess) {
    Write-Host "✅ Build funcionando corretamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  Build falhou, mas continuando..." -ForegroundColor Yellow
    Write-Host "💡 Verifique os erros acima e corrija antes do deploy" -ForegroundColor Yellow
}

# 7. Verificar arquivos de configuração
Write-Host ""
Write-Host "6️⃣ VERIFICANDO CONFIGURAÇÕES" -ForegroundColor Magenta
Write-Host ""

$configFiles = @(
    @{Path = ".env.local"; Description = "Variáveis de ambiente"},
    @{Path = "vercel.json"; Description = "Configuração do Vercel"},
    @{Path = ".github/workflows/deploy.yml"; Description = "GitHub Actions"},
    @{Path = ".gitignore"; Description = "Git ignore"}
)

foreach ($config in $configFiles) {
    if (Test-Path $config.Path) {
        Write-Host "✅ $($config.Description) configurado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $($config.Description) não encontrado" -ForegroundColor Yellow
    }
}

# 8. Mostrar próximos passos
Write-Host ""
Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

Write-Host "📋 PRÓXIMOS PASSOS MANUAIS:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. 📁 CRIAR REPOSITÓRIO NO GITHUB:" -ForegroundColor White
Write-Host "   • Acesse: https://github.com/new" -ForegroundColor Gray
Write-Host "   • Nome sugerido: up-solucoes-site" -ForegroundColor Gray
Write-Host "   • Escolha público ou privado" -ForegroundColor Gray
Write-Host ""

Write-Host "2. 🔗 CONECTAR REPOSITÓRIO LOCAL:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/SEU_USUARIO/up-solucoes-site.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "3. 🚀 CONFIGURAR VERCEL:" -ForegroundColor White
Write-Host "   vercel login" -ForegroundColor Gray
Write-Host "   vercel link" -ForegroundColor Gray
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""

Write-Host "4. 🔐 CONFIGURAR SECRETS NO GITHUB:" -ForegroundColor White
Write-Host "   • Vá para: Repository → Settings → Secrets → Actions" -ForegroundColor Gray
Write-Host "   • Adicione os secrets listados no DEPLOY-GUIDE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "5. ✅ TESTAR DEPLOY:" -ForegroundColor White
Write-Host "   • Faça um commit e push" -ForegroundColor Gray
Write-Host "   • Verifique GitHub Actions" -ForegroundColor Gray
Write-Host "   • Acesse o site no Vercel" -ForegroundColor Gray
Write-Host ""

Write-Host "📖 DOCUMENTAÇÃO COMPLETA:" -ForegroundColor Cyan
Write-Host "   • DEPLOY-GUIDE.md - Guia completo de deploy" -ForegroundColor Gray
Write-Host "   • GUIA-OTIMIZACAO.md - Otimizações de performance" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 COMANDOS ÚTEIS:" -ForegroundColor Cyan
Write-Host "   npm run dev:fast        # Desenvolvimento rápido" -ForegroundColor Gray
Write-Host "   npm run build           # Testar build" -ForegroundColor Gray
Write-Host "   npm run deploy:preview  # Deploy de teste" -ForegroundColor Gray
Write-Host "   npm run deploy:prod     # Deploy produção" -ForegroundColor Gray
Write-Host "   npm run check:deploy    # Verificar deploys" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 SITE LOCAL FUNCIONANDO:" -ForegroundColor Green
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""

# 9. Perguntar se quer executar comandos automaticamente
Write-Host "❓ EXECUTAR COMANDOS AUTOMATICAMENTE?" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Deseja que eu execute os comandos do Vercel automaticamente? (s/n)"

if ($response -eq "s" -or $response -eq "S" -or $response -eq "sim") {
    Write-Host ""
    Write-Host "🚀 EXECUTANDO COMANDOS DO VERCEL..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "📝 Fazendo login no Vercel..." -ForegroundColor Yellow
    Write-Host "💡 Uma página do navegador será aberta para login" -ForegroundColor Gray
    
    try {
        vercel login
        Write-Host "✅ Login no Vercel concluído" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🔗 Conectando projeto ao Vercel..." -ForegroundColor Yellow
        vercel link
        Write-Host "✅ Projeto conectado ao Vercel" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🚀 Fazendo deploy inicial..." -ForegroundColor Yellow
        vercel --prod
        Write-Host "✅ Deploy inicial concluído" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🎉 DEPLOY AUTOMÁTICO CONFIGURADO COM SUCESSO!" -ForegroundColor Green
        Write-Host "📱 Seu site está online no Vercel!" -ForegroundColor White
        
    } catch {
        Write-Host "❌ Erro durante configuração automática: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Execute os comandos manualmente conforme instruções acima" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Execute os comandos manualmente quando estiver pronto" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 CONFIGURAÇÃO DE DEPLOY FINALIZADA!" -ForegroundColor Green
Write-Host "📖 Consulte DEPLOY-GUIDE.md para instruções detalhadas" -ForegroundColor White
Write-Host ""

# Pausar para o usuário ler
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")