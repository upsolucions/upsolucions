# Script para configurar o repositório GitHub e preparar para Vercel
# Execute este script no PowerShell como Administrador

Write-Host "🚀 Configurando repositório Up Solucions para GitHub e Vercel" -ForegroundColor Green
Write-Host ""

# Verificar se o Git está instalado
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git não encontrado. Instale o Git primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se estamos no diretório correto
if (!(Test-Path "package.json")) {
    Write-Host "❌ Execute este script no diretório raiz do projeto." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Opções disponíveis:" -ForegroundColor Yellow
Write-Host "1. Criar novo repositório com seu usuário GitHub"
Write-Host "2. Usar GitHub CLI (se instalado)"
Write-Host "3. Apenas mostrar instruções manuais"
Write-Host ""

$opcao = Read-Host "Escolha uma opção (1-3)"

switch ($opcao) {
    "1" {
        $usuario = Read-Host "Digite seu usuário do GitHub"
        $nomeRepo = Read-Host "Digite o nome do repositório (padrão: upsolucions)"
        
        if ([string]::IsNullOrEmpty($nomeRepo)) {
            $nomeRepo = "upsolucions"
        }
        
        $repoUrl = "https://github.com/$usuario/$nomeRepo.git"
        
        Write-Host "🔗 Configurando remote para: $repoUrl" -ForegroundColor Blue
        git remote add origin $repoUrl
        
        Write-Host "📤 Tentando fazer push..." -ForegroundColor Blue
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
            Write-Host "🌐 Repositório: https://github.com/$usuario/$nomeRepo" -ForegroundColor Green
        } else {
            Write-Host "❌ Falha no push. Verifique se:" -ForegroundColor Red
            Write-Host "   - O repositório existe no GitHub" -ForegroundColor Yellow
            Write-Host "   - Você tem permissões de escrita" -ForegroundColor Yellow
            Write-Host "   - Suas credenciais estão corretas" -ForegroundColor Yellow
        }
    }
    
    "2" {
        if (Get-Command gh -ErrorAction SilentlyContinue) {
            Write-Host "🔐 Fazendo login no GitHub CLI..." -ForegroundColor Blue
            gh auth login
            
            Write-Host "📦 Criando repositório..." -ForegroundColor Blue
            gh repo create upsolucions --public --source=. --remote=origin --push
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Repositório criado e código enviado com sucesso!" -ForegroundColor Green
            }
        } else {
            Write-Host "❌ GitHub CLI não encontrado. Instale com: winget install GitHub.cli" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host "📋 Instruções manuais:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Acesse https://github.com/new" -ForegroundColor White
        Write-Host "2. Crie um repositório chamado 'upsolucions'" -ForegroundColor White
        Write-Host "3. NÃO inicialize com README" -ForegroundColor White
        Write-Host "4. Execute os comandos:" -ForegroundColor White
        Write-Host "   git remote add origin https://github.com/SEU_USUARIO/upsolucions.git" -ForegroundColor Cyan
        Write-Host "   git push -u origin main" -ForegroundColor Cyan
    }
    
    default {
        Write-Host "❌ Opção inválida." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🌐 Próximo passo: Deploy no Vercel" -ForegroundColor Green
Write-Host "1. Acesse https://vercel.com" -ForegroundColor White
Write-Host "2. Conecte com GitHub" -ForegroundColor White
Write-Host "3. Importe seu repositório" -ForegroundColor White
Write-Host "4. Configure as variáveis de ambiente (veja .env.example)" -ForegroundColor White
Write-Host "5. Deploy automático!" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consulte README.md e DEPLOY-INSTRUCTIONS.md para mais detalhes" -ForegroundColor Blue