#!/usr/bin/env node

/**
 * Script de Deploy Automático - Up Solucions
 * Automatiza o processo completo de deploy para Git e Vercel
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

function execCommand(command, description, options = {}) {
  console.log(`\n🔄 ${description}...`)
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    })
    console.log(`✅ ${description} concluído!`)
    return result
  } catch (error) {
    console.log(`❌ Erro em ${description}:`, error.message)
    if (options.exitOnError !== false) {
      process.exit(1)
    }
    return null
  }
}

function checkCommand(command, name) {
  try {
    execSync(command, { stdio: 'pipe' })
    return true
  } catch {
    console.log(`❌ ${name} não encontrado!`)
    return false
  }
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' })
    return status.trim() === ''
  } catch {
    return false
  }
}

function checkGitRemote() {
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' })
    return remote.trim() !== ''
  } catch {
    return false
  }
}

async function setupGitRepository() {
  console.log('\n📋 Configuração do Repositório Git')
  console.log('==================================\n')
  
  if (!checkGitRemote()) {
    console.log('⚠️  Repositório Git não configurado.')
    const setupGit = await question('Deseja configurar um novo repositório? (s/n): ')
    
    if (setupGit.toLowerCase() === 's') {
      const repoName = await question('Nome do repositório (padrão: upsolucions): ') || 'upsolucions'
      const username = await question('Seu username do GitHub: ')
      
      if (username) {
        const repoUrl = `https://github.com/${username}/${repoName}.git`
        
        execCommand('git init', 'Inicializando repositório Git')
        execCommand('git add .', 'Adicionando arquivos')
        execCommand('git commit -m "feat: initial commit"', 'Fazendo commit inicial')
        execCommand(`git remote add origin ${repoUrl}`, 'Configurando remote')
        execCommand('git branch -M main', 'Configurando branch main')
        
        console.log(`\n📝 Agora crie o repositório em: https://github.com/${username}/${repoName}`)
        console.log('   - Deixe público ou privado conforme preferir')
        console.log('   - NÃO inicialize com README')
        
        const created = await question('\nRepositório criado no GitHub? (s/n): ')
        if (created.toLowerCase() === 's') {
          execCommand('git push -u origin main', 'Enviando para GitHub')
        } else {
          console.log('⚠️  Crie o repositório e execute: git push -u origin main')
          return false
        }
      }
    } else {
      return false
    }
  }
  
  return true
}

async function handleGitCommit() {
  console.log('\n📋 Verificando status do Git...')
  
  if (!checkGitStatus()) {
    console.log('⚠️  Existem mudanças não commitadas.')
    
    // Mostrar status
    try {
      console.log('\n📄 Arquivos modificados:')
      execSync('git status --short', { stdio: 'inherit' })
    } catch {}
    
    const shouldCommit = await question('\nDeseja fazer commit das mudanças? (s/n): ')
    
    if (shouldCommit.toLowerCase() === 's') {
      const commitMessage = await question('Mensagem do commit (ou Enter para usar padrão): ')
      const message = commitMessage || `feat: deploy automático - ${new Date().toLocaleString('pt-BR')}`
      
      execCommand('git add .', 'Adicionando arquivos ao Git')
      execCommand(`git commit -m "${message}"`, 'Fazendo commit')
      execCommand('git push origin main', 'Enviando para GitHub')
      return true
    } else {
      console.log('❌ Deploy cancelado. Faça commit das mudanças primeiro.')
      return false
    }
  } else {
    console.log('✅ Git está limpo!')
    return true
  }
}

async function setupVercel() {
  console.log('\n🔧 Configuração do Vercel')
  console.log('=========================\n')
  
  // Verificar Vercel CLI
  if (!checkCommand('vercel --version', 'Vercel CLI')) {
    console.log('\n📦 Instalando Vercel CLI...')
    const installResult = execCommand('npm install -g vercel', 'Instalando Vercel CLI', { exitOnError: false })
    if (!installResult) {
      console.log('❌ Falha na instalação. Instale manualmente: npm install -g vercel')
      return false
    }
  } else {
    console.log('✅ Vercel CLI encontrado!')
  }
  
  // Verificar login
  console.log('\n🔐 Verificando login no Vercel...')
  try {
    const whoami = execSync('vercel whoami', { encoding: 'utf8', stdio: 'pipe' })
    console.log(`✅ Logado como: ${whoami.trim()}`)
  } catch {
    console.log('⚠️  Não logado no Vercel.')
    console.log('\n🔑 Fazendo login no Vercel...')
    console.log('Isso abrirá seu navegador para autenticação.')
    
    try {
      execSync('vercel login', { stdio: 'inherit' })
      console.log('✅ Login realizado com sucesso!')
    } catch {
      console.log('❌ Falha no login. Tente novamente manualmente: vercel login')
      return false
    }
  }
  
  return true
}

async function deployToVercel(isProd = false) {
  console.log('\n🚀 Deploy no Vercel')
  console.log('==================\n')
  
  const deployCommand = isProd ? 'vercel --prod' : 'vercel'
  const deployType = isProd ? 'PRODUÇÃO' : 'PREVIEW'
  
  console.log(`🎯 Deploy para ${deployType}`)
  
  try {
    const result = execCommand(deployCommand, `Deploy ${deployType}`, { silent: false })
    
    console.log('\n🎉 Deploy concluído com sucesso!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Acesse o link fornecido pelo Vercel')
    console.log('2. Teste o site em produção')
    console.log('3. Teste o modo admin (?admin=true)')
    
    return true
  } catch (error) {
    console.log('\n❌ Erro no deploy:')
    console.log(error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Deploy Automático - Up Solucions')
  console.log('===================================\n')
  
  // Verificar argumentos
  const args = process.argv.slice(2)
  const isProd = args.includes('--prod')
  const isPreview = args.includes('--preview')
  
  // Verificar dependências
  console.log('🔍 Verificando dependências...')
  if (!checkCommand('git --version', 'Git')) {
    console.log('Instale o Git: https://git-scm.com/')
    process.exit(1)
  }
  if (!checkCommand('node --version', 'Node.js')) {
    console.log('Instale o Node.js: https://nodejs.org/')
    process.exit(1)
  }
  console.log('✅ Dependências verificadas!')
  
  // Configurar Git se necessário
  const gitReady = await setupGitRepository()
  if (!gitReady) {
    console.log('❌ Configuração do Git cancelada.')
    rl.close()
    return
  }
  
  // Fazer commit se necessário
  const commitReady = await handleGitCommit()
  if (!commitReady) {
    rl.close()
    return
  }
  
  // Configurar Vercel
  const vercelReady = await setupVercel()
  if (!vercelReady) {
    console.log('❌ Configuração do Vercel falhou.')
    rl.close()
    return
  }
  
  // Determinar tipo de deploy
  let deployProd = isProd
  if (!isProd && !isPreview) {
    const deployType = await question('\nTipo de deploy (1=Produção, 2=Preview): ')
    deployProd = deployType === '1'
  }
  
  // Fazer deploy
  const deploySuccess = await deployToVercel(deployProd)
  
  if (deploySuccess) {
    console.log('\n🎉 Deploy automático concluído com sucesso!')
    console.log('\n💡 Comandos úteis para o futuro:')
    console.log('- npm run deploy          # Deploy interativo')
    console.log('- npm run deploy:prod     # Deploy direto para produção')
    console.log('- npm run deploy:preview  # Deploy para preview')
    console.log('- npm run full-deploy     # Git push + Vercel deploy')
  } else {
    console.log('\n❌ Deploy falhou. Verifique os erros acima.')
  }
  
  rl.close()
}

// Executar script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main, deployToVercel, setupGitRepository, setupVercel }