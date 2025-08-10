const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Ler variáveis do .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSync() {
  console.log('🔄 Testando Sincronização do Supabase');
  console.log('=====================================\n');
  
  try {
    // 1. Verificar se a tabela existe
    console.log('1️⃣ Verificando se a tabela site_content existe...');
    const { data: existingData, error: readError } = await supabase
      .from('site_content')
      .select('*')
      .eq('id', 'main');
    
    if (readError) {
      console.log('❌ ERRO:', readError.message);
      if (readError.code === 'PGRST205') {
        console.log('\n🚨 A tabela site_content ainda não foi criada!');
        console.log('\n📋 Execute este SQL no Supabase primeiro:');
        console.log('https://supabase.com/dashboard/project/dsfdrqvwddgpcdroqnvb/sql/new\n');
        console.log('-- Criar tabela site_content');
        console.log('CREATE TABLE IF NOT EXISTS site_content (');
        console.log('  id TEXT PRIMARY KEY,');
        console.log('  content JSONB NOT NULL,');
        console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
        console.log(');\n');
        console.log('-- Habilitar RLS');
        console.log('ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;\n');
        console.log('-- Políticas de acesso');
        console.log('CREATE POLICY "Allow public read" ON site_content FOR SELECT USING (true);');
        console.log('CREATE POLICY "Allow public write" ON site_content FOR ALL USING (true);\n');
        console.log('-- Dados iniciais');
        console.log('INSERT INTO site_content (id, content) VALUES (\'main\', \'{}\') ON CONFLICT (id) DO NOTHING;');
        return;
      }
      return;
    }
    
    console.log('✅ Tabela existe! Dados atuais:', existingData);
    
    // 2. Testar inserção de dados de teste
    console.log('\n2️⃣ Inserindo dados de teste...');
    const testData = {
      id: 'main',
      content: {
        titulo: 'Up Soluções - Teste de Sincronização',
        subtitulo: 'Testando sincronização em tempo real',
        timestamp: new Date().toISOString(),
        teste_navegador: 'Dados inseridos via script de teste',
        contador: Math.floor(Math.random() * 1000)
      }
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('site_content')
      .upsert(testData)
      .select();
    
    if (insertError) {
      console.log('❌ Erro ao inserir:', insertError.message);
      return;
    }
    
    console.log('✅ Dados inseridos com sucesso!');
    console.log('📊 Dados:', JSON.stringify(insertData[0].content, null, 2));
    
    // 3. Configurar listener para mudanças em tempo real
    console.log('\n3️⃣ Configurando listener para mudanças em tempo real...');
    console.log('👀 Aguardando mudanças... (Pressione Ctrl+C para parar)');
    
    const subscription = supabase
      .channel('site_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_content'
        },
        (payload) => {
          console.log('\n🔔 MUDANÇA DETECTADA!');
          console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
          console.log('🔄 Tipo:', payload.eventType);
          if (payload.new) {
            console.log('📝 Novos dados:', JSON.stringify(payload.new.content, null, 2));
          }
          console.log('\n👀 Continuando a aguardar mudanças...');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Listener ativo! Faça mudanças no site em outro navegador.');
          console.log('\n📱 COMO TESTAR:');
          console.log('1. Abra http://localhost:3000 em outro navegador');
          console.log('2. Faça login como admin (se necessário)');
          console.log('3. Edite qualquer texto na página');
          console.log('4. Observe as mudanças aparecerem aqui em tempo real!');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Erro no canal de tempo real');
        }
      });
    
    // Manter o script rodando
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Parando o teste...');
      subscription.unsubscribe();
      process.exit(0);
    });
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testSync();