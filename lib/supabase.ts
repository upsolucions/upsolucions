import { createClient } from "@supabase/supabase-js"
import { ImageStorageService } from './image-storage'
import { SyncService } from './sync-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://localhost:54321"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

// Verificar se estamos em modo de desenvolvimento sem Supabase configurado
const isDevMode = supabaseUrl.includes('localhost') || supabaseUrl.includes('your-project')

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface SiteContent {
  id?: string
  content: any
  updated_at?: string
}

export const siteContentService = {
  async getSiteContent(): Promise<any> {
    console.log("[siteContentService] getSiteContent: Buscando conteúdo...")
    try {
      // Usar o novo sistema de sincronização
      const content = await SyncService.getContent()
      console.log("[siteContentService] Conteúdo recuperado:", content ? "Encontrado" : "Não encontrado")
      return content
    } catch (error) {
      console.error("[siteContentService] Erro em getSiteContent:", error)
      return null
    }
  },

  async updateSiteContent(content: any): Promise<boolean> {
    console.log("[siteContentService] updateSiteContent: Salvando conteúdo...", content)
    try {
      // Usar o novo sistema de sincronização
      const success = await SyncService.saveContentLocally(content)
      console.log("[siteContentService] Conteúdo salvo:", success ? "Sucesso" : "Falha")
      return success
    } catch (error) {
      console.error("[siteContentService] Erro em updateSiteContent:", error)
      return false
    }
  },

  async uploadImage(file: File, storagePath: string): Promise<string | null> {
    try {
      // Gerar chave única para a imagem
      const imageKey = ImageStorageService.generateImageKey(storagePath, file.name)
      
      if (isDevMode) {
        console.log(`[siteContentService] Modo desenvolvimento - Processando upload de imagem para '${storagePath}'`)
        
        // Converter arquivo para Data URL
        const dataUrl = await ImageStorageService.fileToDataUrl(file)
        
        // Salvar no sistema de armazenamento robusto
        const saved = await ImageStorageService.saveImage(imageKey, dataUrl, {
          originalName: file.name,
          path: storagePath,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        })
        
        if (saved) {
          console.log('[siteContentService] Imagem salva com sucesso:', imageKey)
          return dataUrl
        } else {
          console.warn('[siteContentService] Falha ao salvar imagem, usando Data URL temporária')
          return dataUrl
        }
      }

      // Modo produção - tentar upload para Supabase
      console.log(`[siteContentService] uploadImage: Iniciando upload de arquivo para '${storagePath}'.`)
      const { error: uploadError } = await supabase.storage.from("site-images").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("[siteContentService] Erro ao fazer upload da imagem para Supabase Storage:", uploadError)
        
        // Fallback para armazenamento local em caso de erro
        console.log('[siteContentService] Usando armazenamento local como fallback')
        const dataUrl = await ImageStorageService.fileToDataUrl(file)
        await ImageStorageService.saveImage(imageKey, dataUrl, {
          originalName: file.name,
          path: storagePath,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          fallback: true
        })
        return dataUrl
      }

      const { data } = supabase.storage.from("site-images").getPublicUrl(storagePath)
      console.log("[siteContentService] Imagem enviada. URL pública gerada:", data.publicUrl)
      
      // Salvar também localmente para cache
      const dataUrl = await ImageStorageService.fileToDataUrl(file)
      await ImageStorageService.saveImage(imageKey, dataUrl, {
        originalName: file.name,
        path: storagePath,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        supabaseUrl: data.publicUrl
      })
      
      return data.publicUrl
    } catch (error) {
      console.error("[siteContentService] Erro em uploadImage (catch):", error)
      
      // Último fallback - tentar salvar localmente
      try {
        const imageKey = ImageStorageService.generateImageKey(storagePath, file.name)
        const dataUrl = await ImageStorageService.fileToDataUrl(file)
        await ImageStorageService.saveImage(imageKey, dataUrl, {
          originalName: file.name,
          path: storagePath,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          emergency: true
        })
        console.log('[siteContentService] Imagem salva em modo de emergência')
        return dataUrl
      } catch (fallbackError) {
        console.error('[siteContentService] Falha completa no upload:', fallbackError)
        return null
      }
    }
  },
}
