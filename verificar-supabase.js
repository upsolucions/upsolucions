const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Função para ler variáveis do .env.local
function loadEnvLocal() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

const env = loadEnvLocal();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas!');
  console.log('Verifique se o arquivo .env.local contém:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarSupabase() {
  console.log('🔍 Verificando conexão com Supabase...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Testar leitura da tabela
    console.log('\n📖 Testando leitura da tabela site_content...');
    const { data: readData, error: readError } = await supabase
      .from('site_content')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.error('❌ Erro ao ler tabela:', readError.message);
      if (readError.code === 'PGRST116') {
        console.log('\n🔧 A tabela site_content não existe ainda.');
        console.log('Execute o SQL do arquivo criar-tabela-supabase.sql no Supabase:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql/new');
        console.log('2. Cole o conteúdo do arquivo criar-tabela-supabase.sql');
        console.log('3. Clique em "Run" para executar');
        console.log('4. Execute este script novamente');
      }
      return;
    }
    
    console.log('✅ Leitura da tabela funcionando!');
    console.log('Dados encontrados:', readData?.length || 0, 'registros');
    
    // Testar inserção
    console.log('\n✏️ Testando inserção de dados...');
    const testData = {
      id: 'test_' + Date.now(),
      content: { teste: 'Sincronização funcionando!', timestamp: new Date().toISOString() }
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('site_content')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir dados:', insertError.message);
      return;
    }
    
    console.log('✅ Inserção funcionando!');
    console.log('Dados inseridos:', insertData);
    
    // Testar atualização
    console.log('\n🔄 Testando atualização de dados...');
    const { data: updateData, error: updateError } = await supabase
      .from('site_content')
      .update({ content: { ...testData.content, atualizado: true } })
      .eq('id', testData.id)
      .select();
    
    if (updateError) {
      console.error('❌ Erro ao atualizar dados:', updateError.message);
      return;
    }
    
    console.log('✅ Atualização funcionando!');
    console.log('Dados atualizados:', updateData);
    
    // Limpar dados de teste
    await supabase.from('site_content').delete().eq('id', testData.id);
    
    console.log('\n🎉 Todos os testes passaram! O Supabase está configurado corretamente.');
    console.log('\n📱 Para testar sincronização entre dispositivos:');
    console.log('1. Abra o site em dois navegadores diferentes');
    console.log('2. Faça alterações em um navegador');
    console.log('3. Observe as mudanças aparecerem no outro navegador');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

verificarSupabase();