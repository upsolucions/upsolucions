
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
