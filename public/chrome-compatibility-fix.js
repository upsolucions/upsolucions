// Correções específicas para compatibilidade com Chrome
(function() {
  'use strict';
  
  // 1. Correção para problemas de CORS e fetch no Chrome
  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const [url, options = {}] = args;
      
      // Adicionar headers específicos para Chrome
      const chromeHeaders = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers
      };
      
      const chromeOptions = {
        ...options,
        headers: chromeHeaders,
        mode: options.mode || 'cors',
        credentials: options.credentials || 'same-origin'
      };
      
      return originalFetch.call(this, url, chromeOptions);
    };
  }
  
  // 2. Correção para problemas de localStorage no Chrome
  try {
    const testKey = '__chrome_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
  } catch (error) {
    console.warn('Chrome localStorage issue detected, implementing fallback');
    
    // Fallback para sessionStorage se localStorage falhar
    const fallbackStorage = {
      getItem: function(key) {
        try {
          return sessionStorage.getItem(key) || null;
        } catch {
          return null;
        }
      },
      setItem: function(key, value) {
        try {
          sessionStorage.setItem(key, value);
        } catch (error) {
          console.warn('Storage fallback failed:', error);
        }
      },
      removeItem: function(key) {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.warn('Storage removal failed:', error);
        }
      }
    };
    
    // Substituir localStorage problemático
    try {
      Object.defineProperty(window, 'localStorage', {
        value: fallbackStorage,
        writable: false
      });
    } catch (e) {
      window.localStorage = fallbackStorage;
    }
  }
  
  // 3. Correção para problemas de Service Worker no Chrome
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      // Limpar service workers antigos que podem estar causando problemas
      registrations.forEach(function(registration) {
        if (registration.scope.includes('localhost') || registration.scope.includes('127.0.0.1')) {
          registration.unregister();
        }
      });
    }).catch(function(error) {
      console.warn('Service Worker cleanup failed:', error);
    });
  }
  
  // 4. Correção para problemas de CSS no Chrome
  if (navigator.userAgent.includes('Chrome')) {
    // Adicionar estilos de correção
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      body {
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
      }
      
      img {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
      }
    `;
    
    // Adicionar ao head quando disponível
    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        document.head.appendChild(style);
      });
    }
  }
  
  // 5. Correção para problemas de memória no Chrome
  let memoryCleanupInterval;
  
  function cleanupMemory() {
    // Limpar caches antigos
    if (window.caches) {
      caches.keys().then(function(names) {
        names.forEach(function(name) {
          if (name.includes('old') || name.includes('temp')) {
            caches.delete(name);
          }
        });
      });
    }
    
    // Forçar garbage collection se disponível
    if (window.gc) {
      window.gc();
    }
  }
  
  // Executar limpeza periodicamente
  memoryCleanupInterval = setInterval(cleanupMemory, 300000); // 5 minutos
  
  // Limpar ao sair da página
  window.addEventListener('beforeunload', function() {
    if (memoryCleanupInterval) {
      clearInterval(memoryCleanupInterval);
    }
    cleanupMemory();
  });
  
  console.log('Chrome compatibility fixes loaded');
})();