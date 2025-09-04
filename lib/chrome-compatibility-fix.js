// Correções específicas para compatibilidade com Chrome
if (typeof window !== 'undefined') {
  
  // 1. Correção para problemas de CORS e fetch no Chrome
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
  
  // 2. Correção para problemas de localStorage no Chrome
  try {
    const testKey = '__chrome_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
  } catch (error) {
    console.warn('Chrome localStorage issue detected, implementing fallback');
    
    // Fallback para sessionStorage se localStorage falhar
    const fallbackStorage = {
      getItem: (key) => {
        try {
          return sessionStorage.getItem(key) || null;
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          sessionStorage.setItem(key, value);
        } catch (error) {
          console.warn('Storage fallback failed:', error);
        }
      },
      removeItem: (key) => {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.warn('Storage removal failed:', error);
        }
      }
    };
    
    // Substituir localStorage problemático
    Object.defineProperty(window, 'localStorage', {
      value: fallbackStorage,
      writable: false
    });
  }
  
  // 3. Correção para problemas de WebGL/Canvas no Chrome
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('WebGL not available in Chrome, disabling GPU acceleration features');
    document.documentElement.classList.add('no-webgl');
  }
  
  // 4. Correção para problemas de Service Worker no Chrome
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      // Limpar service workers antigos que podem estar causando problemas
      registrations.forEach(registration => {
        if (registration.scope.includes('localhost') || registration.scope.includes('127.0.0.1')) {
          registration.unregister();
        }
      });
    });
  }
  
  // 5. Correção para problemas de CSS Custom Properties no Chrome
  const testDiv = document.createElement('div');
  testDiv.style.setProperty('--test-var', 'test');
  if (!testDiv.style.getPropertyValue('--test-var')) {
    console.warn('CSS Custom Properties issue detected in Chrome');
    document.documentElement.classList.add('no-css-vars');
  }
  
  // 6. Correção para problemas de Intersection Observer no Chrome
  if (!window.IntersectionObserver) {
    console.warn('IntersectionObserver not available, loading polyfill');
    // Implementação básica de fallback
    window.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  
  // 7. Correção para problemas de ResizeObserver no Chrome
  if (!window.ResizeObserver) {
    console.warn('ResizeObserver not available, implementing fallback');
    window.ResizeObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  
  // 8. Correção para problemas de performance no Chrome
  if (navigator.userAgent.includes('Chrome')) {
    // Desabilitar algumas otimizações que podem causar problemas
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        -webkit-perspective: 1000;
      }
      
      .no-webgl * {
        transform: none !important;
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  console.log('Chrome compatibility fixes applied');
}