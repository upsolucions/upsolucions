#!/usr/bin/env node

/**
 * Script para corrigir erros de JSON parsing e runtime no Next.js
 * Resolve problemas comuns de sincronização e parsing
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Iniciando correção de erros JSON e runtime...')

// 1. Limpar cache do Next.js
function clearNextCache() {
  console.log('📁 Limpando cache do Next.js...')
  
  const cacheDirs = [
    '.next',
    'node_modules/.cache',
    '.next/cache'
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

// 2. Verificar e corrigir localStorage
function createLocalStorageFix() {
  console.log('🔧 Criando correção para localStorage...')
  
  const fixContent = `
// Correção para problemas de JSON parsing no localStorage
if (typeof window !== 'undefined') {
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;
  
  localStorage.setItem = function(key, value) {
    try {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      return originalSetItem.call(this, key, value);
    } catch (error) {
      console.warn('Erro ao salvar no localStorage:', error);
      return null;
    }
  };
  
  localStorage.getItem = function(key) {
    try {
      const value = originalGetItem.call(this, key);
      if (value === null || value === undefined) {
        return null;
      }
      
      // Tentar fazer parse se parecer JSON
      if (value.startsWith('{') || value.startsWith('[')) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      
      return value;
    } catch (error) {
      console.warn('Erro ao ler do localStorage:', error);
      return null;
    }
  };
}
`
  
  fs.writeFileSync('lib/localStorage-fix.js', fixContent)
  console.log('✅ Correção do localStorage criada')
}

// 3. Verificar e corrigir problemas de SVG
function fixSvgIssues() {
  console.log('🖼️  Verificando problemas de SVG...')
  
  // Verificar se há SVGs problemáticos
  const publicDir = 'public'
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir)
    const svgFiles = files.filter(file => file.endsWith('.svg'))
    
    svgFiles.forEach(file => {
      const filePath = path.join(publicDir, file)
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        
        // Verificar se o SVG está bem formado
        if (!content.includes('</svg>') || !content.includes('<svg')) {
          console.log(`⚠️  SVG possivelmente corrompido: ${file}`)
        } else {
          console.log(`✅ SVG válido: ${file}`)
        }
      } catch (error) {
        console.log(`❌ Erro ao ler SVG: ${file}`)
      }
    })
  }
}

// 4. Criar middleware para capturar erros
function createErrorMiddleware() {
  console.log('🛡️  Criando middleware de captura de erros...')
  
  const middlewareContent = `
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Interceptar requisições problemáticas
  const url = request.nextUrl.clone()
  
  // Evitar loops de requisição
  if (url.searchParams.has('ide_webview_request_time')) {
    const timestamp = url.searchParams.get('ide_webview_request_time')
    const now = Date.now()
    const requestTime = parseInt(timestamp || '0')
    
    // Se a requisição for muito antiga (mais de 30 segundos), redirecionar
    if (now - requestTime > 30000) {
      url.searchParams.delete('ide_webview_request_time')
      return NextResponse.redirect(url)
    }
  }
  
  // Adicionar headers de segurança
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
`
  
  fs.writeFileSync('middleware.ts', middlewareContent)
  console.log('✅ Middleware de erro criado')
}

// 5. Atualizar next.config.mjs com correções
function updateNextConfig() {
  console.log('⚙️  Atualizando configuração do Next.js...')
  
  const configPath = 'next.config.mjs'
  if (fs.existsSync(configPath)) {
    let config = fs.readFileSync(configPath, 'utf8')
    
    // Adicionar configurações para resolver problemas de JSON
    if (!config.includes('onDemandEntries')) {
      const insertPoint = config.indexOf('webpack: (config, { isServer, dev }) => {')
      if (insertPoint !== -1) {
        const beforeWebpack = config.substring(0, insertPoint)
        const afterWebpack = config.substring(insertPoint)
        
        const newConfig = beforeWebpack + `
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  ` + afterWebpack
        
        fs.writeFileSync(configPath, newConfig)
        console.log('✅ Configuração do Next.js atualizada')
      }
    }
  }
}

// 6. Limpar dados corrompidos do localStorage
function createStorageCleanup() {
  console.log('🧹 Criando script de limpeza do storage...')
  
  const cleanupScript = `
// Script para limpar dados corrompidos do localStorage
if (typeof window !== 'undefined') {
  console.log('🧹 Limpando localStorage corrompido...');
  
  const keysToCheck = [
    'siteContent',
    'lastSyncTimestamp',
    'imageStorage',
    'adminSession'
  ];
  
  keysToCheck.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        // Tentar fazer parse para verificar se está válido
        JSON.parse(value);
        console.log('✅ Dados válidos para:', key);
      }
    } catch (error) {
      console.warn('🗑️  Removendo dados corrompidos para:', key);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Limpeza do localStorage concluída');
}
`
  
  fs.writeFileSync('lib/storage-cleanup.js', cleanupScript)
  console.log('✅ Script de limpeza criado')
}

// Executar todas as correções
async function runFixes() {
  try {
    clearNextCache()
    createLocalStorageFix()
    fixSvgIssues()
    createErrorMiddleware()
    updateNextConfig()
    createStorageCleanup()
    
    console.log('\n🎉 Todas as correções foram aplicadas!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Reinicie o servidor de desenvolvimento: npm run dev')
    console.log('2. Limpe o cache do navegador (Ctrl+Shift+R)')
    console.log('3. Verifique se os erros foram resolvidos')
    console.log('\n💡 Se os problemas persistirem, execute:')
    console.log('   node fix-json-errors.js')
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
    process.exit(1)
  }
}

// Verificar se está no diretório correto
if (!fs.existsSync('package.json')) {
  console.log('❌ Execute este script na raiz do projeto (onde está o package.json)')
  process.exit(1)
}

runFixes().catch(console.error)