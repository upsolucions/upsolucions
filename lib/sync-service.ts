"use client"

import { supabase } from './supabase'
import { ImageStorageService } from './image-storage'

// Serviço de sincronização entre dispositivos
export class SyncService {
  private static readonly SYNC_KEY = 'lastSyncTimestamp'
  private static readonly CONTENT_KEY = 'siteContent'
  private static isOnline = true
  private static syncInProgress = false

  // Verificar se o Supabase está configurado
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    return !url.includes('localhost') && !url.includes('your-project') && url.startsWith('https://')
  }

  // Detectar se está online
  static initializeOnlineDetection(): void {
    if (typeof window === 'undefined') return

    this.isOnline = navigator.onLine
    
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('[SyncService] Conexão restaurada - iniciando sincronização')
      this.startBackgroundSync()
      this.syncToCloud()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('[SyncService] Conexão perdida - modo offline ativado')
      this.stopBackgroundSync()
    })
  }

  // Salvar conteúdo localmente
  static async saveContentLocally(content: any): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false

      const contentData = {
        content,
        timestamp: Date.now(),
        synced: false
      }

      localStorage.setItem(this.CONTENT_KEY, JSON.stringify(contentData))
      console.log('[SyncService] Conteúdo salvo localmente')
      
      // Tentar sincronizar se online e Supabase configurado
      if (this.isOnline && this.isSupabaseConfigured()) {
        this.syncToCloud()
      }
      
      return true
    } catch (error) {
      console.error('[SyncService] Erro ao salvar conteúdo localmente:', error)
      return false
    }
  }

  // Recuperar conteúdo (local ou nuvem) com resolução de conflitos
  static async getContent(): Promise<any> {
    try {
      console.log('[SyncService] Obtendo conteúdo...')
      
      // Primeiro, tentar obter do localStorage
      const localContent = this.getContentFromLocal()
      const localTimestamp = localStorage.getItem(this.SYNC_KEY)
      
      // Se estiver offline ou não configurado, retornar conteúdo local
      if (!this.isOnline || !this.isSupabaseConfigured()) {
        console.log('[SyncService] Usando conteúdo local (offline ou não configurado)')
        return localContent
      }
      
      // Tentar obter da nuvem
      const cloudResult = await this.getContentFromCloudWithTimestamp()
      
      if (cloudResult) {
        const { content: cloudContent, timestamp: cloudTimestamp } = cloudResult
        
        // Verificar se há conflito (conteúdo local mais recente que o da nuvem)
        if (localTimestamp && cloudTimestamp) {
          const localTime = parseInt(localTimestamp)
          const cloudTime = new Date(cloudTimestamp).getTime()
          
          if (localTime > cloudTime) {
            console.log('[SyncService] Conteúdo local mais recente que o da nuvem - resolvendo conflito')
            
            if (this.CONFLICT_RESOLUTION_STRATEGY === 'latest_wins') {
              // Usar conteúdo local e sincronizar para a nuvem
              console.log('[SyncService] Usando conteúdo local (mais recente) e sincronizando para nuvem')
              this.syncToCloud()
              return localContent
            }
          }
        }
        
        // Salvar conteúdo da nuvem localmente
        await this.saveContentLocally(cloudContent)
        return cloudContent
      }
      
      // Se falhar, retornar conteúdo local
      console.log('[SyncService] Falha ao obter da nuvem, usando conteúdo local')
      return localContent
    } catch (error) {
      console.error('[SyncService] Erro ao recuperar conteúdo:', error)
      return this.getContentFromLocal()
    }
  }

  // Buscar conteúdo da nuvem com timestamp
  private static async getContentFromCloudWithTimestamp(retryCount = 0): Promise<{content: any, timestamp: string} | null> {
    const maxRetries = 3
    const retryDelay = Math.pow(2, retryCount) * 1000

    try {
      console.log(`[SyncService] Buscando conteúdo da nuvem com timestamp... (tentativa ${retryCount + 1}/${maxRetries + 1})`)
      
      const { data, error } = await supabase
        .from('site_content')
        .select('content, updated_at')
        .eq('id', 'main')
        .single()

      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST205') {
          console.info('[SyncService] Tabela não existe ou sem permissões - usando conteúdo local')
          return null
        }
        
        if (retryCount < maxRetries && this.isRetryableError(error)) {
          console.warn(`[SyncService] Erro temporário, tentando novamente em ${retryDelay}ms:`, error.message)
          await this.delay(retryDelay)
          return this.getContentFromCloudWithTimestamp(retryCount + 1)
        }
        
        throw error
      }

      if (data) {
        console.log('[SyncService] Conteúdo recuperado da nuvem com timestamp')
        localStorage.setItem('lastSuccessfulFetch', new Date().toISOString())
        return {
          content: data.content,
          timestamp: data.updated_at
        }
      }

      return null
    } catch (error) {
      if (retryCount < maxRetries && this.isNetworkError(error)) {
        console.warn(`[SyncService] Erro de rede, tentando novamente em ${retryDelay}ms:`, error)
        await this.delay(retryDelay)
        return this.getContentFromCloudWithTimestamp(retryCount + 1)
      }
      
      console.error('[SyncService] Erro ao buscar conteúdo da nuvem após todas as tentativas:', error)
      return null
    }
  }

  // Buscar conteúdo da nuvem com retry automático
  private static async getContentFromCloud(retryCount = 0): Promise<any> {
    const maxRetries = 3
    const retryDelay = Math.pow(2, retryCount) * 1000 // Exponential backoff

    try {
      console.log(`[SyncService] Buscando conteúdo da nuvem... (tentativa ${retryCount + 1}/${maxRetries + 1})`)
      
      const { data, error } = await supabase
        .from('site_content')
        .select('content, updated_at')
        .eq('id', 'main')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('[SyncService] Nenhum conteúdo encontrado na nuvem')
          return null
        }
        if (error.code === 'PGRST205') {
          console.log('[SyncService] Tabela site_content não encontrada - Supabase não configurado')
          return null
        }
        
        // Retry para erros temporários
        if (retryCount < maxRetries && this.isRetryableError(error)) {
          console.warn(`[SyncService] Erro temporário, tentando novamente em ${retryDelay}ms:`, error.message)
          await this.delay(retryDelay)
          return this.getContentFromCloud(retryCount + 1)
        }
        
        throw error
      }

      console.log('[SyncService] Conteúdo recuperado da nuvem')
      localStorage.setItem('lastSuccessfulFetch', new Date().toISOString())
      return data.content
    } catch (error) {
      // Retry para erros de rede
      if (retryCount < maxRetries && this.isNetworkError(error)) {
        console.warn(`[SyncService] Erro de rede, tentando novamente em ${retryDelay}ms:`, error)
        await this.delay(retryDelay)
        return this.getContentFromCloud(retryCount + 1)
      }
      
      // Não logar erro se for problema de configuração
      if ((error as { code?: string }).code === 'PGRST205') {
        console.log('[SyncService] Supabase não configurado corretamente')
      } else {
        console.error('[SyncService] Erro ao buscar conteúdo da nuvem após todas as tentativas:', error)
      }
      return null
    }
  }

  // Buscar conteúdo local
  private static getContentFromLocal(): any {
    try {
      if (typeof window === 'undefined') return null

      const stored = localStorage.getItem(this.CONTENT_KEY)
      if (!stored) return null

      const data = JSON.parse(stored)
      console.log('[SyncService] Conteúdo recuperado localmente')
      return data.content
    } catch (error) {
      console.error('[SyncService] Erro ao recuperar conteúdo local:', error)
      return null
    }
  }

  // Sincronizar para a nuvem com retry automático
  static async syncToCloud(retryCount = 0): Promise<boolean> {
    const maxRetries = 3
    const retryDelay = Math.pow(2, retryCount) * 1000 // Exponential backoff

    if (this.syncInProgress || !this.isSupabaseConfigured() || !this.isOnline) {
      return false
    }

    this.syncInProgress = true

    try {
      const localData = localStorage.getItem(this.CONTENT_KEY)
      if (!localData) {
        this.syncInProgress = false
        return true
      }

      const { content, synced } = JSON.parse(localData)
      
      if (synced) {
        this.syncInProgress = false
        return true
      }

      console.log(`[SyncService] Sincronizando conteúdo para a nuvem... (tentativa ${retryCount + 1}/${maxRetries + 1})`)
      
      const { error } = await supabase
        .from('site_content')
        .upsert({
          id: 'main',
          content,
          updated_at: new Date().toISOString()
        })

      if (error) {
        // Tratar erros específicos do Supabase
        if (error.code === 'PGRST116') {
          console.info('[SyncService] Tabela site_content não existe - usando modo local')
          this.syncInProgress = false
          return false
        }
        if (error.code === 'PGRST205') {
          console.info('[SyncService] Sem permissões para atualizar - usando modo local')
          this.syncInProgress = false
          return false
        }
        
        // Retry para erros de rede ou temporários
        if (retryCount < maxRetries && this.isRetryableError(error)) {
          console.warn(`[SyncService] Erro temporário, tentando novamente em ${retryDelay}ms:`, error.message)
          this.syncInProgress = false
          await this.delay(retryDelay)
          return this.syncToCloud(retryCount + 1)
        }
        
        throw error
      }

      // Marcar como sincronizado
      const updatedData = {
        content,
        timestamp: Date.now(),
        synced: true
      }
      localStorage.setItem(this.CONTENT_KEY, JSON.stringify(updatedData))
      localStorage.setItem(this.SYNC_KEY, Date.now().toString())
      localStorage.setItem('lastSuccessfulSync', new Date().toISOString())

      console.log('[SyncService] Conteúdo sincronizado com sucesso!')
      this.syncInProgress = false
      return true
    } catch (error) {
      // Retry para erros de rede
      if (retryCount < maxRetries && this.isNetworkError(error)) {
        console.warn(`[SyncService] Erro de rede, tentando novamente em ${retryDelay}ms:`, error)
        this.syncInProgress = false
        await this.delay(retryDelay)
        return this.syncToCloud(retryCount + 1)
      }
      
      console.error('[SyncService] Erro na sincronização após todas as tentativas:', error)
      this.syncInProgress = false
      return false
    }
  }

  // Sincronizar imagens para a nuvem
  static async syncImagesToCloud(): Promise<void> {
    if (!this.isSupabaseConfigured() || !this.isOnline) return

    try {
      // Esta funcionalidade pode ser implementada futuramente
      // para sincronizar imagens do IndexedDB para o Supabase Storage
      console.log('[SyncService] Sincronização de imagens não implementada ainda')
    } catch (error) {
      console.error('[SyncService] Erro ao sincronizar imagens:', error)
    }
  }

  // Verificar status de sincronização
  static getSyncStatus(): {
    isOnline: boolean
    isSupabaseConfigured: boolean
    lastSync: Date | null
    hasPendingChanges: boolean
  } {
    const lastSyncTimestamp = localStorage.getItem(this.SYNC_KEY)
    const localData = localStorage.getItem(this.CONTENT_KEY)
    
    let hasPendingChanges = false
    if (localData) {
      try {
        const { synced } = JSON.parse(localData)
        hasPendingChanges = !synced
      } catch (error) {
        console.error('[SyncService] Erro ao verificar mudanças pendentes:', error)
      }
    }

    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : this.isOnline,
      isSupabaseConfigured: this.isSupabaseConfigured(),
      lastSync: lastSyncTimestamp ? new Date(parseInt(lastSyncTimestamp)) : null,
      hasPendingChanges
    }
  }

  // Forçar sincronização manual
  static async forcSync(): Promise<boolean> {
    console.log('[SyncService] Forçando sincronização manual...')
    return await this.syncToCloud()
  }

  // Limpar dados locais
  static clearLocalData(): void {
    try {
      localStorage.removeItem(this.CONTENT_KEY)
      localStorage.removeItem(this.SYNC_KEY)
      console.log('[SyncService] Dados locais limpos')
    } catch (error) {
      console.error('[SyncService] Erro ao limpar dados locais:', error)
    }
  }

  // Métodos auxiliares para retry
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private static isRetryableError(error: any): boolean {
    // Erros que podem ser resolvidos com retry
    const retryableCodes = ['PGRST301', 'PGRST302', '23505'] // Rate limit, timeout, unique violation
    return retryableCodes.includes(error.code) || error.message?.includes('timeout')
  }

  private static isNetworkError(error: any): boolean {
    // Erros de rede que podem ser resolvidos com retry
    return error.name === 'NetworkError' || 
           error.message?.includes('fetch') ||
           error.message?.includes('network') ||
           error.code === 'NETWORK_ERROR'
  }

  // Sistema de sincronização em background
  private static syncInterval: NodeJS.Timeout | null = null
  private static readonly SYNC_INTERVAL_MS = 30000 // 30 segundos
  private static readonly CONFLICT_RESOLUTION_STRATEGY = 'latest_wins' // ou 'manual'

  // Inicializar serviço
  static initialize(): void {
    console.log('[SyncService] Inicializando serviço de sincronização...')
    this.initializeOnlineDetection()
    
    // Detectar quando a aba fica visível novamente
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.isOnline) {
          console.log('[SyncService] Aba ficou visível - verificando sincronização')
          this.syncToCloud()
        }
      })
    }
    
    // Tentar sincronizar na inicialização se online
    if (this.isOnline && this.isSupabaseConfigured()) {
      this.startBackgroundSync()
      setTimeout(() => this.syncToCloud(), 1000)
    }
  }

  // Iniciar sincronização em background
  private static startBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        console.log('[SyncService] Sincronização automática em background')
        this.syncToCloud()
      }
    }, this.SYNC_INTERVAL_MS)
    
    console.log('[SyncService] Sincronização em background iniciada')
  }

  // Parar sincronização em background
  private static stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('[SyncService] Sincronização em background parada')
    }
  }
}

// Inicializar automaticamente no cliente
if (typeof window !== 'undefined') {
  SyncService.initialize()
}