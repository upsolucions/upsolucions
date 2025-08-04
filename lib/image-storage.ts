"use client"

// Sistema robusto de armazenamento de imagens
export class ImageStorageService {
  private static readonly STORAGE_KEY = 'uploadedImages'
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024 // 50MB
  private static readonly DB_NAME = 'UpSolucoesImages'
  private static readonly DB_VERSION = 2 // Incrementado para forçar upgrade

  // Salvar imagem no IndexedDB para persistência robusta
  static async saveImageToIndexedDB(key: string, dataUrl: string, metadata: any): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false

      return new Promise((resolve) => {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)
        
        request.onerror = () => {
          console.error('[ImageStorage] Erro ao abrir IndexedDB')
          resolve(false)
        }
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains('images')) {
            db.createObjectStore('images', { keyPath: 'key' })
          }
        }
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          
          // Verificar se o object store existe antes de criar a transação
          if (!db.objectStoreNames.contains('images')) {
            console.error('[ImageStorage] Object store "images" não encontrado')
            resolve(false)
            return
          }
          
          const transaction = db.transaction(['images'], 'readwrite')
          const store = transaction.objectStore('images')
          
          const imageData = {
            key,
            dataUrl,
            metadata,
            timestamp: Date.now()
          }
          
          const addRequest = store.put(imageData)
          
          addRequest.onsuccess = () => {
            console.log(`[ImageStorage] Imagem salva no IndexedDB: ${key}`)
            resolve(true)
          }
          
          addRequest.onerror = () => {
            console.error(`[ImageStorage] Erro ao salvar imagem no IndexedDB: ${key}`)
            resolve(false)
          }
        }
      })
    } catch (error) {
      console.error('[ImageStorage] Erro geral no IndexedDB:', error)
      return false
    }
  }

  // Recuperar imagem do IndexedDB
  static async getImageFromIndexedDB(key: string): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null

      return new Promise((resolve) => {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)
        
        request.onerror = () => {
          console.error('[ImageStorage] Erro ao abrir IndexedDB para leitura')
          resolve(null)
        }
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          
          if (!db.objectStoreNames.contains('images')) {
            console.warn('[ImageStorage] Object store "images" não encontrado para leitura')
            resolve(null)
            return
          }
          
          try {
            const transaction = db.transaction(['images'], 'readonly')
            const store = transaction.objectStore('images')
            
            transaction.onerror = () => {
               console.error('[ImageStorage] Erro na transação de leitura')
               resolve(null)
             }
             
             const getRequest = store.get(key)
             
             getRequest.onsuccess = () => {
               const result = getRequest.result
               if (result) {
                 console.log(`[ImageStorage] Imagem recuperada do IndexedDB: ${key}`)
                 resolve(result.dataUrl)
               } else {
                 resolve(null)
               }
             }
             
             getRequest.onerror = () => {
               console.error(`[ImageStorage] Erro ao recuperar imagem do IndexedDB: ${key}`)
               resolve(null)
             }
           } catch (transactionError) {
             console.error('[ImageStorage] Erro ao criar transação:', transactionError)
             resolve(null)
           }
        }
      })
    } catch (error) {
      console.error('[ImageStorage] Erro geral ao recuperar do IndexedDB:', error)
      return null
    }
  }

  // Salvar também no localStorage como backup
  static saveImageToLocalStorage(key: string, dataUrl: string): boolean {
    try {
      if (typeof window === 'undefined') return false
      
      const images = this.getImagesFromLocalStorage()
      
      // Verificar tamanho total antes de adicionar
      const totalSize = Object.values(images).reduce((size, img) => size + img.length, 0)
      if (totalSize + dataUrl.length > this.MAX_STORAGE_SIZE) {
        console.warn('[ImageStorage] Limite de armazenamento atingido, removendo imagens antigas')
        this.cleanOldImages()
      }
      
      images[key] = dataUrl
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images))
      console.log(`[ImageStorage] Imagem salva no localStorage: ${key}`)
      return true
    } catch (error) {
      console.error('[ImageStorage] Erro ao salvar no localStorage:', error)
      return false
    }
  }

  // Recuperar imagem do localStorage
  static getImageFromLocalStorage(key: string): string | null {
    try {
      if (typeof window === 'undefined') return null
      
      const images = this.getImagesFromLocalStorage()
      return images[key] || null
    } catch (error) {
      console.error('[ImageStorage] Erro ao recuperar do localStorage:', error)
      return null
    }
  }

  // Recuperar todas as imagens do localStorage
  private static getImagesFromLocalStorage(): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('[ImageStorage] Erro ao parsear imagens do localStorage:', error)
      return {}
    }
  }

  // Limpar imagens antigas para liberar espaço
  private static cleanOldImages(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('[ImageStorage] Cache de imagens limpo')
    } catch (error) {
      console.error('[ImageStorage] Erro ao limpar cache:', error)
    }
  }

  // Método principal para salvar imagem com redundância
  static async saveImage(key: string, dataUrl: string, metadata: any = {}): Promise<boolean> {
    const indexedDBSuccess = await this.saveImageToIndexedDB(key, dataUrl, metadata)
    const localStorageSuccess = this.saveImageToLocalStorage(key, dataUrl)
    
    return indexedDBSuccess || localStorageSuccess
  }

  // Método principal para recuperar imagem com fallback
  static async getImage(key: string): Promise<string | null> {
    // Tentar IndexedDB primeiro (mais robusto)
    let image = await this.getImageFromIndexedDB(key)
    
    // Fallback para localStorage
    if (!image) {
      image = this.getImageFromLocalStorage(key)
    }
    
    return image
  }

  // Gerar chave única para imagem baseada no path e timestamp
  static generateImageKey(contentPath: string, fileName: string): string {
    const sanitizedPath = contentPath.replace(/[^a-zA-Z0-9]/g, '_')
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_')
    return `${sanitizedPath}_${timestamp}_${sanitizedFileName}`
  }

  // Limpar IndexedDB corrompido
  static async clearIndexedDB(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false
      
      return new Promise((resolve) => {
        const deleteRequest = indexedDB.deleteDatabase(this.DB_NAME)
        
        deleteRequest.onsuccess = () => {
          console.log('[ImageStorage] IndexedDB limpo com sucesso')
          resolve(true)
        }
        
        deleteRequest.onerror = () => {
          console.error('[ImageStorage] Erro ao limpar IndexedDB')
          resolve(false)
        }
        
        deleteRequest.onblocked = () => {
          console.warn('[ImageStorage] Limpeza do IndexedDB bloqueada')
          resolve(false)
        }
      })
    } catch (error) {
      console.error('[ImageStorage] Erro geral ao limpar IndexedDB:', error)
      return false
    }
  }

  // Converter File para DataURL
  static fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        resolve(result)
      }
      reader.onerror = () => reject(new Error('Erro ao converter arquivo para DataURL'))
      reader.readAsDataURL(file)
    })
  }

  // Excluir uma imagem específica
  static async deleteImage(key: string): Promise<boolean> {
    try {
      let success = false
      
      // Excluir do localStorage
      if (typeof window !== 'undefined') {
        const images = this.getImagesFromLocalStorage()
        if (images[key]) {
          delete images[key]
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images))
          console.log(`[ImageStorage] Imagem removida do localStorage: ${key}`)
          success = true
        }
      }
      
      // Excluir do IndexedDB
      const indexedDBSuccess = await new Promise<boolean>((resolve) => {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (db.objectStoreNames.contains('images')) {
            try {
              const transaction = db.transaction(['images'], 'readwrite')
              const store = transaction.objectStore('images')
            const deleteRequest = store.delete(key)
            
              deleteRequest.onsuccess = () => {
                console.log(`[ImageStorage] Imagem removida do IndexedDB: ${key}`)
                resolve(true)
              }
              
              deleteRequest.onerror = () => {
                console.error(`[ImageStorage] Erro ao remover imagem do IndexedDB: ${key}`)
                resolve(false)
              }
            } catch (transactionError) {
              console.error('[ImageStorage] Erro ao criar transação de exclusão:', transactionError)
              resolve(false)
            }
          } else {
            resolve(false)
          }
        }
        request.onerror = () => resolve(false)
      })
      
      return success || indexedDBSuccess
    } catch (error) {
      console.error('[ImageStorage] Erro ao excluir imagem:', error)
      return false
    }
  }

  // Limpar todas as imagens armazenadas
  static async clearAllImages(): Promise<void> {
    try {
      // Limpar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY)
      }
      
      // Limpar IndexedDB
      return new Promise((resolve) => {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (db.objectStoreNames.contains('images')) {
            try {
              const transaction = db.transaction(['images'], 'readwrite')
              const store = transaction.objectStore('images')
              store.clear()
              console.log('[ImageStorage] Todas as imagens foram removidas')
            } catch (transactionError) {
              console.error('[ImageStorage] Erro ao limpar IndexedDB:', transactionError)
            }
          }
          resolve()
        }
        request.onerror = () => resolve()
      })
    } catch (error) {
      console.error('[ImageStorage] Erro ao limpar imagens:', error)
    }
  }
}