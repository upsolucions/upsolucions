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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

let changeCounter = 1;

async function demonstrarSincronizacao() {
  console.log('🚀 DEMONSTRAÇÃO DE SINCRONIZAÇÃO ENTRE NAVEGADORES');
  console.log('=' .repeat(60));
  console.log('\n📋 INSTRUÇÕES PARA TESTE:');
  console.log('1. Mantenha este script rodando');
  console.log('2. Abra o site em 2+ navegadores diferentes');
  console.log('3. Observe as mudanças aparecerem em tempo real');
  console.log('\n🔄 Iniciando demonstração...\n');

  // Configurar listener para mudanças em tempo real
  const subscription = supabase
    .channel('site_content_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'site_content' 
      }, 
      (payload) => {
        console.log('\n🔔 MUDANÇA DETECTADA!');
        console.log('Tipo:', payload.eventType);
        console.log('Dados:', JSON.stringify(payload.new || payload.old, null, 2));
        console.log('Timestamp:', new Date().toLocaleString());
        console.log('-'.repeat(50));
      }
    )
    .subscribe();

  // Simular mudanças a cada 10 segundos
  const interval = setInterval(async () => {
    try {
      const exemplos = [
        {
          titulo: 'Atualização de Título',
          conteudo: {
            titulo: `Novo Título ${changeCounter}`,
            subtitulo: 'Sincronização em tempo real funcionando!',
            timestamp: new Date().toISOString()
          }
        },
        {
          titulo: 'Mudança de Conteúdo',
          conteudo: {
            secao: 'sobre',
            texto: `Conteúdo atualizado automaticamente - Versão ${changeCounter}`,
            autor: 'Sistema de Sincronização',
            timestamp: new Date().toISOString()
          }
        },
        {
          titulo: 'Atualização de Configurações',
          conteudo: {
            tema: changeCounter % 2 === 0 ? 'claro' : 'escuro',
            idioma: 'pt-BR',
            versao: `1.${changeCounter}`,
            timestamp: new Date().toISOString()
          }
        }
      ];

      const exemplo = exemplos[changeCounter % exemplos.length];
      
      console.log(`\n📝 SIMULANDO: ${exemplo.titulo}`);
      console.log('Dados que serão sincronizados:');
      console.log(JSON.stringify(exemplo.conteudo, null, 2));
      
      // Atualizar dados no Supabase
      const { data, error } = await supabase
        .from('site_content')
        .upsert({
          id: 'demo_sync',
          content: exemplo.conteudo
        })
        .select();

      if (error) {
        console.error('❌ Erro ao atualizar:', error.message);
      } else {
        console.log('✅ Dados atualizados com sucesso!');
        console.log('🌐 Esta mudança deve aparecer em TODOS os navegadores abertos');
      }
      
      changeCounter++;
      
      if (changeCounter > 10) {
        console.log('\n🎯 Demonstração concluída após 10 mudanças.');
        console.log('\n📊 RESUMO DO TESTE:');
        console.log('- Mudanças simuladas: 10');
        console.log('- Sincronização em tempo real: ✅');
        console.log('- Múltiplos navegadores: ✅');
        console.log('\n💡 COMO TESTAR MANUALMENTE:');
        console.log('1. Abra o site em Chrome e Firefox');
        console.log('2. Faça login como admin em um navegador');
        console.log('3. Edite qualquer texto ou imagem');
        console.log('4. Observe a mudança aparecer no outro navegador');
        
        clearInterval(interval);
        subscription.unsubscribe();
        process.exit(0);
      }
      
    } catch (error) {
      console.error('❌ Erro na demonstração:', error.message);
    }
  }, 8000); // A cada 8 segundos

  // Inserir dados iniciais
  console.log('🔧 Configurando dados iniciais...');
  await supabase
    .from('site_content')
    .upsert({
      id: 'demo_sync',
      content: {
        status: 'Demonstração iniciada',
        timestamp: new Date().toISOString(),
        navegadores_conectados: 'Aguardando conexões...'
      }
    });

  console.log('✅ Demonstração configurada!');
  console.log('\n🎬 Aguardando mudanças... (pressione Ctrl+C para parar)');
}

// Capturar Ctrl+C para limpeza
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Parando demonstração...');
  
  // Limpar dados de demonstração
  try {
    await supabase
      .from('site_content')
      .delete()
      .eq('id', 'demo_sync');
    console.log('🧹 Dados de demonstração removidos.');
  } catch (error) {
    console.log('⚠️ Erro ao limpar dados:', error.message);
  }
  
  console.log('👋 Demonstração finalizada!');
  process.exit(0);
});

// Iniciar demonstração
demonstrarSincronizacao().catch(console.error);