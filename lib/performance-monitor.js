
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
