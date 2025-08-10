
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
