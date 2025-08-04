import { createClient } from "@supabase/supabase-js"
import { ImageStorageService } from './image-storage'

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
    // Em modo de desenvolvimento sem Supabase configurado, retornar null silenciosamente
    if (isDevMode) {
      console.log("[siteContentService] Modo desenvolvimento - Supabase não configurado")
      return null
    }
    
    console.log("[siteContentService] getSiteContent: Tentando buscar conteúdo do Supabase.")
    try {
      const { data, error } = await supabase.from("site_content").select("content").eq("id", "main").single()

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.warn(
            "[siteContentService] Tabela site_content ainda não existe. Use o script SQL ou a UI do Supabase para criá-la.",
          )
          return null
        }
        if (error.code === "PGRST116") {
          // No rows returned - this is normal for first time
          console.log("[siteContentService] Nenhuma linha encontrada para 'main' na tabela site_content.")
          return null
        }
        console.error("[siteContentService] Erro ao buscar conteúdo:", error)
        return null
      }
      console.log("[siteContentService] Conteúdo buscado com sucesso:", data?.content)
      return data?.content || null
    } catch (error) {
      console.error("[siteContentService] Erro em getSiteContent (catch):", error)
      return null
    }
  },

  async updateSiteContent(content: any): Promise<boolean> {
    // Em modo de desenvolvimento sem Supabase configurado, simular sucesso
    if (isDevMode) {
      console.log("[siteContentService] Modo desenvolvimento - Simulando atualização de conteúdo")
      return true
    }
    
    console.log("[siteContentService] updateSiteContent: Tentando atualizar conteúdo no Supabase.", content)
    try {
      const { error } = await supabase.from("site_content").upsert(
        {
          id: "main",
          content,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.warn(
            "[siteContentService] Tabela site_content ainda não existe. Alterações serão mantidas apenas no navegador.",
          )
          return false
        }
        console.error("[siteContentService] Erro ao atualizar conteúdo:", error)
        return false
      }
      console.log("[siteContentService] Conteúdo atualizado com sucesso no Supabase.")
      return true
    } catch (error) {
      console.error("[siteContentService] Erro em updateSiteContent (catch):", error)
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
