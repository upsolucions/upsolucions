#!/usr/bin/env node

/**
 * Script de configuração do Supabase
 * Este script ajuda a configurar o Supabase corretamente para resolver problemas de sincronização
 */

const fs = require('fs')
const path = require('path')
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

async function setupSupabase() {
  console.log('🚀 Configuração do Supabase para Up Solucions')
  console.log('============================================\n')
  
  console.log('Para configurar a sincronização entre dispositivos, você precisa:')
  console.log('1. Criar um projeto no Supabase (https://supabase.com/dashboard)')
  console.log('2. Obter as credenciais do projeto')
  console.log('3. Configurar as tabelas necessárias\n')
  
  const hasProject = await question('Você já tem um projeto Supabase? (s/n): ')
  
  if (hasProject.toLowerCase() !== 's') {
    console.log('\n📋 Passos para criar um projeto Supabase:')
    console.log('1. Acesse https://supabase.com/dashboard')
    console.log('2. Clique em "New Project"')
    console.log('3. Escolha um nome (ex: up-solucions-site)')
    console.log('4. Aguarde a criação do projeto')
    console.log('\nApós criar o projeto, execute este script novamente.\n')
    rl.close()
    return
  }
  
  console.log('\n🔑 Agora vamos configurar as credenciais:')
  
  const supabaseUrl = await question('Cole a URL do seu projeto Supabase: ')
  const supabaseKey = await question('Cole a chave anon/public do Supabase: ')
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ URL e chave são obrigatórias!')
    rl.close()
    return
  }
  
  // Validar URL
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
    console.log('❌ URL inválida! Deve ser algo como: https://seu-projeto.supabase.co')
    rl.close()
    return
  }
  
  // Criar arquivo .env.local
  const envContent = `# Configurações do Supabase - Up Solucions
# Gerado automaticamente em ${new Date().toLocaleString()}

NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}

# Otimizações de performance
NEXT_TELEMETRY_DISABLED=1
FAST_REFRESH=true
NODE_OPTIONS="--max-old-space-size=4096"
`
  
  const envPath = path.join(process.cwd(), '.env.local')
  
  try {
    fs.writeFileSync(envPath, envContent)
    console.log('\n✅ Arquivo .env.local criado com sucesso!')
  } catch (error) {
    console.log('❌ Erro ao criar .env.local:', error.message)
    rl.close()
    return
  }
  
  console.log('\n📊 Agora vamos configurar as tabelas no Supabase:')
  console.log('\n1. Acesse o SQL Editor no seu projeto Supabase')
  console.log('2. Execute o seguinte SQL:')
  console.log('\n' + '='.repeat(50))
  console.log(`
-- Criar tabela para conteúdo do site
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública" ON site_content
  FOR SELECT USING (true);

-- Política para permitir escrita pública (temporária - ajuste conforme necessário)
CREATE POLICY "Permitir escrita pública" ON site_content
  FOR ALL USING (true);

-- Criar bucket para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para upload de imagens
CREATE POLICY "Permitir upload de imagens" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-images');

-- Política para leitura de imagens
CREATE POLICY "Permitir leitura de imagens" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-images');

-- Inserir conteúdo inicial se não existir
INSERT INTO site_content (id, content)
VALUES ('main', '{}')
ON CONFLICT (id) DO NOTHING;
`)
  console.log('\n' + '='.repeat(50))
  
  console.log('\n3. Após executar o SQL, reinicie o servidor de desenvolvimento:')
  console.log('   npm run dev')
  
  console.log('\n🎉 Configuração concluída!')
  console.log('\nAgora a sincronização entre dispositivos deve funcionar corretamente.')
  console.log('Você verá um indicador de status no canto inferior esquerdo da tela.')
  
  rl.close()
}

setupSupabase().catch(console.error)