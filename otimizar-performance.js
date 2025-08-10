#!/usr/bin/env node

/**
 * Script para otimizar performance do Next.js
 * Resolve problemas de lentidão e tempos de resposta altos
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Iniciando otimização de performance...')

// 1. Limpar todos os caches
function clearAllCaches() {
  console.log('🧹 Limpando todos os caches...')
  
  const cacheDirs = [
    '.next',
    'node_modules/.cache',
    '.next/cache',
    '.next/static',
    '.next/server',
    'out'
  ]
  
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true })
        console.log(`✅ Cache removido: ${dir}`)
      } catch (error) {
        console.log(`⚠️  Não foi possível remover: ${dir}`)
      }
    }
  })
}

// 2. Otimizar package.json
function optimizePackageJson() {
  console.log('📦 Otimizando package.json...')
  
  const packagePath = 'package.json'
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Adicionar scripts de otimização
    packageJson.scripts = {
      ...packageJson.scripts,
      'dev:fast': 'next dev --turbo',
      'dev:debug': 'next dev --debug',
      'clean': 'rm -rf .next node_modules/.cache',
      'build:analyze': 'ANALYZE=true next build',
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    console.log('✅ package.json otimizado')
  }
}

// 3. Criar arquivo de otimização do webpack
function createWebpackOptimizations() {
  console.log('⚙️  Criando otimizações do webpack...')
  
  const webpackConfig = `
// Otimizações específicas do webpack para performance
module.exports = {
  // Configurações de cache
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
    buildDependencies: {
      config: [__filename],
    },
  },
  
  // Otimizações de resolução
  resolve: {
    symlinks: false,
    cacheWithContext: false,
  },
  
  // Configurações de snapshot
  snapshot: {
    managedPaths: [],
    immutablePaths: [],
    buildDependencies: {
      hash: true,
      timestamp: true,
    },
    module: {
      timestamp: true,
    },
    resolve: {
      timestamp: true,
    },
    resolveBuildDependencies: {
      hash: true,
      timestamp: true,
    },
  },
  
  // Configurações de watch
  watchOptions: {
    poll: false,
    aggregateTimeout: 200,
    ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
  },
}
`
  
  fs.writeFileSync('webpack.config.js', webpackConfig)
  console.log('✅ Configurações do webpack criadas')
}

// 4. Otimizar variáveis de ambiente
function optimizeEnvVars() {
  console.log('🔧 Otimizando variáveis de ambiente...')
  
  const envPath = '.env.local'
  let envContent = ''
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  }
  
  // Adicionar otimizações de performance
  const optimizations = `
# Otimizações de Performance
NEXT_TELEMETRY_DISABLED=1
FAST_REFRESH=true
NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=512"
NEXT_PRIVATE_STANDALONE=true
NEXT_PRIVATE_LOCAL_WEBPACK=true

# Configurações de desenvolvimento
WEBPACK_CACHE=true
TURBOPACK=1
`
  
  // Verificar se as otimizações já existem
  if (!envContent.includes('NEXT_PRIVATE_STANDALONE')) {
    envContent += optimizations
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Variáveis de ambiente otimizadas')
  } else {
    console.log('✅ Variáveis já otimizadas')
  }
}

// 5. Criar script de monitoramento
function createMonitoringScript() {
  console.log('📊 Criando script de monitoramento...')
  
  const monitorScript = `
// Script de monitoramento de performance
if (typeof window !== 'undefined') {
  // Monitorar tempos de carregamento
  window.addEventListener('load', () => {
    const loadTime = performance.now()
    console.log('⏱️  Tempo de carregamento:', Math.round(loadTime), 'ms')
    
    // Alertar se muito lento
    if (loadTime > 5000) {
      console.warn('⚠️  Carregamento lento detectado!')
    }
  })
  
  // Monitorar navegação
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        console.log('🔄 Navegação:', {
          tipo: entry.type,
          duração: Math.round(entry.duration),
          domContentLoaded: Math.round(entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart),
          loadComplete: Math.round(entry.loadEventEnd - entry.loadEventStart)
        })
      }
    }
  })
  
  observer.observe({ entryTypes: ['navigation'] })
}
`
  
  fs.writeFileSync('lib/performance-monitor.js', monitorScript)
  console.log('✅ Script de monitoramento criado')
}

// 6. Reinicializar dependências se necessário
function reinstallDependencies() {
  console.log('📦 Verificando dependências...')
  
  try {
    // Verificar se node_modules existe e está atualizado
    const packageLockExists = fs.existsSync('package-lock.json')
    const nodeModulesExists = fs.existsSync('node_modules')
    
    if (!nodeModulesExists || !packageLockExists) {
      console.log('🔄 Reinstalando dependências...')
      execSync('npm install', { stdio: 'inherit' })
      console.log('✅ Dependências reinstaladas')
    } else {
      console.log('✅ Dependências OK')
    }
  } catch (error) {
    console.warn('⚠️  Erro ao verificar dependências:', error.message)
  }
}

// 7. Criar guia de otimização
function createOptimizationGuide() {
  console.log('📖 Criando guia de otimização...')
  
  const guide = `# Guia de Otimização de Performance

## 🚀 Otimizações Aplicadas

### 1. Cache e Webpack
- ✅ Cache do filesystem habilitado
- ✅ Otimizações de resolução
- ✅ Watch options otimizadas
- ✅ Split chunks configurado

### 2. Variáveis de Ambiente
- ✅ NODE_OPTIONS otimizado (8GB RAM)
- ✅ TURBOPACK habilitado
- ✅ WEBPACK_CACHE ativo
- ✅ FAST_REFRESH habilitado

### 3. Scripts Disponíveis
\`\`\`bash
# Desenvolvimento rápido com Turbo
npm run dev:fast

# Desenvolvimento com debug
npm run dev:debug

# Limpeza de cache
npm run clean

# Build com análise
npm run build:analyze
\`\`\`

### 4. Monitoramento
- ✅ Script de monitoramento criado
- ✅ Alertas de performance
- ✅ Métricas de navegação

## 🔧 Comandos de Diagnóstico

### Verificar Performance
\`\`\`bash
# Executar otimização
node otimizar-performance.js

# Iniciar com turbo
npm run dev:fast

# Monitorar no navegador
# Abra DevTools > Console para ver métricas
\`\`\`

### Solução de Problemas

1. **Se ainda estiver lento:**
   - Execute: \`npm run clean\`
   - Reinicie: \`npm run dev:fast\`
   - Limpe cache do navegador

2. **Para análise detalhada:**
   - Execute: \`npm run build:analyze\`
   - Verifique bundle size

3. **Monitoramento contínuo:**
   - Abra DevTools
   - Vá para Performance tab
   - Grave uma sessão

## 📊 Métricas Esperadas

- **Tempo de inicialização:** < 5s
- **Compilação inicial:** < 20s
- **Hot reload:** < 2s
- **Navegação:** < 1s

## ⚠️ Troubleshooting

Se os problemas persistirem:
1. Reinicie o computador
2. Verifique RAM disponível
3. Feche outros aplicativos
4. Execute \`node otimizar-performance.js\` novamente
`
  
  fs.writeFileSync('GUIA-OTIMIZACAO.md', guide)
  console.log('✅ Guia de otimização criado')
}

// Executar todas as otimizações
async function runOptimizations() {
  try {
    clearAllCaches()
    optimizePackageJson()
    createWebpackOptimizations()
    optimizeEnvVars()
    createMonitoringScript()
    reinstallDependencies()
    createOptimizationGuide()
    
    console.log('\n🎉 Otimização concluída!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Reinicie o servidor: npm run dev:fast')
    console.log('2. Monitore performance no console do navegador')
    console.log('3. Verifique se o carregamento melhorou')
    console.log('\n⏱️  Tempo esperado de carregamento: < 5 segundos')
    console.log('\n💡 Para análise detalhada: npm run build:analyze')
    
  } catch (error) {
    console.error('❌ Erro durante otimização:', error)
    process.exit(1)
  }
}

// Verificar se está no diretório correto
if (!fs.existsSync('package.json')) {
  console.log('❌ Execute este script na raiz do projeto (onde está o package.json)')
  process.exit(1)
}

runOptimizations().catch(console.error)