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
      this.syncToCloud()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('[SyncService] Conexão perdida - modo offline ativado')
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

  // Recuperar conteúdo (local ou nuvem)
  static async getContent(): Promise<any> {
    try {
      // Se Supabase configurado e online, tentar buscar da nuvem primeiro
      if (this.isSupabaseConfigured() && this.isOnline) {
        const cloudContent = await this.getContentFromCloud()
        if (cloudContent) {
          // Salvar localmente para cache
          await this.saveContentLocally(cloudContent)
          return cloudContent
        }
      }

      // Fallback para conteúdo local
      return this.getContentFromLocal()
    } catch (error) {
      console.error('[SyncService] Erro ao recuperar conteúdo:', error)
      return this.getContentFromLocal()
    }
  }

  // Buscar conteúdo da nuvem
  private static async getContentFromCloud(): Promise<any> {
    try {
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
        throw error
      }

      console.log('[SyncService] Conteúdo recuperado da nuvem')
      return data.content
    } catch (error) {
      console.error('[SyncService] Erro ao buscar conteúdo da nuvem:', error)
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

  // Sincronizar para a nuvem
  static async syncToCloud(): Promise<boolean> {
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

      console.log('[SyncService] Sincronizando conteúdo para a nuvem...')
      
      const { error } = await supabase
        .from('site_content')
        .upsert({
          id: 'main',
          content,
          updated_at: new Date().toISOString()
        })

      if (error) {
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

      console.log('[SyncService] Conteúdo sincronizado com sucesso!')
      this.syncInProgress = false
      return true
    } catch (error) {
      console.error('[SyncService] Erro na sincronização:', error)
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

  // Inicializar serviço
  static initialize(): void {
    this.initializeOnlineDetection()
    
    // Tentar sincronizar na inicialização se online
    if (this.isOnline && this.isSupabaseConfigured()) {
      setTimeout(() => this.syncToCloud(), 1000)
    }
  }
}

// Inicializar automaticamente no cliente
if (typeof window !== 'undefined') {
  SyncService.initialize()
}