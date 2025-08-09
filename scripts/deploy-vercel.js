#!/usr/bin/env node

/**
 * Script automatizado para deploy no Vercel
 * Este script facilita o processo de deploy e configuração
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

function execCommand(command, description) {
  console.log(`\n🔄 ${description}...`)
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    console.log(`✅ ${description} concluído!`)
    return result
  } catch (error) {
    console.log(`❌ Erro em ${description}:`, error.message)
    return null
  }
}

function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' })
    return true
  } catch {
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

async function deployToVercel() {
  console.log('🚀 Deploy Automatizado - Up Solucions')
  console.log('====================================\n')
  
  // Verificar se Git está limpo
  console.log('📋 Verificando status do Git...')
  if (!checkGitStatus()) {
    console.log('⚠️  Existem mudanças não commitadas.')
    const shouldCommit = await question('Deseja fazer commit das mudanças? (s/n): ')
    
    if (shouldCommit.toLowerCase() === 's') {
      execCommand('git add .', 'Adicionando arquivos ao Git')
      const commitMessage = await question('Mensagem do commit (ou Enter para usar padrão): ')
      const message = commitMessage || 'feat: Atualizações para deploy'
      execCommand(`git commit -m "${message}"`, 'Fazendo commit')
      execCommand('git push origin main', 'Enviando para GitHub')
    } else {
      console.log('❌ Deploy cancelado. Faça commit das mudanças primeiro.')
      rl.close()
      return
    }
  } else {
    console.log('✅ Git está limpo!')
  }
  
  // Verificar Vercel CLI
  console.log('\n🔧 Verificando Vercel CLI...')
  if (!checkVercelCLI()) {
    console.log('❌ Vercel CLI não encontrado!')
    console.log('\n📦 Instalando Vercel CLI...')
    const installResult = execCommand('npm install -g vercel', 'Instalando Vercel CLI')
    if (!installResult) {
      console.log('❌ Falha na instalação. Instale manualmente: npm install -g vercel')
      rl.close()
      return
    }
  } else {
    console.log('✅ Vercel CLI encontrado!')
  }
  
  // Verificar se já está logado no Vercel
  console.log('\n🔐 Verificando login no Vercel...')
  try {
    execSync('vercel whoami', { stdio: 'pipe' })
    console.log('✅ Já logado no Vercel!')
  } catch {
    console.log('⚠️  Não logado no Vercel.')
    console.log('\n🔑 Fazendo login no Vercel...')
    console.log('Isso abrirá seu navegador para autenticação.')
    
    try {
      execSync('vercel login', { stdio: 'inherit' })
      console.log('✅ Login realizado com sucesso!')
    } catch {
      console.log('❌ Falha no login. Tente novamente manualmente: vercel login')
      rl.close()
      return
    }
  }
  
  // Configurar variáveis de ambiente
  console.log('\n🔧 Configuração de Variáveis de Ambiente')
  console.log('========================================\n')
  
  const hasSupabase = await question('Você já configurou o Supabase? (s/n): ')
  
  if (hasSupabase.toLowerCase() === 's') {
    console.log('\n📝 Insira as credenciais do Supabase:')
    const supabaseUrl = await question('URL do Supabase (https://xxx.supabase.co): ')
    const supabaseKey = await question('Chave anon/public do Supabase: ')
    
    if (supabaseUrl && supabaseKey) {
      // Configurar variáveis no Vercel
      console.log('\n🔧 Configurando variáveis no Vercel...')
      
      const envCommands = [
        `vercel env add NEXT_PUBLIC_SUPABASE_URL production`,
        `vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production`,
        `vercel env add NEXT_TELEMETRY_DISABLED production`,
        `vercel env add NODE_OPTIONS production`
      ]
      
      const envValues = [supabaseUrl, supabaseKey, '1', '--max-old-space-size=4096']
      
      for (let i = 0; i < envCommands.length; i++) {
        console.log(`\n🔧 Configurando ${envCommands[i].split(' ')[3]}...`)
        console.log(`Valor: ${envValues[i]}`)
        
        try {
          // Simular input para o comando vercel env add
          const child = require('child_process').spawn('vercel', ['env', 'add', envCommands[i].split(' ')[3], 'production'], {
            stdio: ['pipe', 'inherit', 'inherit']
          })
          
          child.stdin.write(envValues[i] + '\n')
          child.stdin.end()
          
          await new Promise((resolve) => {
            child.on('close', resolve)
          })
        } catch (error) {
          console.log(`⚠️  Configure manualmente: ${envCommands[i].split(' ')[3]} = ${envValues[i]}`)
        }
      }
    }
  } else {
    console.log('\n⚠️  Supabase não configurado.')
    console.log('O site funcionará em modo local (sem sincronização entre dispositivos).')
    console.log('\nPara configurar depois:')
    console.log('1. Execute: node scripts/setup-supabase.js')
    console.log('2. Configure as variáveis no Vercel Dashboard')
  }
  
  // Fazer deploy
  console.log('\n🚀 Iniciando Deploy...')
  console.log('======================\n')
  
  const deployType = await question('Tipo de deploy (1=Produção, 2=Preview): ')
  
  let deployCommand = 'vercel'
  if (deployType === '1') {
    deployCommand += ' --prod'
    console.log('🎯 Deploy para PRODUÇÃO')
  } else {
    console.log('🎯 Deploy para PREVIEW')
  }
  
  try {
    console.log('\n🔄 Executando deploy...')
    const deployResult = execSync(deployCommand, { encoding: 'utf8', stdio: 'inherit' })
    
    console.log('\n🎉 Deploy concluído com sucesso!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Acesse o link fornecido pelo Vercel')
    console.log('2. Teste o site em produção')
    console.log('3. Teste o modo admin (?admin=true)')
    
    if (hasSupabase.toLowerCase() !== 's') {
      console.log('\n⚠️  Lembre-se de configurar o Supabase para sincronização:')
      console.log('- Execute: node scripts/setup-supabase.js')
      console.log('- Configure as variáveis no Vercel Dashboard')
      console.log('- Faça redeploy: vercel --prod')
    }
    
  } catch (error) {
    console.log('\n❌ Erro no deploy:')
    console.log(error.message)
    console.log('\n🔧 Soluções:')
    console.log('1. Verifique se todas as variáveis estão configuradas')
    console.log('2. Tente fazer deploy manual: vercel --prod')
    console.log('3. Verifique os logs no Vercel Dashboard')
  }
  
  rl.close()
}

// Verificar se está no diretório correto
if (!fs.existsSync('package.json')) {
  console.log('❌ Execute este script na raiz do projeto (onde está o package.json)')
  process.exit(1)
}

// Verificar se é um projeto Next.js
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
if (!packageJson.dependencies?.next && !packageJson.devDependencies?.next) {
  console.log('❌ Este não parece ser um projeto Next.js')
  process.exit(1)
}

deployToVercel().catch(console.error)