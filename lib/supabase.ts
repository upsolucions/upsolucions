import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface SiteContent {
  id?: string
  content: any
  updated_at?: string
}

export const siteContentService = {
  async getSiteContent(): Promise<any> {
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
    console.log(`[siteContentService] uploadImage: Iniciando upload de arquivo para '${storagePath}'.`)
    try {
      const { error: uploadError } = await supabase.storage.from("site-images").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false, // With unique filenames, upsert: false is fine.
      })

      if (uploadError) {
        console.error("[siteContentService] Erro ao fazer upload da imagem para Supabase Storage:", uploadError)
        // Check for specific error codes, e.g., RLS policy violation
        if (uploadError.statusCode === "403" || uploadError.message.includes("Policy")) {
          console.error(
            "[siteContentService] Possível erro de política RLS no Storage. Verifique as políticas do bucket 'site-images'.",
          )
        }
        return null
      }

      const { data } = supabase.storage.from("site-images").getPublicUrl(storagePath)
      console.log("[siteContentService] Imagem enviada. URL pública gerada:", data.publicUrl)
      return data.publicUrl
    } catch (error) {
      console.error("[siteContentService] Erro em uploadImage (Supabase service - catch):", error)
      return null
    }
  },
}
